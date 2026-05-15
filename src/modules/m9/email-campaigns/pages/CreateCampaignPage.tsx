'use client';

import React, { useState, useMemo } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    Mail,
    Users,
    FileText,
    Send,
    Check,
    AlertCircle,
    Info,
    ShieldCheck,
    XCircle,
    CheckCircle2,
    TriangleAlert,
    Code,
    Eye,
    Zap,
    Calendar,
    Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreateCampaignPayload, EmailTemplate, SegmentRulesPayload } from '../types/campaign.types';
import { SegmentRuleBuilder } from '../components/SegmentRuleBuilder';
import { useContacts } from '../hooks/useContacts';
import { useTemplates } from '../hooks/useTemplates';
import { emailCampaignService } from '../services/emailCampaignService';

import { 
    validateCompliance, 
    getCompliantHtml, 
    getUnknownVariables, 
    COMPLIANCE_FOOTER 
} from '../utils/compliance';

// ============================================================================
// STEP DEFINITIONS
// ============================================================================

const STEPS = [
    { id: 'basics', label: 'Basics', icon: Mail, description: 'Campaign details' },
    { id: 'audience', label: 'Audience', icon: Users, description: 'Choose recipients' },
    { id: 'content', label: 'Content', icon: FileText, description: 'Template & preview' },
    { id: 'review', label: 'Review & Comply', icon: ShieldCheck, description: 'Final checks' },
    { id: 'send', label: 'Send', icon: Send, description: 'Schedule or send' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

// ============================================================================
// INITIAL STATE
// ============================================================================

const INITIAL_RULES: SegmentRulesPayload = {
    logic: 'AND',
    rules: [{ id: 'init', field: 'last_order_days', operator: '>', value: '' }],
};

const INITIAL_DATA: CreateCampaignPayload = {
    name: '',
    subject: '',
    previewText: '',
    senderName: '',
    replyTo: '',
    templateId: '',
    segmentId: 'all',
    storeId: undefined,
    scheduledAt: undefined,
    rulesJson: undefined,
};

// ============================================================================
// REUSABLE UI PIECES
// ============================================================================

/** Standard form label */
const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

/** Standard text input */
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        {...props}
        className={`w-full h-11 px-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400
            focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all ${props.className || ''}`}
    />
);

/** Stat card for audience numbers */
const StatCard: React.FC<{ label: string; value: number; variant?: 'default' | 'success' | 'danger' }> = ({ label, value, variant = 'default' }) => {
    const styles = {
        default: 'bg-slate-50 border-slate-200',
        success: 'bg-emerald-50 border-emerald-200',
        danger: 'bg-rose-50 border-rose-200',
    };
    const textStyles = {
        default: 'text-slate-800',
        success: 'text-emerald-700',
        danger: 'text-rose-700',
    };
    return (
        <div className={`p-4 rounded-lg border ${styles[variant]}`}>
            <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${textStyles[variant]}`}>{value.toLocaleString()}</p>
        </div>
    );
};

// ============================================================================
// STEP COMPONENTS
// ============================================================================

interface StepProps {
    data: CreateCampaignPayload;
    onChange: (updates: Partial<CreateCampaignPayload>) => void;
    onValidate?: (isValid: boolean) => void;
}

/** Step 1: Campaign basics */
const BasicsStep: React.FC<StepProps> = ({ data, onChange, onValidate }) => {
    React.useEffect(() => {
        onValidate?.(true);
    }, [onValidate]);

    return (
    <div className="max-w-2xl space-y-6">
        <div>
            <Label required>Campaign Name</Label>
            <Input
                type="text"
                value={data.name}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="e.g. Spring Sale Announcement"
            />
            <p className="mt-1.5 text-xs text-slate-400">Internal name — not visible to recipients.</p>
        </div>

        <div>
            <Label required>Email Subject</Label>
            <Input
                type="text"
                value={data.subject}
                onChange={(e) => onChange({ subject: e.target.value })}
                placeholder="e.g. 🔥 Don't miss our spring sale!"
            />
            <p className="mt-1.5 text-xs text-slate-400">Shown in the inbox. Keep it under 60 characters for best results.</p>
        </div>

        <div>
            <Label>Preview Text</Label>
            <Input
                type="text"
                value={data.previewText}
                onChange={(e) => onChange({ previewText: e.target.value })}
                placeholder="Short summary shown next to the subject line"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <Label required>Sender Name</Label>
                <Input
                    type="text"
                    value={data.senderName}
                    onChange={(e) => onChange({ senderName: e.target.value })}
                    placeholder="e.g. Zyappy"
                />
            </div>
            <div>
                <Label required>Reply-To Email</Label>
                <Input
                    type="email"
                    value={data.replyTo}
                    onChange={(e) => onChange({ replyTo: e.target.value })}
                    placeholder="e.g. hello@zyappy.com"
                />
            </div>
        </div>
    </div>
    );
};

/** Step 2: Audience */
const AudienceStep: React.FC<StepProps> = ({ data, onChange, onValidate }) => {
    const { data: eligibility, loading, error } = useContacts();
    const [localRules, setLocalRules] = useState<SegmentRulesPayload>(data.rulesJson || INITIAL_RULES);

    // Sync rules to parent state
    const handleRulesChange = (payload: SegmentRulesPayload) => {
        setLocalRules(payload);
        onChange({ rulesJson: payload });
    };

    // Handle segment type change
    const handleSegmentChange = (value: string) => {
        onChange({ segmentId: value });
        if (value === 'custom') {
            onChange({ segmentId: value, rulesJson: localRules });
        } else {
            onChange({ segmentId: value, rulesJson: undefined });
        }
    };

    // Validate: custom segment needs at least 1 rule with a value
    React.useEffect(() => {
        if (data.segmentId === 'custom') {
            const hasValidRule = localRules.rules.length > 0 && localRules.rules.some(r => {
                if (Array.isArray(r.value)) return r.value.length > 0;
                return String(r.value).trim() !== '';
            });
            onValidate?.(hasValidRule);
        } else if (!loading && !error && eligibility) {
            onValidate?.(eligibility.eligible > 0);
        } else if (error) {
            onValidate?.(true);
        }
    }, [data.segmentId, localRules, eligibility, loading, error, onValidate]);

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <Label required>Audience</Label>
                <select
                    value={data.segmentId}
                    onChange={(e) => handleSegmentChange(e.target.value)}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800
                        focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all appearance-none
                        bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M6%208l4%204%204-4%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10"
                >
                    <option value="all">All Contacts</option>
                    <option value="custom">Custom Segment (Build Rules)</option>
                </select>
            </div>

            {/* Rule Builder — visible when custom segment is selected */}
            {data.segmentId === 'custom' && (
                <div className="p-5 bg-white border border-slate-200 rounded-xl">
                    <SegmentRuleBuilder value={localRules} onChange={handleRulesChange} />
                </div>
            )}

            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">Calculating audience size…</p>
                </div>
            ) : error ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    <p className="text-sm text-rose-700">Failed to load audience data. Please try again.</p>
                </div>
            ) : eligibility ? (
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard label="Total contacts" value={eligibility.total} />
                        <StatCard label="Eligible to receive" value={eligibility.eligible} variant="success" />
                        <StatCard label="Excluded" value={eligibility.excluded} variant="danger" />
                    </div>

                    {eligibility.excluded > 0 && (
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                                <Info className="w-4 h-4 text-slate-400" />
                                Exclusion reasons
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'No Consent', count: eligibility.reasons.noConsent },
                                    { label: 'Unsubscribed', count: eligibility.reasons.unsubscribed },
                                    { label: 'Suppressed', count: eligibility.reasons.suppressed },
                                    { label: 'Invalid', count: eligibility.reasons.invalid },
                                ].map((item) => (
                                    <div key={item.label} className="px-4 py-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                                        <span className="text-xs text-slate-500">{item.label}</span>
                                        <span className="text-sm font-bold text-slate-800">{item.count.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

// ── Content Step Constants ───────────────────────────────────────────

// Default placeholder fallbacks (used if backend unreachable)
const DEFAULT_PLACEHOLDERS: Record<string, string> = {
    '{{customer_name}}': 'John Doe',
    '{{first_name}}': 'John',
    '{{email}}': 'recipient@example.com',
    '{{store_name}}': 'Your Store',
    '{{brand_name}}': 'Your Brand',
    '{{unsubscribe_url}}': '#unsubscribe-preview',
    '{{business_address}}': 'Not configured',
    '{{contact_email}}': 'Not configured',
    '{{contact_phone}}': '',
};

function replaceVariables(html: string, placeholders: Record<string, string> = DEFAULT_PLACEHOLDERS): string {
    let result = html;
    Object.entries(placeholders).forEach(([key, value]) => {
        result = result.split(key).join(value);
    });
    return result;
}

/** Step 3: Content */
const ContentStep: React.FC<StepProps> = ({ data, onChange, onValidate }) => {
    const { data: templates, loading, error } = useTemplates();
    const [testEmail, setTestEmail] = useState('');
    const [sendingTest, setSendingTest] = useState(false);
    const [testFeedback, setTestFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [placeholders, setPlaceholders] = useState<Record<string, string>>(DEFAULT_PLACEHOLDERS);

    // Fetch real placeholder values from backend settings
    React.useEffect(() => {
        const fetchPlaceholders = async () => {
            try {
                const { default: apiClient } = await import('@/api/axios');
                const res = await apiClient.get('/email-campaigns/settings/preview-placeholders');
                if (res.data && typeof res.data === 'object') {
                    setPlaceholders({ ...DEFAULT_PLACEHOLDERS, ...res.data });
                }
            } catch {
                // Fallback to defaults silently
            }
        };
        fetchPlaceholders();
    }, []);

    const selectedTemplate = templates.find((t: EmailTemplate) => t.id === data.templateId);

    // Sync template HTML to customHtml on first selection
    React.useEffect(() => {
        if (selectedTemplate && !data.customHtml) {
            // Strip footer if present to avoid double footer
            const baseHtml = selectedTemplate.htmlBody.replace(COMPLIANCE_FOOTER, '');
            onChange({ customHtml: baseHtml });
        }
    }, [selectedTemplate, data.customHtml, onChange]);

    const currentHtml = data.customHtml || selectedTemplate?.htmlBody || '';
    const compliance = validateCompliance(currentHtml);
    const unknownVars = getUnknownVariables(currentHtml);

    // Validation
    const hasTemplate = !!data.templateId;
    const hasHtml = !!currentHtml.trim();
    const isValid = hasTemplate && hasHtml && compliance.valid;
    
    const fullHtml = getCompliantHtml(currentHtml);

    React.useEffect(() => {
        onValidate?.(isValid);
    }, [isValid, onValidate]);

    const handleSendTest = async () => {
        if (!testEmail || !isValid) return;
        setSendingTest(true);
        setTestFeedback(null);
        try {
            await emailCampaignService.sendTestEmail(testEmail, {
                templateId: data.templateId,
                templateHtml: fullHtml
            });
            setTestFeedback({ type: 'success', message: 'Test email sent!' });
        } catch (err) {
            setTestFeedback({ type: 'error', message: 'Failed to send test.' });
        } finally {
            setSendingTest(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* ── Template Selection ──────────────────────────────────── */}
            <section>
                <Label required>Select Template</Label>
                {loading ? (
                    <div className="flex gap-3 mt-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 w-40 bg-slate-100 rounded-lg animate-pulse shrink-0" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">Failed to load templates.</div>
                ) : (
                    <div className="flex gap-3 mt-2 overflow-x-auto pb-2">
                        {templates.map((template) => {
                            const isSelected = data.templateId === template.id;
                            return (
                                <button
                                    key={template.id}
                                    onClick={() => onChange({ templateId: template.id, customHtml: template.htmlBody.replace(COMPLIANCE_FOOTER, '') })}
                                    className={`shrink-0 w-44 text-left p-4 rounded-xl border-2 transition-all duration-200
                                        ${isSelected
                                            ? 'border-brand bg-brand/5 shadow-sm'
                                            : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-sm font-semibold truncate ${isSelected ? 'text-brand-dark' : 'text-slate-700'}`}>
                                            {template.name}
                                        </span>
                                        {isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="h-10 bg-slate-50 rounded border border-slate-100" />
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── Two column: Editor + Preview ────────────────────────── */}
            {data.templateId && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: HTML Editor */}
                    <section className="space-y-3">
                        <button
                            onClick={() => setEditorOpen(!editorOpen)}
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                        >
                            <Code size={16} className="text-slate-400" />
                            HTML Editor
                            <ArrowRight size={14} className={`text-slate-400 transition-transform duration-200 ${editorOpen ? 'rotate-90' : ''}`} />
                        </button>

                        {editorOpen && (
                            <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-400">template.html</span>
                                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Editable</span>
                                </div>
                                <textarea
                                    value={data.customHtml || ''}
                                    onChange={(e) => onChange({ customHtml: e.target.value })}
                                    className="w-full h-[320px] p-4 font-mono text-sm text-slate-300 bg-transparent outline-none resize-none leading-relaxed"
                                    placeholder="Paste or write your HTML content..."
                                />
                                {unknownVars.length > 0 && (
                                    <div className="px-4 py-2 bg-amber-900/30 border-t border-amber-500/20 flex items-center gap-2">
                                        <TriangleAlert size={14} className="text-amber-400 shrink-0" />
                                        <p className="text-xs text-amber-300">
                                            Unknown variables: {unknownVars.join(', ')}
                                        </p>
                                    </div>
                                )}
                                <div className="px-4 py-2.5 bg-emerald-900/20 border-t border-emerald-500/10 flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-emerald-400" />
                                    <span className="text-xs text-emerald-400/80">
                                        {compliance.valid ? 'Compliant' : 'Compliance footer will be auto-appended'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {!editorOpen && (
                            <p className="text-xs text-slate-400 pl-6">Click to edit the raw HTML of this template.</p>
                        )}
                    </section>

                    {/* Right: Live Preview */}
                    <section className="space-y-3">
                        <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Eye size={16} className="text-slate-400" /> Preview
                        </p>
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            {/* Fake browser chrome */}
                            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-300" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                                </div>
                                <div className="flex-1 max-w-xs mx-auto h-6 bg-white border border-slate-200 rounded flex items-center px-3 text-[11px] text-slate-400">
                                    outlook.zyappy.com/inbox/preview
                                </div>
                            </div>

                            <div className="max-h-[420px] overflow-y-auto">
                                <div className="px-6 py-3 border-b border-slate-100 flex gap-2 text-xs">
                                    <span className="font-semibold text-slate-400 shrink-0">Subject:</span>
                                    <span className="font-medium text-slate-800">{replaceVariables(selectedTemplate?.subject || data.subject || '(No Subject)', placeholders)}</span>
                                </div>
                                <div 
                                    className="p-6 preview-container"
                                    dangerouslySetInnerHTML={{ __html: replaceVariables(fullHtml, placeholders) }}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* No template selected empty state */}
            {!data.templateId && (
                <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                        <Mail className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Select a template above to preview your email</p>
                </div>
            )}

            {/* Test Email */}
            {data.templateId && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                        <Send size={14} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-600">Send test</span>
                    </div>
                    <div className="flex-1 w-full sm:w-auto">
                        <Input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="test@example.com"
                            className="!h-9 !text-xs"
                        />
                    </div>
                    <button
                        onClick={handleSendTest}
                        disabled={!isValid || !testEmail || sendingTest}
                        className="h-9 px-5 bg-brand text-white rounded-lg text-xs font-semibold hover:bg-brand-dark disabled:bg-slate-200 disabled:text-slate-400 transition-all shrink-0"
                    >
                        {sendingTest ? 'Sending…' : 'Send Test'}
                    </button>
                    {testFeedback && (
                        <span className={`text-xs font-medium ${testFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {testFeedback.message}
                        </span>
                    )}
                </div>
            )}

            {/* Compliance Alert */}
            {data.templateId && !compliance.valid && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800">Missing compliance tags</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            A compliance footer will be auto-appended to meet CAN-SPAM requirements.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {compliance.missing.map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-amber-100 text-xs font-mono text-amber-700 rounded border border-amber-200">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


/** Step 4: Review & Compliance Gate */
const ReviewStep: React.FC<StepProps> = ({ data, onValidate }) => {
    const { data: eligibility, loading: audienceLoading } = useContacts();
    const { data: templates } = useTemplates();
    const [complianceChecked, setComplianceChecked] = useState(false);
    const [placeholders, setPlaceholders] = useState<Record<string, string>>(DEFAULT_PLACEHOLDERS);

    // Fetch real placeholder values from backend settings
    React.useEffect(() => {
        const fetchPlaceholders = async () => {
            try {
                const { default: apiClient } = await import('@/api/axios');
                const res = await apiClient.get('/email-campaigns/settings/preview-placeholders');
                if (res.data && typeof res.data === 'object') {
                    setPlaceholders({ ...DEFAULT_PLACEHOLDERS, ...res.data });
                }
            } catch {
                // Fallback to defaults silently
            }
        };
        fetchPlaceholders();
    }, []);

    const selectedTemplate = templates.find((t: EmailTemplate) => t.id === data.templateId);

    // ── Compliance checks ──────────────────────────────────────────────
    const rawHtml = data.customHtml || selectedTemplate?.htmlBody || '';
    const compliance = validateCompliance(rawHtml);
    
    const complianceChecks = useMemo(() => [
        {
            id: 'unsubscribe',
            label: 'Unsubscribe link',
            passed: rawHtml.includes('{{unsubscribe_url}}') || !compliance.missing.includes('{{unsubscribe_url}}'),
            desc: 'Required by CAN-SPAM for all promotional emails.'
        },
        {
            id: 'sender_id',
            label: 'Sender identity & address',
            passed: !!(data.senderName && data.replyTo && (rawHtml.includes('{{business_address}}') || !compliance.missing.includes('{{business_address}}'))),
            desc: 'Business name and physical address must be present.'
        },
        {
            id: 'contact',
            label: 'Contact information',
            passed: rawHtml.includes('{{contact_email}}') || !compliance.missing.includes('{{contact_email}}'),
            desc: 'Clear way for recipients to reach the sender.'
        },
        {
            id: 'consent',
            label: 'Recipient consent verified',
            passed: !!(eligibility && eligibility.eligible > 0),
            desc: 'Only targeting contacts with "Subscribed" status.'
        },
        {
            id: 'suppression',
            label: 'Suppression list applied',
            passed: !!(eligibility && (eligibility.reasons.unsubscribed > 0 || eligibility.reasons.suppressed >= 0)),
            desc: 'Global and list-level opt-outs are respected.'
        },
    ], [data.templateId, data.senderName, data.replyTo, eligibility, rawHtml, compliance]);

    const allChecksPassed = complianceChecks.every((c) => c.passed);
    const hasAudience = !!data.segmentId && (eligibility?.eligible ?? 0) > 0;
    
    // Strict block logic
    const isBlocked = !allChecksPassed || !hasAudience || !complianceChecked;

    React.useEffect(() => {
        onValidate?.(!isBlocked);
    }, [isBlocked, onValidate]);

    const finalPreviewHtml = getCompliantHtml(rawHtml);

    return (
        <div className="space-y-6">
            {/* Status banner */}
            <div className={`p-4 rounded-lg flex items-center gap-4 ${isBlocked ? 'bg-rose-50 border border-rose-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isBlocked ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                    {isBlocked ? <TriangleAlert size={20} className="text-white" /> : <ShieldCheck size={20} className="text-white" />}
                </div>
                <div>
                    <p className={`text-sm font-bold ${isBlocked ? 'text-rose-800' : 'text-emerald-800'}`}>
                        {isBlocked ? 'Action needed before sending' : 'Ready to send'}
                    </p>
                    <p className={`text-xs ${isBlocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isBlocked ? 'Complete all checks below to proceed.' : 'All compliance checks passed.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Summary + Audience */}
                <div className="space-y-6">
                    {/* Campaign Summary */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Mail size={14} className="text-slate-400" /> Campaign Summary
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {[
                                { label: 'Name', value: data.name },
                                { label: 'Subject', value: data.subject },
                                { label: 'Sender', value: data.senderName ? `${data.senderName} <${data.replyTo}>` : '' },
                                { label: 'Schedule', value: data.scheduledAt || 'Send immediately' },
                            ].map((f) => (
                                <div key={f.label} className="flex px-5 py-3.5 text-sm">
                                    <span className="w-24 text-xs font-medium text-slate-400 pt-0.5 shrink-0">{f.label}</span>
                                    <span className="font-medium text-slate-800 flex-1">
                                        {f.value || <span className="text-rose-500 text-xs">Missing</span>}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Audience card */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Users size={14} className="text-slate-400" /> Audience
                            </h3>
                        </div>
                        {audienceLoading ? (
                             <div className="p-8 space-y-3">
                                <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
                                <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
                             </div>
                        ) : eligibility ? (
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <StatCard label="Total" value={eligibility.total} />
                                    <StatCard label="Eligible" value={eligibility.eligible} variant={eligibility.eligible > 0 ? 'success' : 'danger'} />
                                    <StatCard label="Excluded" value={eligibility.excluded} variant="danger" />
                                </div>
                                {eligibility.excluded > 0 && (
                                     <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: 'Opted Out', count: eligibility.reasons.unsubscribed },
                                            { label: 'No Consent', count: eligibility.reasons.noConsent },
                                            { label: 'Suppressed', count: eligibility.reasons.suppressed },
                                            { label: 'Invalid', count: eligibility.reasons.invalid },
                                        ].map((r) => (
                                            <div key={r.label} className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                                                <span className="text-xs text-slate-500">{r.label}</span>
                                                <span className="text-xs font-bold text-slate-700">{r.count.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-sm text-slate-400">Audience data unavailable.</div>
                        )}
                    </div>
                </div>

                {/* Right: Compliance + Preview */}
                <div className="space-y-6">
                    {/* Compliance checklist */}
                    <div className={`bg-white border rounded-xl overflow-hidden ${allChecksPassed ? 'border-emerald-200' : 'border-rose-200'}`}>
                        <div className={`px-5 py-3 border-b flex items-center justify-between ${allChecksPassed ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                            <h3 className={`text-sm font-semibold flex items-center gap-2 ${allChecksPassed ? 'text-emerald-800' : 'text-rose-800'}`}>
                                <ShieldCheck size={14} /> Compliance
                            </h3>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full 
                                ${allChecksPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {allChecksPassed ? 'All passed' : 'Action required'}
                            </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                             {complianceChecks.map((check) => (
                                <div key={check.id} className="px-5 py-3.5 flex items-start gap-3">
                                    <div className={`mt-0.5 shrink-0 ${check.passed ? 'text-emerald-500' : 'text-rose-400'}`}>
                                        {check.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${check.passed ? 'text-slate-800' : 'text-rose-800'}`}>
                                            {check.label}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{check.desc}</p>
                                    </div>
                                    <span className={`text-[10px] font-semibold uppercase mt-0.5 shrink-0
                                        ${check.passed ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {check.passed ? 'OK' : 'FAIL'}
                                    </span>
                                </div>
                             ))}
                        </div>
                    </div>

                    {/* Final preview */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                            <Eye size={14} className="text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700">Final Email Preview</span>
                        </div>
                        <div className="p-5 max-h-[300px] overflow-y-auto">
                            <div 
                                className="preview-container text-sm leading-relaxed text-slate-600"
                                dangerouslySetInnerHTML={{ 
                                    __html: replaceVariables(finalPreviewHtml, placeholders) 
                                }}
                            />
                        </div>
                    </div>

                    {/* Confirmation checkbox */}
                    <label className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer select-none transition-all duration-200
                        ${complianceChecked
                            ? 'bg-brand/5 border-brand'
                            : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                        <div className="relative mt-0.5">
                            <input
                                type="checkbox"
                                checked={complianceChecked}
                                onChange={(e) => setComplianceChecked(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className={`w-5 h-5 border-2 rounded transition-all flex items-center justify-center
                                ${complianceChecked ? 'border-brand bg-brand' : 'border-slate-300'}`}>
                                {complianceChecked && <Check size={13} className="text-white" />}
                            </div>
                        </div>
                        <div>
                            <p className={`text-sm font-semibold ${complianceChecked ? 'text-brand-dark' : 'text-slate-800'}`}>
                                I confirm this campaign complies with email regulations
                            </p>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                You have permission to contact this audience and the template includes valid unsubscribe links and business details.
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            {/* High exclusion warning */}
            {!isBlocked && (eligibility?.excluded ?? 0) > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                    <TriangleAlert size={18} className="text-amber-500 shrink-0" />
                    <div>
                         <p className="text-sm font-semibold text-amber-800">High exclusion rate</p>
                         <p className="text-xs text-amber-600">{eligibility?.excluded.toLocaleString()} contacts don&apos;t meet consent criteria and will be excluded.</p>
                    </div>
                </div>
            )}
        </div>
    );
};


/** Step 5: Send */
const SendStep: React.FC<StepProps> = ({ data, onChange }) => {
    const isScheduled = !!data.scheduledAt;

    return (
        <div className="max-w-2xl mx-auto space-y-6 py-4">
            <div className="text-center mb-8">
                <div className="w-14 h-14 bg-brand rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-brand/20 mb-4">
                    <Send className="text-white w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">When should we send?</h2>
                <p className="text-sm text-slate-500 mt-1">Choose to send now or schedule for later.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Send Now */}
                <button 
                    onClick={() => onChange({ scheduledAt: undefined })}
                    className={`p-5 rounded-xl border-2 text-left transition-all duration-200
                        ${!isScheduled 
                            ? 'border-brand bg-brand/5 shadow-sm' 
                            : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-lg ${!isScheduled ? 'bg-brand/10' : 'bg-slate-50'}`}>
                             <Zap size={20} className={!isScheduled ? 'text-brand-dark' : 'text-slate-400'} />
                        </div>
                        {!isScheduled && (
                            <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                    <h3 className={`text-sm font-bold mb-1 ${!isScheduled ? 'text-brand-dark' : 'text-slate-700'}`}>Send immediately</h3>
                    <p className={`text-xs leading-relaxed ${!isScheduled ? 'text-brand-dark/60' : 'text-slate-400'}`}>
                        Starts sending within minutes of confirmation.
                    </p>
                </button>

                {/* Schedule */}
                <button 
                    onClick={() => { if (!data.scheduledAt) onChange({ scheduledAt: new Date().toISOString().slice(0, 16) })}}
                    className={`p-5 rounded-xl border-2 text-left transition-all duration-200
                        ${isScheduled 
                            ? 'border-brand bg-brand/5 shadow-sm' 
                            : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-lg ${isScheduled ? 'bg-brand/10' : 'bg-slate-50'}`}>
                             <Calendar size={20} className={isScheduled ? 'text-brand-dark' : 'text-slate-400'} />
                        </div>
                        {isScheduled && (
                            <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                    <h3 className={`text-sm font-bold mb-1 ${isScheduled ? 'text-brand-dark' : 'text-slate-700'}`}>Schedule for later</h3>
                    <p className={`text-xs leading-relaxed ${isScheduled ? 'text-brand-dark/60' : 'text-slate-400'}`}>
                        Pick a date & time to maximize engagement.
                    </p>
                </button>
            </div>

            {isScheduled && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" /> Scheduled date & time
                    </label>
                    <input
                        type="datetime-local"
                        value={data.scheduledAt || ''}
                        onChange={(e) => onChange({ scheduledAt: e.target.value || undefined })}
                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                    />
                </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                    Once confirmed, your campaign settings will be locked. You can pause or cancel from the dashboard after scheduling.
                </p>
            </div>
        </div>
    );
};

// ============================================================================
// WIZARD
// ============================================================================

export const CreateCampaignPage: React.FC = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [campaignData, setCampaignData] = useState<CreateCampaignPayload>(INITIAL_DATA);
    const [isStepValid, setIsStepValid] = useState(true);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [warningMsg, setWarningMsg] = useState<string | null>(null);

    // Reset validation state whenever step changes
    React.useEffect(() => {
        setIsStepValid(true);
        setErrorMsg(null);
    }, [currentStep]);

    const step = STEPS[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === STEPS.length - 1;

    const handleDataChange = (updates: Partial<CreateCampaignPayload>) => {
        setCampaignData((prev) => ({ ...prev, ...updates }));
    };

    const handleNext = () => {
        if (!isLast && isStepValid) {
            setCurrentStep((s) => s + 1);
            setIsStepValid(true);
        }
    };

    const handleBack = () => {
        if (!isFirst) {
            setCurrentStep((s) => s - 1);
            setIsStepValid(true);
        }
    };

    const handleSubmit = async (asDraft = false) => {
        setSubmissionStatus('submitting');
        setErrorMsg(null);
        setWarningMsg(null);
        
        try {
            const finalPayload = {
                ...campaignData,
                sendNow: asDraft ? false : !campaignData.scheduledAt,
                scheduledAt: asDraft ? undefined : campaignData.scheduledAt,
                customHtml: campaignData.customHtml ? getCompliantHtml(campaignData.customHtml) : undefined
            };

            // If saving as draft with no HTML, still send what we have
            if (asDraft && !finalPayload.customHtml) {
                finalPayload.customHtml = undefined;
            }
            
            const result = await emailCampaignService.createCampaign(finalPayload);
            
            // Check for warning from backend (compliance issues etc.)
            if ((result as any)?.warning) {
                setWarningMsg((result as any).warning);
            }
            
            setSubmissionStatus('success');
            
            // Auto-redirect after a short delay
            setTimeout(() => {
                router.push('/backoffice/email-campaigns');
            }, 3000);
        } catch (err: any) {
            console.error('[CreateCampaign] FAILED:', err);
            setSubmissionStatus('error');
            // Backend returns { error: '...' }, not { message: '...' }
            const backendError = err?.response?.data?.error 
                || err?.response?.data?.message 
                || err?.response?.data?.details?.join?.(', ')
                || err?.message
                || 'Something went wrong. Please try again.';
            setErrorMsg(backendError);
        }
    };

    const STEP_COMPONENTS: Record<StepId, React.FC<StepProps>> = {
        basics: BasicsStep,
        audience: AudienceStep,
        content: ContentStep,
        review: ReviewStep,
        send: SendStep,
    };

    const ActiveStepComponent = step ? STEP_COMPONENTS[step.id] : null;

    // ── Success State ────────────────────────────────────────────────────
    if (submissionStatus === 'success') {
        return (
            <div className="max-w-lg mx-auto min-h-[500px] flex items-center justify-center px-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm w-full">
                    <div className="w-16 h-16 bg-emerald-500 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-100 mb-6">
                         <Check size={32} className="text-white" strokeWidth={3} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Campaign Created!</h1>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
                        Your campaign <span className="text-brand-dark font-semibold">&ldquo;{campaignData.name}&rdquo;</span> has been {campaignData.scheduledAt ? 'scheduled' : 'queued for sending'}.
                    </p>
                    
                    <button 
                        onClick={() => router.push('/backoffice/email-campaigns')}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                    >
                        Go to Campaigns
                    </button>
                    <p className="text-xs text-slate-400 mt-4">Redirecting automatically…</p>
                </div>
            </div>
        );
    }

    // ── Main Wizard ──────────────────────────────────────────────────────
    return (
        <div className="max-w-[960px] mx-auto pb-20 px-4 lg:px-6">

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 py-5 mb-2">
                <button 
                    disabled={submissionStatus === 'submitting'}
                    onClick={() => router.push('/backoffice/email-campaigns')} 
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30"
                >
                    <ArrowLeft size={18} className="text-slate-500" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-800">Create Campaign</h1>
                </div>
            </div>

            {/* ── Stepper ─────────────────────────────────────────────── */}
            <nav className={`flex items-center mb-8 transition-opacity ${submissionStatus === 'submitting' ? 'opacity-30 pointer-events-none' : ''}`}>
                {STEPS.map((s, idx) => {
                    const isActive = idx === currentStep;
                    const isCompleted = idx < currentStep;
                    const isDisabled = idx > currentStep;
                    return (
                        <React.Fragment key={s.id}>
                            <button
                                onClick={() => { if (!isDisabled) { setIsStepValid(true); setCurrentStep(idx); } }}
                                disabled={isDisabled}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                                    ${isActive ? 'bg-brand/10 text-brand-dark' : 
                                      isCompleted ? 'text-brand-dark/70 hover:bg-brand/5' : 'text-slate-400 cursor-not-allowed'}`}
                            >
                                {/* Step number / check */}
                                <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-all
                                    ${isActive ? 'bg-brand text-white' :
                                      isCompleted ? 'bg-brand/20 text-brand-dark' : 'bg-slate-100 text-slate-400'}`}>
                                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                </div>
                                <span className="hidden sm:inline">{s.label}</span>
                            </button>
                            {idx < STEPS.length - 1 && (
                                <div className={`flex-1 h-px max-w-[40px] mx-1 ${isCompleted ? 'bg-brand/40' : 'bg-slate-200'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </nav>

            {/* ── Error banner ────────────────────────────────────────── */}
            {errorMsg && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3">
                     <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                     <div>
                        <p className="text-sm font-semibold text-rose-800">Failed to create campaign</p>
                        <p className="text-xs text-rose-600 mt-0.5">{errorMsg}</p>
                     </div>
                </div>
            )}

            {warningMsg && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                     <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                     <div>
                        <p className="text-sm font-semibold text-amber-800">Campaign saved with notice</p>
                        <p className="text-xs text-amber-600 mt-0.5">{warningMsg}</p>
                     </div>
                </div>
            )}

            {/* ── Step Content Card ───────────────────────────────────── */}
            <section className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all
                ${submissionStatus === 'submitting' ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                    <h2 className="text-base font-semibold text-slate-800">{step?.label}</h2>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {step?.description}
                    </p>
                </div>
                <div className="p-6">
                    {ActiveStepComponent && (
                        <ActiveStepComponent 
                            data={campaignData} 
                            onChange={handleDataChange} 
                            onValidate={(v) => setIsStepValid(v)}
                        />
                    )}
                </div>
            </section>

            {/* ── Footer Navigation ───────────────────────────────────── */}
            <div className="flex items-center justify-between mt-6">
                <button 
                    onClick={handleBack} 
                    disabled={isFirst || submissionStatus === 'submitting'} 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                {isLast ? (
                    <div className="flex items-center gap-3">
                        {/* Save as Draft */}
                        <button 
                            onClick={() => handleSubmit(true)} 
                            disabled={submissionStatus === 'submitting'}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
                        >
                            <FileText className="w-4 h-4" />
                            Save as Draft
                        </button>
                        {/* Send / Schedule */}
                        <button 
                            onClick={() => handleSubmit(false)} 
                            disabled={submissionStatus === 'submitting'}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all
                                ${submissionStatus === 'submitting' 
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                    : 'bg-brand text-white shadow-md shadow-brand/20 hover:bg-brand-dark active:scale-[0.98]'}`}
                        >
                            {submissionStatus === 'submitting' ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating…
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" /> {campaignData.scheduledAt ? 'Schedule Campaign' : 'Send Campaign'}
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleNext} 
                        disabled={!isStepValid} 
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg text-sm font-semibold shadow-md shadow-brand/20 hover:bg-brand-dark disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all active:scale-[0.98]"
                    >
                        Next <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};


export default CreateCampaignPage;
