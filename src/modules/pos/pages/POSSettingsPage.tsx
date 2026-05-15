'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Printer, Monitor, Shield, Save, Volume2, ArrowLeft
} from 'lucide-react';
import '../styles/pos-rush.css';

export const POSSettingsPage: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'PRINTER' | 'TERMINAL' | 'MANAGER'>('PRINTER');

    // Printer Settings State
    const [printerSettings, setPrinterSettings] = useState({
        kitchenPrinter: 'Epson T88V (192.168.1.50)',
        receiptPrinter: 'Star TSP100 (USB)',
        autoPrintReceipt: true,
        printKitchenTicket: true,
        fontSize: 'Normal'
    });

    // Terminal Settings State
    const [terminalSettings, setTerminalSettings] = useState({
        terminalId: 'TERM-01',
        soundVolume: 80,
        screenBrightness: 100,
        theme: 'Dark'
    });

    // Manager Settings State
    const [managerSettings, setManagerSettings] = useState({
        requirePinRefund: true,
        requirePinVoid: true,
        requirePinDiscount: true,
        maxDiscountPercent: 20
    });

    const handleSave = () => {
        // Simulate save
        alert('Settings Saved Successfully');
    };

    return (
        <div className="pos-screen pos-layout">
            <div className="pos-left-zone" style={{ width: '300px', borderRight: '1px solid var(--pos-border-subtle)' }}>
                <div className="pos-header" style={{ height: 'auto', padding: '24px' }}>
                    <button
                        onClick={() => router.back()}
                        className="pos-btn-secondary"
                        style={{ width: '48px', height: '48px', padding: 0, marginBottom: '24px' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="pos-title-lg" style={{ fontSize: '32px' }}>Settings</h1>
                    <p style={{ fontSize: '14px', color: 'var(--pos-text-secondary)', marginTop: '8px' }}>
                        Configure your POS experience
                    </p>
                </div>

                <div style={{ padding: '0 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={() => setActiveTab('PRINTER')}
                            className={`pos-btn ${activeTab === 'PRINTER' ? 'pos-btn-primary' : 'pos-btn-secondary'}`}
                            style={{ justifyContent: 'flex-start', padding: '20px', fontSize: '16px' }}
                        >
                            <Printer size={20} style={{ marginRight: '12px' }} />
                            Printers & Devices
                        </button>
                        <button
                            onClick={() => setActiveTab('TERMINAL')}
                            className={`pos-btn ${activeTab === 'TERMINAL' ? 'pos-btn-primary' : 'pos-btn-secondary'}`}
                            style={{ justifyContent: 'flex-start', padding: '20px', fontSize: '16px' }}
                        >
                            <Monitor size={20} style={{ marginRight: '12px' }} />
                            Terminal Preference
                        </button>
                        <button
                            onClick={() => setActiveTab('MANAGER')}
                            className={`pos-btn ${activeTab === 'MANAGER' ? 'pos-btn-primary' : 'pos-btn-secondary'}`}
                            style={{ justifyContent: 'flex-start', padding: '20px', fontSize: '16px' }}
                        >
                            <Shield size={20} style={{ marginRight: '12px' }} />
                            Manager Controls
                        </button>
                    </div>
                </div>
            </div>

            <div className="pos-right-zone" style={{ padding: '40px', overflowY: 'auto' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                    {activeTab === 'PRINTER' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h2 className="pos-title-md" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Printer size={32} color="var(--pos-action-primary)" />
                                Printer Configuration
                            </h2>

                            <div className="pos-card" style={{ padding: '32px', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--pos-text-primary)', marginBottom: '24px' }}>Connected Devices</h3>
                                <div className="pos-grid-2" style={{ gap: '24px', marginBottom: '32px' }}>
                                    <div>
                                        <label className="pos-label">Receipt Printer</label>
                                        <select
                                            className="pos-input"
                                            value={printerSettings.receiptPrinter}
                                            onChange={(e) => setPrinterSettings({ ...printerSettings, receiptPrinter: e.target.value })}
                                        >
                                            <option>Star TSP100 (USB)</option>
                                            <option>Epson TM-m30 (Bluetooth)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="pos-label">Kitchen Printer</label>
                                        <select
                                            className="pos-input"
                                            value={printerSettings.kitchenPrinter}
                                            onChange={(e) => setPrinterSettings({ ...printerSettings, kitchenPrinter: e.target.value })}
                                        >
                                            <option>Epson T88V (192.168.1.50)</option>
                                            <option>Star SP700 (Ethernet)</option>
                                        </select>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--pos-text-primary)', marginBottom: '24px' }}>Print Options</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--pos-bg-hover)', borderRadius: '12px', cursor: 'pointer' }}>
                                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--pos-text-primary)' }}>Auto-print Customer Receipt</span>
                                        <input
                                            type="checkbox"
                                            checked={printerSettings.autoPrintReceipt}
                                            onChange={(e) => setPrinterSettings({ ...printerSettings, autoPrintReceipt: e.target.checked })}
                                            style={{ width: '24px', height: '24px' }}
                                        />
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--pos-bg-hover)', borderRadius: '12px', cursor: 'pointer' }}>
                                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--pos-text-primary)' }}>Print Kitchen Ticket</span>
                                        <input
                                            type="checkbox"
                                            checked={printerSettings.printKitchenTicket}
                                            onChange={(e) => setPrinterSettings({ ...printerSettings, printKitchenTicket: e.target.checked })}
                                            style={{ width: '24px', height: '24px' }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'TERMINAL' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h2 className="pos-title-md" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Monitor size={32} color="var(--pos-action-primary)" />
                                Terminal Settings
                            </h2>

                            <div className="pos-card" style={{ padding: '32px', marginBottom: '24px' }}>
                                <div className="pos-grid-2" style={{ gap: '24px' }}>
                                    <div>
                                        <label className="pos-label">Terminal ID</label>
                                        <input
                                            type="text"
                                            className="pos-input"
                                            value={terminalSettings.terminalId}
                                            readOnly
                                            style={{ opacity: 0.7 }}
                                        />
                                    </div>
                                    <div>
                                        <label className="pos-label">Theme</label>
                                        <select
                                            className="pos-input"
                                            value={terminalSettings.theme}
                                            onChange={(e) => setTerminalSettings({ ...terminalSettings, theme: e.target.value })}
                                        >
                                            <option>Dark (Default)</option>
                                            <option>Light</option>
                                            <option>High Contrast</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginTop: '32px' }}>
                                    <label className="pos-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Volume2 size={16} /> Sound Volume ({terminalSettings.soundVolume}%)
                                    </label>
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={terminalSettings.soundVolume}
                                        onChange={(e) => setTerminalSettings({ ...terminalSettings, soundVolume: parseInt(e.target.value) })}
                                        style={{ width: '100%', accentColor: 'var(--pos-action-primary)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'MANAGER' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h2 className="pos-title-md" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Shield size={32} color="var(--pos-action-primary)" />
                                Manager Controls
                            </h2>

                            <div className="pos-card" style={{ padding: '32px', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--pos-text-primary)', marginBottom: '24px' }}>Security & Approvals</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--pos-bg-hover)', borderRadius: '12px', cursor: 'pointer' }}>
                                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--pos-text-primary)' }}>Require PIN for Refunds</span>
                                        <input
                                            type="checkbox"
                                            checked={managerSettings.requirePinRefund}
                                            onChange={(e) => setManagerSettings({ ...managerSettings, requirePinRefund: e.target.checked })}
                                            style={{ width: '24px', height: '24px' }}
                                        />
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--pos-bg-hover)', borderRadius: '12px', cursor: 'pointer' }}>
                                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--pos-text-primary)' }}>Require PIN for Order Void</span>
                                        <input
                                            type="checkbox"
                                            checked={managerSettings.requirePinVoid}
                                            onChange={(e) => setManagerSettings({ ...managerSettings, requirePinVoid: e.target.checked })}
                                            style={{ width: '24px', height: '24px' }}
                                        />
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--pos-bg-hover)', borderRadius: '12px', cursor: 'pointer' }}>
                                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--pos-text-primary)' }}>Require PIN for Manual Discount</span>
                                        <input
                                            type="checkbox"
                                            checked={managerSettings.requirePinDiscount}
                                            onChange={(e) => setManagerSettings({ ...managerSettings, requirePinDiscount: e.target.checked })}
                                            style={{ width: '24px', height: '24px' }}
                                        />
                                    </label>
                                </div>
                                <div style={{ marginTop: '32px' }}>
                                    <label className="pos-label">Max Discount Percentage (%)</label>
                                    <input
                                        type="number"
                                        className="pos-input"
                                        value={managerSettings.maxDiscountPercent}
                                        onChange={(e) => setManagerSettings({ ...managerSettings, maxDiscountPercent: parseInt(e.target.value) })}
                                        style={{ width: '120px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '24px', borderTop: '1px solid var(--pos-border-subtle)' }}>
                        <button
                            onClick={handleSave}
                            className="pos-btn pos-btn-primary"
                            style={{ padding: '16px 32px', fontSize: '18px', gap: '12px' }}
                        >
                            <Save size={20} />
                            Save Changes
                        </button>
                    </div>

                </div>
            </div>

            <style jsx>{`
                .pos-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--pos-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 8px;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default POSSettingsPage;
