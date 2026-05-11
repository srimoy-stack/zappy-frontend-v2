'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
    Contact2,
    Plus,
    Upload,
    Search,
    X,
    AlertCircle,
    CheckCircle2,
    ShieldAlert,
    ShieldCheck,
    Filter,
    RotateCcw,
    FileSpreadsheet,
    AlertTriangle,
    ChevronDown,
    UserCheck,
    UserX,
    MailWarning,
    Edit,
} from 'lucide-react';
import { useContactsList } from '../hooks/useContactsList';
import { contactService } from '../services/contactService';
import {
    ContactRecord,
    ContactConsentStatus,
    ContactSuppressionStatus,
    ContactFilters,
    CsvImportRow,
    CreateContactPayload,
} from '../types/contact.types';
import { parseCsvContacts } from '../utils/csvContactParser';
import { ToastContainer, useToast } from '../components/Toast';

// ============================================================================
// CONSENT BADGE CONFIG
// ============================================================================

const CONSENT_CONFIG: Record<
    ContactConsentStatus,
    { label: string; className: string; icon: React.ReactNode }
> = {
    eligible: {
        label: 'Eligible',
        className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
        icon: <UserCheck className="w-3 h-3" />,
    },
    unsubscribed: {
        label: 'Unsubscribed',
        className: 'bg-amber-50 text-amber-700 ring-amber-200/60',
        icon: <UserX className="w-3 h-3" />,
    },
    no_consent: {
        label: 'No Consent',
        className: 'bg-red-50 text-red-700 ring-red-200/60',
        icon: <MailWarning className="w-3 h-3" />,
    },
};

// ============================================================================
// SUPPRESSION BADGE CONFIG
// ============================================================================

const SUPPRESSION_CONFIG: Record<
    ContactSuppressionStatus,
    { label: string; className: string; icon: React.ReactNode }
> = {
    suppressed: {
        label: 'Suppressed',
        className: 'bg-rose-50 text-rose-700 ring-rose-200/60',
        icon: <ShieldAlert className="w-3 h-3" />,
    },
    not_suppressed: {
        label: 'Active',
        className: 'bg-sky-50 text-sky-700 ring-sky-200/60',
        icon: <ShieldCheck className="w-3 h-3" />,
    },
    active: {
        label: 'Active',
        className: 'bg-sky-50 text-sky-700 ring-sky-200/60',
        icon: <ShieldCheck className="w-3 h-3" />,
    },
};

// ============================================================================
// TABLE COLUMNS
// ============================================================================

const COLUMNS = [
    { key: 'name', label: 'Name', width: 'min-w-[180px]' },
    { key: 'email', label: 'Email', width: 'min-w-[220px]' },
    { key: 'store', label: 'Store', width: 'min-w-[180px]' },
    { key: 'last_order', label: 'Last Order', width: 'min-w-[140px]' },
    { key: 'total_spend', label: 'Total Spend', width: 'min-w-[120px]' },
    { key: 'consent', label: 'Consent', width: 'min-w-[140px]' },
    { key: 'suppression', label: 'Suppression', width: 'min-w-[130px]' },
] as const;

// ============================================================================
// HELPER: Format date
// ============================================================================

function formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(dateStr));
    } catch {
        return '—';
    }
}

// ============================================================================
// HELPER: Format currency
// ============================================================================

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

// ============================================================================
// EMAIL REGEX
// ============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================================
// MODAL: Add Contact
// ============================================================================

interface AddContactModalProps {
    open: boolean;
    stores: { id: string; name: string }[];
    loading: boolean;
    onSubmit: (payload: CreateContactPayload) => void;
    onClose: () => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({
    open,
    stores,
    loading,
    onSubmit,
    onClose,
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [storeId, setStoreId] = useState('');
    const [consentStatus, setConsentStatus] = useState<ContactConsentStatus | ''>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const clearError = useCallback((key: string) => {
        setErrors((prev) => {
            if (!prev[key]) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    const validate = useCallback((): boolean => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = 'Name is required';
        if (!email.trim()) {
            e.email = 'Email is required';
        } else if (!EMAIL_REGEX.test(email.trim())) {
            e.email = 'Invalid email format';
        }
        if (!storeId) e.storeId = 'Store is required';
        if (!consentStatus) e.consentStatus = 'Consent status is required — do NOT assume consent';
        setErrors(e);
        return Object.keys(e).length === 0;
    }, [name, email, storeId, consentStatus]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            store_id: storeId,
            consent_status: consentStatus as ContactConsentStatus,
        });
    };

    const resetForm = useCallback(() => {
        setName('');
        setEmail('');
        setStoreId('');
        setConsentStatus('');
        setErrors({});
    }, []);

    const handleClose = () => {
        if (loading) return;
        resetForm();
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={handleClose}
                style={{ animation: 'fadeIn 200ms ease-out' }}
            />
            {/* Modal */}
            <div
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 mx-4"
                style={{ animation: 'scaleIn 200ms ease-out' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl">
                            <Plus className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Add Contact</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Compliance-aware entry
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="input-contact-name"
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); clearError('name'); }}
                            placeholder="e.g. Sarah Mitchell"
                            className={`w-full px-3 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${
                                errors.name
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                                    : 'border-slate-200'
                            }`}
                        />
                        {errors.name && (
                            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="input-contact-email"
                            type="text"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                            placeholder="e.g. sarah@example.com"
                            className={`w-full px-3 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${
                                errors.email
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                                    : 'border-slate-200'
                            }`}
                        />
                        {errors.email && (
                            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Store */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Store <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                id="select-contact-store"
                                value={storeId}
                                onChange={(e) => { setStoreId(e.target.value); clearError('storeId'); }}
                                className={`w-full appearance-none px-3 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 pr-9 ${
                                    errors.storeId
                                        ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                                        : 'border-slate-200'
                                }`}
                            >
                                <option value="">Select store…</option>
                                {stores.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.storeId && (
                            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.storeId}
                            </p>
                        )}
                    </div>

                    {/* Consent Status */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Consent Status <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(
                                [
                                    { value: 'eligible', label: 'Eligible', icon: UserCheck, color: 'emerald' },
                                    { value: 'unsubscribed', label: 'Unsubscribed', icon: UserX, color: 'amber' },
                                    { value: 'no_consent', label: 'No Consent', icon: MailWarning, color: 'red' },
                                ] as const
                            ).map((opt) => {
                                const isSelected = consentStatus === opt.value;
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => { setConsentStatus(opt.value); clearError('consentStatus'); }}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-bold ${
                                            isSelected
                                                ? opt.color === 'emerald'
                                                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm'
                                                    : opt.color === 'amber'
                                                    ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm'
                                                    : 'border-red-400 bg-red-50 text-red-700 shadow-sm'
                                                : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100'
                                        }`}

                                    >
                                        <Icon className="w-4 h-4" />
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.consentStatus && (
                            <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" />
                                {errors.consentStatus}
                            </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            Consent status must be explicitly set — never assumed.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            id="btn-submit-contact"
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            Add Contact
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================================================
// MODAL: Edit Contact
// ============================================================================

interface EditContactModalProps {
    open: boolean;
    contact: ContactRecord | null;
    stores: { id: string; name: string }[];
    loading: boolean;
    onSubmit: (id: string, payload: Partial<CreateContactPayload>) => void;
    onClose: () => void;
}

const EditContactModal: React.FC<EditContactModalProps> = ({
    open,
    contact,
    stores,
    loading,
    onSubmit,
    onClose,
}) => {
    const [name, setName] = useState('');
    const [storeId, setStoreId] = useState('');
    const [consentStatus, setConsentStatus] = useState<ContactConsentStatus | ''>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const clearError = useCallback((key: string) => {
        setErrors((prev) => {
            if (!prev[key]) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    useEffect(() => {
        if (contact) {
            setName(contact.name || '');
            setStoreId(contact.store_id || '');
            setConsentStatus(contact.consent_status || '');
            setErrors({});
        }
    }, [contact]);

    const validate = useCallback((): boolean => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = 'Name is required';
        if (!storeId) e.storeId = 'Store is required';
        if (!consentStatus) e.consentStatus = 'Consent status is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    }, [name, storeId, consentStatus]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !contact) return;
        onSubmit(contact.id, {
            name: name.trim(),
            store_id: storeId,
            consent_status: consentStatus as ContactConsentStatus,
        });
    };

    if (!open || !contact) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white">
                            <Edit className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Edit Contact</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{contact.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); clearError('name'); }}
                            className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all ${
                                errors.name ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                            }`}
                        />
                        {errors.name && (
                            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Store</label>
                        <select
                            value={storeId}
                            onChange={(e) => { setStoreId(e.target.value); clearError('storeId'); }}
                            className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all ${
                                errors.storeId ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                            }`}
                        >
                            <option value="">Select store…</option>
                            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        {errors.storeId && (
                            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.storeId}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Consent Status</label>
                        <div className="grid grid-cols-3 gap-2">
                            {([
                                { value: 'eligible', label: 'Eligible', icon: UserCheck, color: 'emerald' },
                                { value: 'unsubscribed', label: 'Unsubscribed', icon: UserX, color: 'amber' },
                                { value: 'no_consent', label: 'No Consent', icon: MailWarning, color: 'red' },
                            ] as const).map(opt => {
                                const isSelected = consentStatus === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => { setConsentStatus(opt.value); clearError('consentStatus'); }}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-bold ${
                                            isSelected
                                                ? opt.color === 'emerald' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' :
                                                  opt.color === 'amber' ? 'border-amber-400 bg-amber-50 text-amber-700' :
                                                  'border-red-400 bg-red-50 text-red-700'
                                                : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        <opt.icon className="w-4 h-4" />
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.consentStatus && (
                            <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" />
                                {errors.consentStatus}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================================================
// MODAL: CSV Import
// ============================================================================

interface CsvImportModalProps {
    open: boolean;
    onImport: (validRows: CreateContactPayload[]) => void;
    onClose: () => void;
    importing: boolean;
}

const CsvImportModal: React.FC<CsvImportModalProps> = ({ open, onImport, onClose, importing }) => {
    const [csvRows, setCsvRows] = useState<CsvImportRow[]>([]);
    const [summary, setSummary] = useState({ total: 0, valid: 0, invalid: 0 });
    const [fileLoaded, setFileLoaded] = useState(false);
    const [fileName, setFileName] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            const result = parseCsvContacts(text);
            setCsvRows(result.rows);
            setSummary({ total: result.total, valid: result.valid, invalid: result.invalid });
            setFileLoaded(true);
        };
        reader.readAsText(file);
    };

    const handleImport = () => {
        const validPayloads = csvRows
            .filter((r) => r.valid)
            .map((r) => ({
                name: r.name,
                email: r.email,
                store_id: r.store_id,
                consent_status: r.consent_status as ContactConsentStatus,
            }));
        onImport(validPayloads);
    };

    const handleClose = () => {
        if (importing) return;
        setCsvRows([]);
        setSummary({ total: 0, valid: 0, invalid: 0 });
        setFileLoaded(false);
        setFileName('');
        if (fileRef.current) fileRef.current.value = '';
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={handleClose}
                style={{ animation: 'fadeIn 200ms ease-out' }}
            />
            {/* Modal */}
            <div
                className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 mx-4 max-h-[85vh] flex flex-col"
                style={{ animation: 'scaleIn 200ms ease-out' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-600 rounded-xl">
                            <FileSpreadsheet className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Import Contacts</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                CSV Upload with validation
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={importing}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Upload zone */}
                    {!fileLoaded && (
                        <div className="space-y-4">
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all cursor-pointer group"
                            >
                                <div className="p-3 bg-indigo-100 rounded-2xl group-hover:bg-indigo-200 transition-colors">
                                    <Upload className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-700">
                                        Click to upload CSV
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Required columns: name, email, store_id, consent_status
                                    </p>
                                </div>
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {/* Expected format hint */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Expected format
                                </p>
                                <code className="block text-xs text-slate-600 font-mono leading-relaxed bg-white rounded-lg p-3 border border-slate-100">
                                    name,email,store_id,consent_status
                                    <br />
                                    John Doe,john@example.com,store_001,eligible
                                    <br />
                                    Jane Smith,jane@example.com,store_002,no_consent
                                </code>
                                <div className="flex items-start gap-1.5 mt-3">
                                    <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                                    <span className="text-[10px] text-amber-700 font-semibold">
                                        consent_status is mandatory. Rows without explicit consent will be flagged as invalid.
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview table */}
                    {fileLoaded && (
                        <>
                            {/* File info + summary */}
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-bold text-slate-700">{fileName}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-500">
                                        Total: <span className="text-slate-900">{summary.total}</span>
                                    </span>
                                    <span className="text-xs font-bold text-emerald-600">
                                        ✓ Valid: {summary.valid}
                                    </span>
                                    {summary.invalid > 0 && (
                                        <span className="text-xs font-bold text-red-600">
                                            ✗ Invalid: {summary.invalid}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Preview table */}
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest w-[40px]">
                                                #
                                            </th>
                                            <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                Name
                                            </th>
                                            <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                Email
                                            </th>
                                            <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                Store ID
                                            </th>
                                            <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                Consent
                                            </th>
                                            <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {csvRows.map((row) => (
                                            <tr
                                                key={row.rowIndex}
                                                className={
                                                    row.valid
                                                        ? 'hover:bg-slate-50/70'
                                                        : 'bg-red-50/50 hover:bg-red-50'
                                                }
                                            >
                                                <td className="px-3 py-2 text-xs text-slate-400 tabular-nums">
                                                    {row.rowIndex}
                                                </td>
                                                <td className="px-3 py-2 text-xs text-slate-800 font-medium">
                                                    {row.name || (
                                                        <span className="text-red-400 italic">missing</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-xs text-slate-600 font-mono">
                                                    {row.email || (
                                                        <span className="text-red-400 italic">missing</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-xs text-slate-600">
                                                    {row.store_id || (
                                                        <span className="text-red-400 italic">missing</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-xs text-slate-600">
                                                    {row.consent_status || (
                                                        <span className="text-red-400 italic">missing</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {row.valid ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200/60">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Valid
                                                        </span>
                                                    ) : (
                                                        <div>
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full ring-1 ring-red-200/60">
                                                                <AlertCircle className="w-3 h-3" />
                                                                Invalid
                                                            </span>
                                                            <ul className="mt-1 space-y-0.5">
                                                                {row.errors.map((err, i) => (
                                                                    <li
                                                                        key={i}
                                                                        className="text-[10px] text-red-600"
                                                                    >
                                                                        • {err}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {fileLoaded && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 rounded-b-2xl">
                        <button
                            type="button"
                            onClick={() => {
                                setCsvRows([]);
                                setSummary({ total: 0, valid: 0, invalid: 0 });
                                setFileLoaded(false);
                                setFileName('');
                                if (fileRef.current) fileRef.current.value = '';
                            }}
                            disabled={importing}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Choose Different File
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={importing || summary.valid === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {importing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4" />
                            )}
                            Import {summary.valid} Contact{summary.valid !== 1 ? 's' : ''}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ContactsPage (M9 – Marketing / Customer Engagement)
 *
 * Production-grade contacts management page with:
 * - Compliance-aware consent & suppression badges
 * - Searchable & filterable contact table
 * - Add Contact form with strict validation
 * - CSV Import with preview + invalid row highlighting
 * - Dense, professional M9 table style
 *
 * Data rules:
 * - Consent is NEVER assumed
 * - Suppression is NEVER assumed
 */
export const ContactsPage: React.FC = () => {
    const {
        contacts,
        stores,
        loading,
        error,
        filters,
        stats,
        updateFilter,
        resetFilters,
        refetch,
    } = useContactsList();
    const toast = useToast();

    // ── Modal state ────────────────────────────────────────────────────
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [selectedContact, setSelectedContact] = useState<ContactRecord | null>(null);
    const [csvModalOpen, setCsvModalOpen] = useState(false);
    const [csvImporting, setCsvImporting] = useState(false);

    // ── Debounced search ───────────────────────────────────────────────
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = useCallback(
        (value: string) => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
            searchTimerRef.current = setTimeout(() => {
                updateFilter('search', value);
            }, 300);
        },
        [updateFilter]
    );

    // ── Check if filters are active ────────────────────────────────────
    const hasActiveFilters = useMemo(
        () =>
            filters.consent_status !== 'all' ||
            filters.store_id !== 'all' ||
            filters.suppression_status !== 'all' ||
            filters.search !== '',
        [filters]
    );

    // ── Add contact ────────────────────────────────────────────────────
    const handleAddContact = async (payload: CreateContactPayload) => {
        setAddLoading(true);
        try {
            await contactService.createContact(payload);
            setAddModalOpen(false);
            await refetch();
            toast.success('Contact added', `${payload.name} has been added successfully.`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to add contact';
            toast.error('Failed to add contact', message);
        } finally {
            setAddLoading(false);
        }
    };

    // ── Update contact ─────────────────────────────────────────────────
    const handleUpdateContact = async (id: string, payload: Partial<CreateContactPayload>) => {
        setEditLoading(true);
        try {
            await contactService.updateContact(id, payload);
            setEditModalOpen(false);
            await refetch();
            toast.success('Contact updated', 'Changes have been saved successfully.');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update contact';
            toast.error('Update failed', message);
        } finally {
            setEditLoading(false);
        }
    };

    // ── CSV import ─────────────────────────────────────────────────────
    const handleCsvImport = async (validRows: CreateContactPayload[]) => {
        setCsvImporting(true);
        try {
            const result = await contactService.importContacts(validRows);
            setCsvModalOpen(false);
            await refetch();
            toast.success(
                'Import complete',
                `${result.imported} contact${result.imported !== 1 ? 's' : ''} imported successfully.`
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Import failed';
            toast.error('Import failed', message);
        } finally {
            setCsvImporting(false);
        }
    };

    // ── Toggle suppression ─────────────────────────────────────────────
    const handleToggleSuppression = async (
        contactId: string,
        current: ContactSuppressionStatus
    ) => {
        const newStatus = current === 'suppressed' ? 'not_suppressed' : 'suppressed';
        try {
            await contactService.updateSuppression(contactId, newStatus);
            await refetch();
            toast.success(
                'Suppression updated',
                `Contact is now ${newStatus === 'suppressed' ? 'suppressed' : 'active'}.`
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update suppression';
            toast.error('Update failed', message);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────
    return (
        <div className="max-w-[1600px] mx-auto space-y-4 pb-10 px-2 lg:px-4">
            {/* ── Toast Notifications ─────────────────────────────────── */}
            <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

            {/* ── Add Contact Modal ───────────────────────────────────── */}
            <AddContactModal
                open={addModalOpen}
                stores={stores}
                loading={addLoading}
                onSubmit={handleAddContact}
                onClose={() => setAddModalOpen(false)}
            />

            {/* ── Edit Contact Modal ──────────────────────────────────── */}
            <EditContactModal
                open={editModalOpen}
                contact={selectedContact}
                stores={stores}
                loading={editLoading}
                onSubmit={handleUpdateContact}
                onClose={() => setEditModalOpen(false)}
            />

            {/* ── CSV Import Modal ────────────────────────────────────── */}
            <CsvImportModal
                open={csvModalOpen}
                onImport={handleCsvImport}
                onClose={() => setCsvModalOpen(false)}
                importing={csvImporting}
            />

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 pt-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                        <Contact2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Contacts</h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                            Compliance-aware audience management
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        id="btn-import-csv"
                        onClick={() => setCsvModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
                    >
                        <Upload className="w-4 h-4 text-slate-400" />
                        Import CSV
                    </button>
                    <button
                        id="btn-add-contact"
                        onClick={() => setAddModalOpen(true)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 active:scale-95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" strokeWidth={3} />
                        Add Contact
                    </button>
                </div>
            </div>

            {/* ── Stats Tiles ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                    {
                        label: 'Total Contacts',
                        value: stats.total,
                        icon: Contact2,
                        color: 'bg-slate-50 text-slate-700 ring-slate-200',
                        iconBg: 'bg-slate-200 text-slate-600',
                    },
                    {
                        label: 'Eligible',
                        value: stats.eligible,
                        icon: UserCheck,
                        color: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
                        iconBg: 'bg-emerald-200 text-emerald-700',
                    },
                    {
                        label: 'Unsubscribed',
                        value: stats.unsubscribed,
                        icon: UserX,
                        color: 'bg-amber-50 text-amber-700 ring-amber-200',
                        iconBg: 'bg-amber-200 text-amber-700',
                    },
                    {
                        label: 'No Consent',
                        value: stats.noConsent,
                        icon: MailWarning,
                        color: 'bg-red-50 text-red-700 ring-red-200',
                        iconBg: 'bg-red-200 text-red-700',
                    },
                    {
                        label: 'Suppressed',
                        value: stats.suppressed,
                        icon: ShieldAlert,
                        color: 'bg-rose-50 text-rose-700 ring-rose-200',
                        iconBg: 'bg-rose-200 text-rose-700',
                    },
                ].map((tile) => {
                    const Icon = tile.icon;
                    return (
                        <div
                            key={tile.label}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl ring-1 ${tile.color}`}
                        >
                            <div className={`p-2 rounded-lg ${tile.iconBg}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                    {tile.label}
                                </p>
                                <p className="text-lg font-black tabular-nums">
                                    {loading ? '…' : tile.value.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Error State ─────────────────────────────────────────── */}
            {error && (
                <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800">Failed to load contacts</p>
                        <p className="text-xs text-red-600 mt-0.5">{error}</p>
                    </div>
                    <button
                        onClick={refetch}
                        className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* ── Filters Bar ─────────────────────────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
                    {/* Filter icon */}
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Filter className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            Filters
                        </span>
                    </div>

                    {/* Consent filter */}
                    <div className="relative">
                        <select
                            id="filter-consent"
                            value={filters.consent_status}
                            onChange={(e) =>
                                updateFilter(
                                    'consent_status',
                                    e.target.value as ContactFilters['consent_status']
                                )
                            }
                            className="appearance-none px-3 py-1.5 pr-8 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                        >
                            <option value="all">All Consent</option>
                            <option value="eligible">Eligible</option>
                            <option value="unsubscribed">Unsubscribed</option>
                            <option value="no_consent">No Consent</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Store filter */}
                    <div className="relative">
                        <select
                            id="filter-store"
                            value={filters.store_id}
                            onChange={(e) =>
                                updateFilter(
                                    'store_id',
                                    e.target.value as ContactFilters['store_id']
                                )
                            }
                            className="appearance-none px-3 py-1.5 pr-8 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                        >
                            <option value="all">All Stores</option>
                            {stores.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Suppression filter */}
                    <div className="relative">
                        <select
                            id="filter-suppression"
                            value={filters.suppression_status}
                            onChange={(e) =>
                                updateFilter(
                                    'suppression_status',
                                    e.target.value as ContactFilters['suppression_status']
                                )
                            }
                            className="appearance-none px-3 py-1.5 pr-8 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                        >
                            <option value="all">All Suppression</option>
                            <option value="not_suppressed">Active</option>
                            <option value="suppressed">Suppressed</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Search */}
                    <div className="flex-1 min-w-[200px] relative ml-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            id="input-contact-search"
                            type="text"
                            defaultValue={filters.search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search name or email…"
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                        />
                    </div>

                    {/* Reset */}
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors uppercase tracking-wider"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                        </button>
                    )}
                </div>

                {/* Summary bar */}
                <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Showing:{' '}
                        <span className="text-slate-900">
                            {loading ? '…' : contacts.length}
                        </span>{' '}
                        contact{contacts.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* ── Loading State (Skeleton Rows) ───────────────────── */}
                {loading && (
                    <div>
                        {/* Skeleton table header */}
                        <div className="grid grid-cols-7 gap-4 px-4 py-2 bg-slate-50 border-b border-slate-100">
                            {COLUMNS.map((col) => (
                                <div
                                    key={col.key}
                                    className="h-3 bg-slate-200 rounded-full w-3/4 animate-pulse"
                                />
                            ))}
                        </div>
                        {/* Skeleton rows */}
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-7 gap-4 px-4 py-2.5 border-b border-slate-50"
                            >
                                <div className="h-3.5 bg-slate-100 rounded-full w-4/5 animate-pulse" />
                                <div className="h-3.5 bg-slate-100 rounded-full w-full animate-pulse" />
                                <div className="h-3.5 bg-slate-100 rounded-full w-3/5 animate-pulse" />
                                <div className="h-3.5 bg-slate-100 rounded-full w-2/3 animate-pulse" />
                                <div className="h-3.5 bg-slate-100 rounded-full w-16 animate-pulse" />
                                <div className="h-6 bg-slate-100 rounded-full w-20 animate-pulse" />
                                <div className="h-6 bg-slate-100 rounded-full w-20 animate-pulse" />
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Empty State ──────────────────────────────────────── */}
                {!loading && !error && contacts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 px-6">
                        <div className="p-5 bg-indigo-50 rounded-2xl mb-5">
                            <Contact2 className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">
                            {hasActiveFilters
                                ? 'No contacts match your filters'
                                : 'No contacts yet'}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1.5 max-w-sm text-center">
                            {hasActiveFilters
                                ? 'Try adjusting your filter criteria or reset all filters.'
                                : 'Add your first contact or import a CSV file to get started.'}
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                            {hasActiveFilters ? (
                                <button
                                    onClick={resetFilters}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-95 transition-all"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset Filters
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setAddModalOpen(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                                    >
                                        <Plus className="w-4 h-4" strokeWidth={3} />
                                        Add Contact
                                    </button>
                                    <button
                                        onClick={() => setCsvModalOpen(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 active:scale-95 transition-all"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Import CSV
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Table ────────────────────────────────────────────── */}
                {!loading && contacts.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {COLUMNS.map((col) => (
                                        <th
                                            key={col.key}
                                            className={`px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ${col.width}`}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                    <th className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {contacts.map((contact) => {
                                    const consentCfg = CONSENT_CONFIG[contact.consent_status] || CONSENT_CONFIG.no_consent;
                                    const suppressionCfg =
                                        SUPPRESSION_CONFIG[contact.suppression_status] || SUPPRESSION_CONFIG.active;

                                    return (
                                        <tr
                                            key={contact.id}
                                            className="group hover:bg-slate-50/70 transition-colors duration-150"
                                        >
                                            {/* Name */}
                                            <td className="px-4 py-2.5">
                                                <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                                    {contact.name}
                                                </span>
                                            </td>

                                            {/* Email */}
                                            <td className="px-4 py-2.5">
                                                <span className="text-sm text-slate-600 font-mono">
                                                    {contact.email}
                                                </span>
                                            </td>

                                            {/* Store */}
                                            <td className="px-4 py-2.5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-slate-700">
                                                        {contact.store_name || contact.store_id}
                                                    </span>
                                                    {contact.store_name && (
                                                        <span className="text-[10px] text-slate-400">
                                                            {contact.store_id}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Last Order */}
                                            <td className="px-4 py-2.5">
                                                <span className="text-sm text-slate-600">
                                                    {formatDate(contact.last_order)}
                                                </span>
                                            </td>

                                            {/* Total Spend */}
                                            <td className="px-4 py-2.5">
                                                <span className="text-sm font-semibold text-slate-800 tabular-nums">
                                                    {formatCurrency(contact.total_spend)}
                                                </span>
                                            </td>

                                            {/* Consent Status Badge */}
                                            <td className="px-4 py-2.5">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ${consentCfg.className}`}
                                                >
                                                    {consentCfg.icon}
                                                    {consentCfg.label}
                                                </span>
                                            </td>

                                            {/* Suppression Status Badge */}
                                            <td className="px-4 py-2.5">
                                                <button
                                                    onClick={() =>
                                                        handleToggleSuppression(
                                                            contact.id,
                                                            contact.suppression_status
                                                        )
                                                    }
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 transition-all hover:shadow-sm active:scale-95 cursor-pointer ${suppressionCfg.className}`}
                                                    title={`Click to ${
                                                        contact.suppression_status === 'suppressed'
                                                            ? 'unsuppress'
                                                            : 'suppress'
                                                    }`}
                                                >
                                                    {suppressionCfg.icon}
                                                    {suppressionCfg.label}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-2.5 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedContact(contact);
                                                        setEditModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Edit contact"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* ── Animation Keyframes ──────────────────────────────────── */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `,
                }}
            />
        </div>
    );
};

export default ContactsPage;
