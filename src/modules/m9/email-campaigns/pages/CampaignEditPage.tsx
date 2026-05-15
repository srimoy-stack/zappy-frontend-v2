'use client';

import React, { useState, useEffect } from 'react';
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
    Loader2,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { CreateCampaignPayload, SegmentRulesPayload } from '../types/campaign.types';
import { SegmentRuleBuilder } from '../components/SegmentRuleBuilder';
import { useContacts } from '../hooks/useContacts';
import { useTemplates } from '../hooks/useTemplates';
import { emailCampaignService } from '../services/emailCampaignService';
import { ToastContainer, useToast } from '../components/Toast';

import { 
    validateCompliance, 
    getCompliantHtml, 
    getUnknownVariables, 
    MANDATORY_TAGS, 
} from '../utils/compliance';

// ============================================================================
// STEP DEFINITIONS
// ============================================================================

const STEPS = [
    { id: 'basics', label: 'Basics', icon: Mail },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'review', label: 'Review & Comply', icon: ShieldCheck },
    { id: 'send', label: 'Save Changes', icon: Send },
] as const;

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

// Redundant constants removed, using shared utils.

// ============================================================================
// STEP COMPONENTS
// ============================================================================

interface StepProps {
    data: CreateCampaignPayload;
    onChange: (updates: Partial<CreateCampaignPayload>) => void;
    onValidate?: (isValid: boolean) => void;
}

const BasicsStep: React.FC<StepProps> = ({ data, onChange, onValidate }) => {
    useEffect(() => {
        onValidate?.(!!(data.name && data.subject && data.senderName && data.replyTo));
    }, [data, onValidate]);

    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Campaign Name *</label>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 border-indigo-100/30 outline-none transition-all"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Subject Line *</label>
                     <input
                        type="text"
                        value={data.subject}
                        onChange={(e) => onChange({ subject: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 border-indigo-100/30 outline-none transition-all"
                    />
                </div>
                <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Preview Text</label>
                     <input
                        type="text"
                        value={data.previewText}
                        onChange={(e) => onChange({ previewText: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 border-indigo-100/30 outline-none transition-all"
                    />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Sender Name *</label>
                     <input
                        type="text"
                        value={data.senderName}
                        onChange={(e) => onChange({ senderName: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 border-indigo-100/30 outline-none transition-all"
                    />
                </div>
                <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reply-To Email *</label>
                     <input
                        type="email"
                        value={data.replyTo}
                        onChange={(e) => onChange({ replyTo: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 border-indigo-100/30 outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    );
};

const AudienceStep: React.FC<StepProps> = ({ data, onChange, onValidate }) => {
    const { data: eligibility, loading } = useContacts();
    
    useEffect(() => {
        onValidate?.(data.segmentId === 'all' || (!!data.rulesJson && data.rulesJson.rules.length > 0));
    }, [data, onValidate]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Target Audience</label>
                <select
                    value={data.segmentId}
                    onChange={(e) => {
                        const val = e.target.value;
                        onChange({ segmentId: val, rulesJson: val === 'custom' ? (data.rulesJson || INITIAL_RULES) : undefined });
                    }}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all appearance-none"
                >
                    <option value="all">Global Customer List (All Contacts)</option>
                    <option value="custom">Custom Dynamic Segment</option>
                </select>
            </div>

            {data.segmentId === 'custom' && (
                <div className="p-6 bg-white border border-indigo-100 rounded-[2rem] shadow-sm">
                    <SegmentRuleBuilder 
                        value={data.rulesJson || INITIAL_RULES} 
                        onChange={(rules) => onChange({ rulesJson: rules })} 
                    />
                </div>
            )}

            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recalculating Reach...</p>
                </div>
            ) : eligibility && (
                <div className="grid grid-cols-3 gap-4">
                     <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-xl font-black text-slate-900">{eligibility.total.toLocaleString()}</p>
                    </div>
                    <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Eligible</p>
                        <p className="text-xl font-black text-emerald-700">{eligibility.eligible.toLocaleString()}</p>
                    </div>
                    <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Excluded</p>
                        <p className="text-xl font-black text-rose-700">{eligibility.excluded.toLocaleString()}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const ContentStep: React.FC<StepProps> = ({ data, onChange, onValidate }) => {
    const { data: templates, loading } = useTemplates();
    
    const compliance = validateCompliance(data.customHtml || '');
    const unknownVars = getUnknownVariables(data.customHtml || '');
    
    const isValid = !!(data.templateId && data.customHtml && compliance.valid);
    useEffect(() => {
        onValidate?.(isValid);
    }, [isValid, onValidate]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Template Engine</label>
                    {loading ? (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
                            <div className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                            {templates.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => onChange({ templateId: t.id, customHtml: t.htmlBody })}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group
                                        ${data.templateId === t.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 bg-slate-50 hover:border-slate-300'}`}
                                >
                                    <p className={`text-[11px] font-black uppercase tracking-tight truncate ${data.templateId === t.id ? 'text-indigo-700' : 'text-slate-900'}`}>{t.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{t.type}</p>
                                    {data.templateId === t.id && <div className="absolute top-2 right-2 text-indigo-600"><CheckCircle2 size={14} /></div>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {data.templateId && (
                    <div className="space-y-6">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Source Code Editor</label>
                        <div className="bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
                             <div className="px-5 py-3 bg-slate-800/50 border-b border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">campaign_content.html</span>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                </div>
                            </div>
                            <textarea 
                                value={data.customHtml || ''}
                                onChange={(e) => onChange({ customHtml: e.target.value })}
                                className="w-full h-[400px] bg-transparent p-6 text-slate-300 font-mono text-xs leading-relaxed outline-none resize-none"
                                placeholder="<html>...</html>"
                            />
                            {unknownVars.length > 0 && (
                                <div className="px-5 py-2 bg-amber-400/10 border-t border-amber-400/20 flex items-center gap-2">
                                    <TriangleAlert size={12} className="text-amber-400" />
                                    <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest text-amber-500">
                                        Warning: Unknown variables: {unknownVars.join(', ')}
                                    </p>
                                </div>
                            )}
                            <div className="px-5 py-3 bg-emerald-900/20 border-t border-emerald-400/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={12} className="text-emerald-400" />
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                        {compliance.valid ? 'Compliant' : 'Auto-Compliance Active'}
                                    </span>
                                </div>
                                {!compliance.valid && (
                                    <span className="text-[9px] text-emerald-400/60 font-medium italic">Footer will be auto-appended</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col h-full">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Real-time Visualization</label>
                <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-inner min-h-[500px] flex flex-col">
                    {data.customHtml ? (
                         <iframe 
                            srcDoc={getCompliantHtml(data.customHtml)}
                            title="Preview"
                            className="w-full h-full border-none"
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-4">
                            <Mail size={48} className="text-slate-400" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting content selection</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ReviewStep: React.FC<StepProps> = ({ data, onValidate }) => {
    const compliance = validateCompliance(data.customHtml || '');
    const isCompliant = compliance.valid;
    
    useEffect(() => {
        onValidate?.(isCompliant);
    }, [isCompliant, onValidate]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
             <div className={`p-8 rounded-[2.5rem] border-2 flex items-center gap-6
                ${isCompliant ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-rose-50 border-rose-100 text-rose-900'}`}>
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg
                    ${isCompliant ? 'bg-emerald-500 shadow-emerald-200 text-white' : 'bg-rose-500 shadow-rose-200 text-white'}`}>
                    {isCompliant ? <ShieldCheck size={32} /> : <AlertCircle size={32} />}
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">
                        {isCompliant ? 'Validation Clearance Granted' : 'Legal Compliance Failure'}
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70">
                        {isCompliant ? 'All required tokens and legal footers detected' : 'Campaign is missing mandatory regulatory links'}
                    </p>
                </div>
            </div>

            {!isCompliant && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MANDATORY_TAGS.map(tag => {
                        const hasTag = data.customHtml?.includes(tag);
                        return (
                            <div key={tag} className={`px-4 py-3 rounded-2xl border flex items-center justify-between
                                ${hasTag ? 'bg-emerald-50/50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                                <code className="text-[10px] font-black">{tag}</code>
                                {hasTag ? <Check size={14} /> : <XCircle size={14} />}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Configuration Manifest</h3>
                    <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
                <div className="p-6 grid grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Campaign</p>
                         <p className="text-sm font-black text-slate-900">{data.name}</p>
                    </div>
                    <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject</p>
                         <p className="text-sm font-black text-slate-900">{data.subject}</p>
                    </div>
                    <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Audience</p>
                         <p className="text-sm font-black text-slate-900">{data.segmentId === 'all' ? 'Entire Global List' : 'Dynamic Segment'}</p>
                    </div>
                    <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Identity</p>
                         <p className="text-sm font-black text-slate-900">{data.senderName} &lt;{data.replyTo}&gt;</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FinalStep: React.FC<StepProps> = () => {
    return (
        <div className="space-y-8 py-10 animate-in fade-in duration-500">
             <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200 mb-6">
                    <Send size={40} className="text-white rotate-12" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Final Authorization</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                    Review your changes carefully. Once saved, updated campaigns will use the new content for future dispatches.
                </p>
            </div>

            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                <Info size={20} className="text-amber-500 mt-1 shrink-0" />
                <div>
                     <p className="text-sm font-black text-amber-900 uppercase tracking-tight mb-1">Atomic Update Notice</p>
                     <p className="text-xs text-amber-700 font-medium leading-relaxed">
                        Saving these changes will immediately overwrite the existing campaign configuration. If the campaign is currently "Sending", 
                        some recipients may still receive the old content depending on the dispatch queue state.
                     </p>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// WIZARD MAIN
// ============================================================================

export const CampaignEditPage: React.FC = () => {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const toast = useToast();
    
    // ── Local States ──────────────────────────────────────────────────
    const [currentStep, setCurrentStep] = useState(0);
    const [campaignData, setCampaignData] = useState<CreateCampaignPayload>(INITIAL_DATA);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isStepValid, setIsStepValid] = useState(true);

    // ── Pre-fetch Data ────────────────────────────────────────────────
    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                setLoading(true);
                const data = await emailCampaignService.getCampaign(id);
                // Map Campaign back to CreateCampaignPayload
                setCampaignData({
                    name: data.name,
                    subject: data.subject,
                    previewText: data.previewText || '',
                    senderName: data.senderName || '',
                    replyTo: data.replyTo || '',
                    templateId: data.templateId || '',
                    customHtml: data.customHtml || '',
                    segmentId: data.segmentId || (data.audience === 'All Contacts' ? 'all' : 'custom'),
                    scheduledAt: data.scheduledAt,
                });
            } catch (err: any) {
                // Fallback for dev seeds if ID is camp-xxx
                if (process.env.NODE_ENV === 'development' && id.startsWith('camp-')) {
                     setCampaignData({ ...INITIAL_DATA, name: 'Sample Campaign' });
                } else {
                    const backendError = err?.response?.data?.error || err?.message || "Forbidden or non-existent resource.";
                    setErrorMsg(backendError);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
    }, [id]);

    const step = STEPS[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === STEPS.length - 1;

    const handleDataChange = (updates: Partial<CreateCampaignPayload>) => {
        setCampaignData(prev => ({ ...prev, ...updates }));
    };

    const handleNext = () => {
        if (!isLast && isStepValid) setCurrentStep(s => s + 1);
    };

    const handleBack = () => {
        if (!isFirst) setCurrentStep(s => s - 1);
    };

    const handleSubmit = async () => {
        setSaving(true);
        setErrorMsg(null);
        try {
            const finalData = {
                ...campaignData,
                customHtml: campaignData.customHtml ? getCompliantHtml(campaignData.customHtml) : undefined
            };
            await emailCampaignService.updateCampaign(id, finalData);
            toast.success("Changes Persisted", `Campaign "${campaignData.name}" updated successfully.`);
            setTimeout(() => router.push('/backoffice/email-campaigns'), 2000);
        } catch (err: any) {
            const backendError = err?.response?.data?.error 
                || err?.response?.data?.message 
                || err?.message 
                || "Failed to update campaign.";
            setErrorMsg(backendError);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
                <div className="scale-150"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" strokeWidth={1.5} /></div>
                <div className="text-center">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-1">Authenticating Resource</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hydrating data for ${id}...</p>
                </div>
            </div>
        );
    }

    const ActiveStepComponent = step ? {
        basics: BasicsStep,
        audience: AudienceStep,
        content: ContentStep,
        review: ReviewStep,
        send: FinalStep,
    }[step.id] : null;

    return (
        <div className="max-w-[1000px] mx-auto px-4 lg:px-6 pb-20 space-y-8 animate-in fade-in duration-700">
            <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

            {/* ── Progress Header ──────────────────────────────────────── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8 pt-2">
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/backoffice/email-campaigns')}
                        className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Modify Campaign</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                            Step {currentStep + 1} of {STEPS.length} &bull; {step?.label}
                        </p>
                    </div>
                </div>

                <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                    {STEPS.map((s, idx) => (
                        <div key={s.id} className="flex items-center">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${idx === currentStep ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400'}`}>
                                <s.icon size={18} />
                            </div>
                            {idx < STEPS.length - 1 && <div className="w-4 h-[2px] bg-slate-200 mx-1" />}
                        </div>
                    ))}
                </div>
            </header>

            {errorMsg && (
                <div className="p-5 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center gap-4 animate-in shake duration-500">
                    <div className="p-2.5 bg-rose-500 rounded-2xl text-white shadow-lg shadow-rose-200">
                        <TriangleAlert size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest leading-none mb-1">Authorization Rejected</p>
                        <p className="text-xs text-rose-600 font-bold">{errorMsg}</p>
                    </div>
                </div>
            )}

            {/* ── Wizard Body ───────────────────────────────────────────── */}
            <main className={`bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${saving ? 'opacity-40 pointer-events-none' : ''}`}>
                 <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{step?.label}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{id}</p>
                    </div>
                </div>
                <div className="p-8">
                     {ActiveStepComponent && (
                        <ActiveStepComponent 
                            data={campaignData}
                            onChange={handleDataChange}
                            onValidate={setIsStepValid}
                        />
                    )}
                </div>
            </main>

            {/* ── Nav Actions ───────────────────────────────────────────── */}
            <footer className="flex items-center justify-between pt-4">
                <button 
                    onClick={handleBack}
                    disabled={isFirst || saving}
                    className="px-8 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center gap-2"
                >
                    <ArrowLeft size={14} strokeWidth={3} /> Previous Section
                </button>

                {isLast ? (
                    <button 
                        onClick={handleSubmit} 
                        disabled={!isStepValid || saving}
                        className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-30 transition-all flex items-center gap-3"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                        Save Global Changes
                    </button>
                ) : (
                    <button 
                        onClick={handleNext}
                        disabled={!isStepValid || saving}
                        className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-30 transition-all flex items-center gap-3"
                    >
                        Proceed to {STEPS[currentStep + 1]?.label} <ArrowRight size={14} strokeWidth={3} />
                    </button>
                )}
            </footer>
        </div>
    );
};

export default CampaignEditPage;
