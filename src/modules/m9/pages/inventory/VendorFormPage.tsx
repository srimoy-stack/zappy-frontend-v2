'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
;
import {
    ArrowLeft,
    Save,
    Users,
    MapPin,
    Phone,
    Mail
} from 'lucide-react';
import { CreateVendorDTO } from '../../types/inventory';
import { vendorService } from '../../services/inventoryService';

/**
 * Vendor Form Page (Create / Edit)
 * 
 * Manage supplier details.
 */
export const VendorFormPage: React.FC = () => {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

    useEffect(() => {
        if (isEditMode && id) {
            loadVendor(id);
        }
    }, [id, isEditMode]);

    const loadVendor = async (vendorId: string) => {
        try {
            const data = await vendorService.getById(vendorId);
            if (data) {
                setName(data.name);
                setContactPerson(data.contactPerson || '');
                setPhone(data.phone || '');
                setEmail(data.email || '');
                setAddress(data.address || '');
                setStatus(data.status);
            } else {
                alert('Vendor not found');
                router.push('/backoffice/inventory/vendors');
            }
        } catch (error) {
            console.error('Failed to load vendor:', error);
            alert('Error loading vendor details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            alert('Vendor Name is required');
            return;
        }

        setSubmitting(true);
        try {
            const vendorData: CreateVendorDTO = {
                name,
                contactPerson,
                phone,
                email,
                address,
                status
            };

            if (isEditMode && id) {
                await vendorService.update(id, vendorData);
                alert('Vendor updated successfully');
            } else {
                await vendorService.create(vendorData);
                alert('Vendor created successfully');
            }
            router.push('/backoffice/inventory/vendors');
        } catch (error: any) {
            console.error('Failed to save vendor:', error);
            alert('Failed to save vendor: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Users className="w-12 h-12 text-slate-400 animate-pulse mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading vendor details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <button
                    onClick={() => router.push('/backoffice/inventory/vendors')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {isEditMode ? 'Edit Vendor' : 'Add New Vendor'}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        {isEditMode ? 'Update supplier information' : 'Register a new supplier'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vendor Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Global Foods Ltd"
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Person</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={contactPerson}
                                    onChange={(e) => setContactPerson(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={3}
                                className="w-full p-4 pl-10 rounded-xl border border-slate-200 font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                        <div className="flex p-1 bg-slate-100 rounded-xl max-w-sm">
                            {(['Active', 'Inactive'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${status === s
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={() => router.push('/backoffice/inventory/vendors')}
                        className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Save size={16} />
                        {submitting ? 'Saving...' : (isEditMode ? 'Update Vendor' : 'Create Vendor')}
                    </button>
                </div>
            </div>
        </div>
    );
};
