'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    ArrowLeft,
    Save,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Code2,
    FileJson,
} from 'lucide-react';
import { segmentService } from '../services/segmentService';
import { SegmentRulesPayload, RulesJsonOutput } from '../types/campaign.types';
import { SegmentRuleBuilder, buildRulesJson, validateRules } from '../components/SegmentRuleBuilder';
import { ToastContainer, useToast } from '../components/Toast';

/**
 * SegmentCreatePage Component (M9 – Marketing / Customer Engagement)
 *
 * Production-grade segment creation page with:
 * - SegmentRuleBuilder for compliance-aware rule building
 * - Live summary panel with estimated audience count
 * - rules_json output preview for backend verification
 * - Full validation before save
 * - Backend persistence via POST /email-campaigns/segments
 */
export const SegmentCreatePage: React.FC = () => {
    const router = useRouter();
    const toast = useToast();

    const [name, setName] = useState('');
    const [rules, setRules] = useState<SegmentRulesPayload>({
        logic: 'AND',
        rules: [{ id: `r-${Date.now()}`, field: 'last_order_days', operator: '>', value: '' }],
    });
    const [saving, setSaving] = useState(false);
    const [showJsonPreview, setShowJsonPreview] = useState(false);

    // ── Derive rules_json output ───────────────────────────────────────
    const rulesJsonOutput: RulesJsonOutput | null = useMemo(() => {
        if (!name.trim()) return null;
        return buildRulesJson(name, rules);
    }, [name, rules]);

    // ── Derive validation ──────────────────────────────────────────────
    const validation = useMemo(() => {
        if (!rules.rules.length) return { valid: false, errors: ['No rules configured'] };
        return validateRules(rules.rules);
    }, [rules]);

    const nameValid = name.trim().length >= 2;

    // ── Handlers ───────────────────────────────────────────────────────
    const handleBack = () => {
        router.push('/backoffice/email-campaigns/segments');
    };

    const handleSave = async () => {
        if (!nameValid) {
            toast.error('Validation Failed', 'Segment name must be at least 2 characters.');
            return;
        }
        if (!validation.valid) {
            toast.error('Validation Failed', 'Please fix all rule errors before saving.');
            return;
        }

        try {
            setSaving(true);
            const created = await segmentService.createSegment({
                name: name.trim(),
                rules_json: rules,
                estimated_count: 0,
                status: 'active',
            } as any);
            toast.success('Segment Created', `"${created.name}" has been saved.`);
            // Navigate to the edit page for the newly created segment
            setTimeout(() => {
                router.push(`/backoffice/email-campaigns/segments/${created.id}/edit`);
            }, 800);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create segment';
            toast.error('Save Failed', message);
        } finally {
            setSaving(false);
        }
    };

    // ── Main Render ────────────────────────────────────────────────────
    return (
        <div className="max-w-[1200px] mx-auto space-y-6 pb-20 px-2 lg:px-4">
            {/* ── Toast Notifications ─────────────────────────────────── */}
            <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 pt-2">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Segment</h1>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                                Define a new audience segment
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* JSON Preview Toggle */}
                    <button
                        onClick={() => setShowJsonPreview(!showJsonPreview)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            showJsonPreview
                                ? 'bg-slate-900 text-emerald-400'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                        <Code2 className="w-3.5 h-3.5" />
                        rules_json
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving || !validation.valid || !nameValid}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Create Segment
                    </button>
                </div>
            </div>

            {/* ── JSON Preview Panel ────────────────────────────────────── */}
            {showJsonPreview && rulesJsonOutput && (
                <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 relative">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <FileJson className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Backend Output · rules_json</span>
                        </div>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                    </div>
                    <pre className="text-[11px] text-emerald-400 font-mono leading-relaxed overflow-x-auto">
                        {JSON.stringify(rulesJsonOutput, null, 2)}
                    </pre>
                </div>
            )}

            {/* ── Segment Name ─────────────────────────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                    Segment Identity
                </h2>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                        Segment Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. VIP Customers, Inactive 30+ Days, Pizza Lovers"
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold outline-none transition-all ${
                            name.length > 0 && !nameValid
                                ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                                : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50'
                        }`}
                    />
                    {name.length > 0 && !nameValid && (
                        <p className="text-xs text-rose-500 mt-1 ml-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Name must be at least 2 characters
                        </p>
                    )}
                </div>
            </section>

            {/* ── Rule Builder ──────────────────────────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                    Audience Configuration
                </h2>
                <SegmentRuleBuilder
                    value={rules}
                    onChange={setRules}
                    segmentName={name || 'New Segment'}
                    showSummary={true}
                />
            </section>

            {/* ── Validation Status ─────────────────────────────────────── */}
            <section className={`rounded-2xl border p-4 flex items-center gap-3 transition-all ${
                validation.valid && nameValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
                {validation.valid && nameValid ? (
                    <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-widest">Ready to save — all rules valid</span>
                    </>
                ) : (
                    <>
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <div className="text-xs font-bold">
                            <span className="uppercase tracking-widest">
                                {!nameValid ? 'Enter a segment name' : 'Fix rule errors before saving'}
                            </span>
                            {validation.errors.length > 0 && (
                                <span className="ml-2 font-normal text-amber-600">
                                    ({validation.errors.join(', ')})
                                </span>
                            )}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default SegmentCreatePage;
