'use client';

import React, { useState } from 'react';
import {
    Cpu, Plus, Trash2, Wifi, WifiOff, AlertTriangle, Save, Loader2, CheckCircle2, Usb, Bluetooth,
} from 'lucide-react';
import { cn } from '@/utils';
import type { HardwareConfig, HardwareDevice } from '@/shared/types/store';

interface StoreHardwareTabProps {
    config: HardwareConfig;
    onSave: (config: HardwareConfig) => Promise<void>;
}

const DEVICE_TYPES: { value: HardwareDevice['type']; label: string }[] = [
    { value: 'printer', label: 'Printer' },
    { value: 'terminal', label: 'Payment Terminal' },
    { value: 'kds_display', label: 'KDS Display' },
    { value: 'cash_drawer', label: 'Cash Drawer' },
    { value: 'scanner', label: 'Scanner' },
];

const CONNECTION_TYPES: { value: HardwareDevice['connectionType']; label: string; icon: any }[] = [
    { value: 'usb', label: 'USB', icon: Usb },
    { value: 'network', label: 'Network', icon: Wifi },
    { value: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
];

const STATUS_STYLE: Record<HardwareDevice['status'], { color: string; bg: string; icon: any }> = {
    connected: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Wifi },
    disconnected: { color: 'text-slate-400', bg: 'bg-slate-50', icon: WifiOff },
    error: { color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertTriangle },
};

export function StoreHardwareTab({ config, onSave }: StoreHardwareTabProps) {
    const [devices, setDevices] = useState<HardwareDevice[]>(config.devices);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const addDevice = () => {
        setDevices(prev => [...prev, {
            id: `dev-${Date.now()}`,
            type: 'printer',
            name: `Device ${prev.length + 1}`,
            connectionType: 'usb',
            status: 'disconnected',
        }]);
    };

    const removeDevice = (id: string) => {
        setDevices(prev => prev.filter(d => d.id !== id));
    };

    const updateDevice = (id: string, field: keyof HardwareDevice, value: any) => {
        setDevices(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({ devices });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally { setIsSaving(false); }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Cpu size={18} /> Hardware Devices
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">{devices.length} device(s) configured</p>
                </div>
                <button onClick={addDevice}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all">
                    <Plus size={14} /> Add Device
                </button>
            </div>

            {devices.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
                    <Cpu className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-900 mb-2">No Hardware</h3>
                    <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
                        No hardware devices configured for this store. Add printers, payment terminals, and other peripherals.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {devices.map(device => {
                        const statusCfg = STATUS_STYLE[device.status];
                        const StatusIcon = statusCfg.icon;

                        return (
                            <div key={device.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start gap-4">
                                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', statusCfg.bg, statusCfg.color)}>
                                        <StatusIcon size={18} />
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Name</label>
                                            <input value={device.name} onChange={e => updateDevice(device.id, 'name', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-900 focus:border-slate-900 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                                            <select value={device.type} onChange={e => updateDevice(device.id, 'type', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-900 appearance-none focus:border-slate-900 outline-none transition-all">
                                                {DEVICE_TYPES.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Connection</label>
                                            <select value={device.connectionType} onChange={e => updateDevice(device.id, 'connectionType', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-900 appearance-none focus:border-slate-900 outline-none transition-all">
                                                {CONNECTION_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IP Address</label>
                                            <input value={device.ipAddress || ''} onChange={e => updateDevice(device.id, 'ipAddress', e.target.value)}
                                                placeholder="192.168.1.100"
                                                disabled={device.connectionType !== 'network'}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-900 focus:border-slate-900 outline-none transition-all font-mono disabled:opacity-40" />
                                        </div>
                                    </div>
                                    <button onClick={() => removeDevice(device.id)}
                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all shrink-0 mt-5">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Save */}
            <div className="flex items-center justify-end gap-3">
                {saved && (
                    <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 animate-in fade-in slide-in-from-right-2 duration-300">
                        <CheckCircle2 size={14} /> Hardware saved
                    </span>
                )}
                <button onClick={handleSave} disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-50">
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {isSaving ? 'Saving...' : 'Save Hardware'}
                </button>
            </div>
        </div>
    );
}
