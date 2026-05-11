'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    FileText,
    Plus,
    Pencil,
    Copy,
    ArrowLeft,
    Save,
    AlertCircle,
    CheckCircle2,
    Code,
    ShieldCheck,
    Search,
    Image as ImageIcon,
    Layout,
    Trash2,
    Sparkles,
    ChevronRight,
    Smartphone,
    Monitor,
    TriangleAlert
} from 'lucide-react';
import { EmailTemplate, TemplateType } from '../types/campaign.types';
import { ToastContainer, useToast } from '../components/Toast';
import { 
    validateCompliance, 
    getCompliantHtml, 
    getUnknownVariables, 
    AVAILABLE_VARIABLES, 
} from '../utils/compliance';
import { emailCampaignService } from '../services/emailCampaignService';

// ============================================================================
// CONSTANTS & CONFIG
// ============================================================================

const TEMPLATE_TYPES: { value: TemplateType; label: string; color: string; desc: string }[] = [
    { value: 'promotional', label: 'Promotional', color: 'bg-indigo-50 text-indigo-700 ring-indigo-200', desc: 'Standard marketing announcements.' },
    { value: 'win-back', label: 'Win-back', color: 'bg-amber-50 text-amber-700 ring-amber-200', desc: 'Re-engage inactive customers.' },
    { value: 'vip-offer', label: 'VIP Offer', color: 'bg-emerald-50 text-emerald-700 ring-emerald-200', desc: 'Exclusive rewards for top spenders.' },
    { value: 'new-product', label: 'New Product', color: 'bg-blue-50 text-blue-700 ring-blue-200', desc: 'Announce seasonal arrivals.' },
    { value: 'seasonal', label: 'Seasonal', color: 'bg-rose-50 text-rose-700 ring-rose-200', desc: 'Holiday and event-based themes.' },
    { value: 'review-request', label: 'Review Request', color: 'bg-purple-50 text-purple-700 ring-purple-200', desc: 'Post-purchase feedback loop.' },
    { value: 'announcement', label: 'Store Announcement', color: 'bg-slate-100 text-slate-700 ring-slate-300', desc: 'Operational updates or major news.' },
    { value: 'custom', label: 'Custom', color: 'bg-slate-50 text-slate-600 ring-slate-200', desc: 'Blank slate for bespoke layouts.' },
];

const DEFAULT_HTML_CONTENT = `
<div style="max-width:600px;margin:20px auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);border:1px solid #f1f5f9;">
  <div style="padding:40px;text-align:center;">
    <h1 style="color:#0f172a;font-size:28px;font-weight:900;margin:0 0 16px;letter-spacing:-0.5px;">Hello {{customer_name}},</h1>
    <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 32px;">
      Exciting news from <strong>{{store_name}}</strong>! We've just launched our latest collection and we think you'll love it.
    </p>
    <a href="#" style="display:inline-block;padding:14px 32px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:bold;font-size:14px;box-shadow:0 10px 15px -3px rgba(99, 102, 241, 0.3);">
      Explore Collection
    </a>
  </div>
</div>`;


// ============================================================================
// HELPERS
// ============================================================================

function generateTemplateId() {
    return 'tpl-' + Math.random().toString(36).substring(2, 9);
}

function formatDateDisplay(dateStr?: string) {
    if (!dateStr) return 'Pending';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface EditorProps {
    initialData?: EmailTemplate | null;
    onSave: (tpl: EmailTemplate) => void;
    onCancel: () => void;
}

const TemplateEditor: React.FC<EditorProps> = ({ initialData, onSave, onCancel }) => {
    const toast = useToast();
    const isEditing = !!initialData;
    const [formData, setFormData] = useState<EmailTemplate>(initialData || {
        id: generateTemplateId(),
        name: '',
        subject: '',
        type: 'promotional',
        htmlBody: DEFAULT_HTML_CONTENT,
        plainTextBody: '',
        headerImage: '',
        footerBlock: '',
    });

    const [activeTab, setActiveTab] = useState<'design' | 'plain' | 'preview'>('design');
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [showVars, setShowVars] = useState(false);

    // Merge state with manual field changes
    const updateField = (field: keyof EmailTemplate, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Construct final HTML for preview (always compliant)
    const previewHtml = useMemo(() => {
        let full = '';
        if (formData.headerImage) {
            full += `<div style="text-align:center;margin-bottom:24px;"><img src="${formData.headerImage}" alt="Header" style="max-width:100%;height:auto;border-radius:12px;"></div>`;
        }
        full += formData.htmlBody;
        if (formData.footerBlock) {
            full += `<div style="margin-top:32px;padding:20px;background:#f8fafc;border-radius:12px;color:#64748b;font-size:13px;">${formData.footerBlock}</div>`;
        }
        
        return getCompliantHtml(full);
    }, [formData.htmlBody, formData.headerImage, formData.footerBlock]);

    // Compliance Check
    const compliance = useMemo(() => validateCompliance(formData.htmlBody), [formData.htmlBody]);
    const unknownVars = useMemo(() => getUnknownVariables(formData.htmlBody), [formData.htmlBody]);

    const handleSave = () => {
        console.log('[TemplateEditor] handleSave triggered', formData);
        if (!formData.name.trim()) {
            toast.error('Validation Error', 'Template name is required.');
            return;
        }

        onSave({
            ...formData,
            htmlBody: getCompliantHtml(formData.htmlBody),
            updatedAt: new Date().toISOString(),
            createdAt: formData.createdAt || new Date().toISOString()
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{isEditing ? 'Modify Blueprint' : 'New Content Engine'}</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configuring identity & layout for the dispatch queue</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                     {!compliance.valid && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 animate-pulse">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Compliance Missing</span>
                        </div>
                     )}
                     {compliance.valid && (
                        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                            <CheckCircle2 size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Compliant</span>
                        </div>
                     )}
                     <button
                        onClick={handleSave}
                        className="flex items-center gap-2.5 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Save size={16} /> Persist Template
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ── Left Column: Controls (7/12) ──────────────────────── */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Basics Card */}
                    <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Template Label</label>
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    placeholder="e.g. Black Friday Launch"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 border-indigo-100/30 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Logical Category</label>
                                <select 
                                    value={formData.type}
                                    onChange={(e) => updateField('type', e.target.value)}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all appearance-none"
                                >
                                    {TEMPLATE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Default Subject Line</label>
                            <input 
                                type="text"
                                value={formData.subject}
                                onChange={(e) => updateField('subject', e.target.value)}
                                placeholder="Subject used if not overridden in campaign"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 border-indigo-100/30 outline-none transition-all"
                            />
                        </div>
                    </section>

                    {/* Editor / Assets Card */}
                    <section className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col min-h-[600px]">
                        <div className="flex flex-wrap items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50 gap-4">
                             <nav className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl">
                                {([
                                    { id: 'design', label: 'HTML Body', icon: Code },
                                    { id: 'plain', label: 'Plain Text', icon: AlignLeft },
                                ] as const).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all
                                            ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <tab.icon size={14} /> {tab.label}
                                    </button>
                                ))}
                             </nav>

                             <button 
                                onClick={() => setShowVars(!showVars)}
                                className="px-4 py-2 bg-white border border-slate-200 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                            >
                                <Sparkles size={14} /> Variables
                             </button>
                        </div>

                        {showVars && (
                            <div className="p-6 bg-indigo-50 border-b border-indigo-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 animate-in slide-in-from-top-2">
                                {AVAILABLE_VARIABLES.map(v => (
                                    <button 
                                        key={v.key}
                                        onClick={() => {
                                            updateField('htmlBody', formData.htmlBody + ' ' + v.key);
                                            setShowVars(false);
                                        }}
                                        className="p-2.5 bg-white border border-indigo-100 rounded-xl text-left hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex flex-col gap-0.5 shadow-sm"
                                    >
                                        <span className="text-[9px] font-black uppercase opacity-60 truncate">{v.label}</span>
                                        <code className="text-[11px] font-bold">{v.key}</code>
                                    </button>
                                ))}
                            </div>
                        )}

                        {unknownVars.length > 0 && (
                            <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3 animate-in fade-in">
                                <TriangleAlert size={16} className="text-amber-600" />
                                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                                    Warning: Unknown variables detected ({unknownVars.join(', ')})
                                </div>
                            </div>
                        )}

                        <div className="flex-1 p-0 flex flex-col">
                             {activeTab === 'design' ? (
                                <textarea 
                                    value={formData.htmlBody}
                                    onChange={(e) => updateField('htmlBody', e.target.value)}
                                    className="flex-1 w-full bg-slate-900 text-slate-300 p-8 font-mono text-xs leading-relaxed outline-none resize-none border-0"
                                    spellCheck={false}
                                />
                             ) : (
                                <textarea 
                                    value={formData.plainTextBody}
                                    onChange={(e) => updateField('plainTextBody', e.target.value)}
                                    placeholder="Provide a text-only version of your email for compatibility..."
                                    className="flex-1 w-full bg-slate-50 p-8 font-mono text-xs leading-relaxed outline-none resize-none border-0 text-slate-800"
                                />
                             )}
                        </div>

                        <div className="p-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/20">
                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 flex items-center gap-1.5"><ImageIcon size={12}/> Header Image URL</label>
                                <input 
                                    type="url"
                                    value={formData.headerImage || ''}
                                    onChange={(e) => updateField('headerImage', e.target.value)}
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-50 border-indigo-100/30 outline-none transition-all placeholder:font-normal"
                                    placeholder="https://yourassets.com/logo.png"
                                />
                             </div>
                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 flex items-center gap-1.5"><Layout size={12}/> Footer Custom Block</label>
                                <input 
                                    type="text"
                                    value={formData.footerBlock || ''}
                                    onChange={(e) => updateField('footerBlock', e.target.value)}
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-50 border-indigo-100/30 outline-none transition-all placeholder:font-normal"
                                    placeholder="Optional HTML block above compliance"
                                />
                             </div>
                        </div>
                    </section>
                </div>

                {/* ── Right Column: Visualization (5/12) ────────────────── */}
                <div className="lg:col-span-5 flex flex-col h-full space-y-6">
                    <section className="bg-slate-900 rounded-[2.5rem] flex-1 min-h-[700px] flex flex-col relative shadow-2xl overflow-hidden ring-8 ring-slate-100">
                         {/* Device Toggle */}
                        <div className="px-6 py-4 bg-slate-800/80 border-b border-white/5 flex items-center justify-between">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            </div>

                            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/5">
                                <button 
                                    onClick={() => setViewMode('desktop')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'desktop' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <Monitor size={16} />
                                </button>
                                <button 
                                    onClick={() => setViewMode('mobile')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'mobile' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <Smartphone size={16} />
                                </button>
                            </div>

                            <div className="w-24" />
                        </div>

                        {/* Rendering Area */}
                        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
                             {/* Mobile Frame Simulation */}
                             <div 
                                className={`bg-white shadow-2xl transition-all duration-500 overflow-hidden flex flex-col
                                    ${viewMode === 'desktop' ? 'w-full h-full rounded-2xl border border-white/10' : 'w-[375px] h-[667px] rounded-[3rem] border-[12px] border-slate-700 relative'}`}
                             >
                                {viewMode === 'mobile' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-700 rounded-b-xl z-20" />}
                                <iframe 
                                    srcDoc={previewHtml}
                                    title="Template Preview"
                                    className="w-full h-full border-none"
                                />
                             </div>
                        </div>

                        {/* Compliance Status Bar */}
                        <footer className={`px-8 py-5 border-t flex flex-col gap-3 transition-colors
                            ${compliance.valid ? 'bg-emerald-900/40 border-emerald-500/20 text-emerald-300' : 'bg-rose-900/50 border-rose-500/30 text-rose-300'}`}>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 uppercase tracking-widest text-[10px] font-black">
                                    <ShieldCheck size={14} className={compliance.valid ? 'text-emerald-400' : 'text-rose-400'} />
                                    {compliance.valid ? 'Legal Integrity: Verified' : 'Legal Integrity: Critical Failure'}
                                </div>
                                {compliance.valid && <CheckCircle2 size={16} className="text-emerald-400" />}
                                {!compliance.valid && <TriangleAlert size={16} className="text-rose-400 animate-pulse" />}
                            </div>

                            {!compliance.valid && (
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-rose-200/60">Missing mandatory elements:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {compliance.missing.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-rose-500/20 border border-rose-500/30 rounded-md text-[9px] font-mono text-rose-100">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-rose-200/40 mt-2 italic">* Required footer will be auto-appended if missing from main body</p>
                                </div>
                            )}
                        </footer>
                    </section>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN PAGE
// ============================================================================

export const TemplatesPage: React.FC = () => {
    const toast = useToast();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [editingTpl, setEditingTpl] = useState<EmailTemplate | null>(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const data = await emailCampaignService.getTemplates();
            setTemplates(data);
        } catch (error) {
            toast.error('Sync Error', 'Failed to synchronize template library.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const filtered = useMemo(() => {
        if (!search.trim()) return templates;
        const q = search.toLowerCase();
        return templates.filter(t => t.name.toLowerCase().includes(q) || t.type.toLowerCase().includes(q));
    }, [templates, search]);

    const handleCreate = () => {
        setEditingTpl(null);
        setView('editor');
    };

    const handleEdit = (tpl: EmailTemplate) => {
        setEditingTpl(tpl);
        setView('editor');
    };

    const handleDuplicate = async (tpl: EmailTemplate) => {
        try {
            const dupPayload = {
                ...tpl,
                name: `${tpl.name} (Copy)`,
            };
            delete (dupPayload as any).id;
            delete (dupPayload as any).createdAt;
            delete (dupPayload as any).updatedAt;

            const dup = await emailCampaignService.createTemplate(dupPayload);
            setTemplates(prev => [dup, ...prev]);
            toast.info("Blueprint Duplicated", `"${dup.name}" was added to your library.`);
        } catch (error) {
            toast.error('Duplication Failed', 'Could not copy the selected template.');
        }
    };

    const handleSave = async (tpl: EmailTemplate) => {
        console.log('[TemplatesPage] handleSave received', tpl);
        try {
            // If the ID is a string like 'tpl-welcome' (seed) or 'tpl-random' (new),
            // we should perform a CREATE because it's not a real database ID yet.
            // Real database IDs are returned as strings but are numeric (e.g. "1", "25").
            const isRealDatabaseId = tpl.id && !isNaN(Number(tpl.id)) && !tpl.id.startsWith('tpl-');

            if (editingTpl && isRealDatabaseId) {
                const updated = await emailCampaignService.updateTemplate(tpl.id, tpl);
                setTemplates(prev => {
                    const idx = prev.findIndex(t => t.id === tpl.id);
                    if (idx >= 0) {
                        const next = [...prev];
                        next[idx] = updated;
                        return next;
                    }
                    return [updated, ...prev];
                });
                toast.success("Library Updated", `Template "${tpl.name}" persisted successfully.`);
            } else {
                const payload = { ...tpl };
                delete (payload as any).id;
                const created = await emailCampaignService.createTemplate(payload);
                setTemplates(prev => [created, ...prev]);
                toast.success("Library Updated", `New template "${tpl.name}" persisted successfully.`);
            }
            setView('list');
        } catch (error: any) {
            console.error('[TemplatesPage] handleSave Error:', error);
            toast.error('Persistence Error', error.message || 'Failed to save template to the backend.');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await emailCampaignService.deleteTemplate(id);
            setTemplates(prev => prev.filter(t => t.id !== id));
            toast.info("Resource Purged", "The template has been removed from the system.");
        } catch (error) {
            toast.error('Purge Failed', 'Could not delete the template.');
        }
    };

    if (loading && templates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Syncing Library...</p>
            </div>
        );
    }

    if (view === 'editor') {
        return (
            <div className="max-w-[1600px] mx-auto pb-20 px-4">
                 <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
                 <TemplateEditor initialData={editingTpl} onSave={handleSave} onCancel={() => setView('list')} />
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20 px-4 animate-in fade-in duration-700">
            <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8 pt-2">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 ring-4 ring-indigo-50">
                        <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Template Bank</h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Manage & iterate on global reusable content blueprints</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                     <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                          <input 
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Locate template by name..."
                            className="w-full sm:w-64 pl-12 pr-5 h-12 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm"
                          />
                     </div>
                     <button
                        onClick={handleCreate}
                        className="flex items-center gap-2.5 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-100 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" strokeWidth={3} /> Construct Hub
                    </button>
                </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map(tpl => {
                    const cfg = TEMPLATE_TYPES.find(t => t.value === tpl.type) || TEMPLATE_TYPES[0];
                    if (!cfg) return null; // Should not happen given the fallback
                    return (
                        <div 
                            key={tpl.id}
                            className="group relative bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden flex flex-col hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-2"
                        >
                             {/* Preview Strip */}
                            <div className="h-44 bg-slate-50 border-b border-slate-100 p-6 overflow-hidden relative cursor-pointer" onClick={() => handleEdit(tpl)}>
                                 <div className="transform scale-[0.4] origin-top-left w-[600px] pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                                     {tpl.headerImage && <img src={tpl.headerImage} alt="" style={{width:'100%', borderRadius:'20px', marginBottom:'20px'}} />}
                                     <div dangerouslySetInnerHTML={{ __html: getCompliantHtml(tpl.htmlBody) }} />
                                 </div>
                                 <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 to-transparent group-hover:opacity-0 transition-opacity" />
                                 
                                 {/* Hover Actions Bar */}
                                 <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleEdit(tpl); }}
                                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all"
                                      >
                                          <Pencil size={18} />
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDuplicate(tpl); }}
                                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all"
                                      >
                                          <Copy size={18} />
                                      </button>
                                       <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(tpl.id); }}
                                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all"
                                      >
                                          <Trash2 size={18} />
                                      </button>
                                 </div>
                            </div>

                            {/* Info Section */}
                            <div className="p-8 space-y-4 flex-1 flex flex-col">
                                 <div className="flex items-start justify-between">
                                     <div className="flex-1 min-w-0">
                                         <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight truncate">{tpl.name}</h3>
                                         <span className={`inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase tracking-widest mt-2 ${cfg.color}`}>
                                             {cfg.label}
                                         </span>
                                     </div>
                                 </div>

                                 <p className="text-xs text-slate-400 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-1">
                                    {cfg.desc}
                                 </p>

                                 <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                      <div className="flex items-center gap-3">
                                           <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">JD</div>
                                                <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center">
                                                     <ShieldCheck size={14} className="text-indigo-600" />
                                                </div>
                                           </div>
                                           <div>
                                               <p className="text-[10px] font-black text-slate-900 uppercase">System Sync</p>
                                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDateDisplay(tpl.updatedAt)}</p>
                                           </div>
                                      </div>
                                      <button 
                                        onClick={() => handleEdit(tpl)}
                                        className="flex items-center gap-1.5 text-indigo-600 font-black uppercase text-[10px] tracking-widest group/btn"
                                      >
                                          Configure <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                      </button>
                                 </div>
                            </div>
                        </div>
                    );
                })}

                {/* Create New Card Placeholder */}
                <button 
                    onClick={handleCreate}
                    className="border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-12 hover:border-indigo-200 hover:bg-slate-50/50 transition-all group min-h-[400px]"
                >
                    <div className="w-20 h-20 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:shadow-indigo-100 group-hover:border-indigo-100 transition-all">
                        <Plus className="w-10 h-10 text-slate-300 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-900 transition-colors">Start New Blueprint</span>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-2 px-10 text-center leading-relaxed">Construct a reusable content strategy from scratch</p>
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// AUXILIARY
// ============================================================================

const AlignLeft: React.FC<any> = (props) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
);

export default TemplatesPage;
