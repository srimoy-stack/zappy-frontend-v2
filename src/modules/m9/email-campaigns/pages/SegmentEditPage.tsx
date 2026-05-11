'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Segment, SegmentRulesPayload, RulesJsonOutput } from '../types/campaign.types';
import { SegmentRuleBuilder, buildRulesJson, validateRules } from '../components/SegmentRuleBuilder';
import { DEV_SEED_SEGMENTS } from '../utils/segmentSeeds';
import { ToastContainer, useToast } from '../components/Toast';

/**
 * SegmentEditPage Component (M9 – Marketing / Customer Engagement)
 * 
 * Production-grade segment editor with:
 * - Integrated SegmentRuleBuilder (compliance-aware, multi-tenant, backend-compatible)
 * - Live summary panel with estimated audience count
 * - rules_json output preview for backend verification
 * - Full validation before save
 */
export const SegmentEditPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const segmentId = params.id as string;
    const toast = useToast();

    const [segment, setSegment] = useState<Segment | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showJsonPreview, setShowJsonPreview] = useState(false);

    // ── Fetch Segment ──────────────────────────────────────────────────
    useEffect(() => {
        const fetchSegment = async () => {
            try {
                setLoading(true);
                const data = await segmentService.getSegmentById(segmentId);
                setSegment(data);
                setError(null);
            } catch (err: unknown) {
                // In development: fallback to seed data if API is unavailable
                if (process.env.NODE_ENV === 'development') {
                    console.warn('[SegmentEditPage] API unavailable — falling back to dev seed data');
                    const seed = DEV_SEED_SEGMENTS.find((s) => s.id === segmentId);
                    if (seed) {
                        // Deep clone to avoid mutating the seed data
                        setSegment(JSON.parse(JSON.stringify(seed)));
                        setError(null);
                    } else {
                        setError(`Segment "${segmentId}" not found in seed data`);
                    }
                } else {
                    const message = err instanceof Error ? err.message : 'Failed to load segment';
                    setError(message);
                }
            } finally {
                setLoading(false);
            }
        };

        if (segmentId) {
            fetchSegment();
        }
    }, [segmentId]);

    // ── Derive rules_json output ───────────────────────────────────────
    const rulesJsonOutput: RulesJsonOutput | null = useMemo(() => {
        if (!segment || !segment.rules_json) return null;
        return buildRulesJson(segment.name, segment.rules_json);
    }, [segment]);

    // ── Derive validation ──────────────────────────────────────────────
    const validation = useMemo(() => {
        if (!segment?.rules_json) return { valid: false, errors: ['No rules configured'] };
        return validateRules(segment.rules_json.rules || []);
    }, [segment]);

    // ── Handlers ───────────────────────────────────────────────────────
    const handleBack = () => {
        router.push('/backoffice/email-campaigns/segments');
    };

    const handleUpdateRules = (rules: SegmentRulesPayload) => {
        if (!segment) return;
        setSegment({ ...segment, rules_json: rules });
    };

    const handleSave = async () => {
        if (!segment) return;
        
        // Validate before save
        if (!validation.valid) {
            toast.error('Validation Failed', 'Please fix all rule errors before saving.');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(false);
            
            await segmentService.updateSegment(segment.id, {
                name: segment.name,
                rules_json: segment.rules_json,
                status: segment.status
            });
            
            setSuccess(true);
            toast.success('Changes saved', `"${segment.name}" has been updated.`);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save changes';
            setError(message);
            toast.error('Save failed', message);
        } finally {
            setSaving(false);
        }
    };

    // ── Render States ──────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Segment...</p>
            </div>
        );
    }

    if (error && !segment) {
        return (
            <div className="max-w-[800px] mx-auto py-20 px-4">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-bold text-red-900">Unable to load segment</h2>
                    <p className="text-sm text-red-600 mt-2">{error}</p>
                    <button 
                        onClick={handleBack}
                        className="mt-6 px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 shadow-sm"
                    >
                        Back to Segments
                    </button>
                </div>
            </div>
        );
    }

    if (!segment) return null;

    const defaultRules: SegmentRulesPayload = { logic: 'AND', rules: [{ id: 'init', field: 'last_order_days', operator: '>', value: '' }] };

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
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Segment</h1>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                                {segment.name} · {segment.id}
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

                    {success && (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-2 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" />
                            Saved!
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving || !validation.valid}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
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
                        Segment Name
                    </label>
                    <input 
                        type="text"
                        value={segment.name}
                        onChange={(e) => setSegment({ ...segment, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
            </section>

            {/* ── Rule Builder ──────────────────────────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                    Audience Configuration
                </h2>
                <SegmentRuleBuilder 
                    value={segment.rules_json || defaultRules}
                    onChange={handleUpdateRules}
                    segmentName={segment.name}
                    showSummary={true}
                />
            </section>

            {/* ── Segment Metadata ──────────────────────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
                    Metadata
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Created On</p>
                        <p className="text-sm font-semibold text-slate-700 mt-1">
                            {new Date(segment.created_at).toLocaleDateString('en-US', {
                                month: 'long', day: 'numeric', year: 'numeric'
                            })}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Current Status</p>
                        <div className="mt-1 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${segment.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <span className="text-sm font-bold text-slate-700 capitalize">{segment.status}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Segment ID</p>
                        <p className="text-sm font-semibold text-slate-700 mt-1 font-mono">{segment.id}</p>
                    </div>
                </div>
            </section>

            {/* ── Spinner Animation ──────────────────────────────────────── */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            ` }} />
        </div>
    );
};

export default SegmentEditPage;
