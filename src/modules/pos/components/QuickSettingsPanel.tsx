'use client';

import React, { useState } from 'react';
import { X, Printer, Globe, Palette, Volume2, VolumeX, Wifi, WifiOff, Monitor } from 'lucide-react';
import '../styles/pos-rush.css';

interface QuickSettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const QuickSettingsPanel: React.FC<QuickSettingsPanelProps> = ({ isOpen, onClose }) => {
    const [settings, setSettings] = useState({
        printer: 'Epson TM-T88VI',
        language: 'en',
        theme: 'blue',
        sound: true,
        autoprint: true,
        offline: false,
        displayMode: 'normal'
    });

    const printers = [
        'Epson TM-T88VI',
        'Star TSP143III',
        'HP LaserJet Pro',
        'None'
    ];

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' }
    ];

    const themes = [
        { id: 'blue', name: 'Blue (Rush Mode)', color: '#1E3A8A' },
        { id: 'dark', name: 'Dark', color: '#1F2937' },
        { id: 'light', name: 'Light', color: '#F3F4F6' }
    ];

    const handleSave = () => {
        // Save settings to local storage or API
        localStorage.setItem('posSettings', JSON.stringify(settings));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 999,
                    animation: 'fadeIn 0.2s'
                }}
            />

            {/* Panel */}
            <div style={{
                position: 'fixed',
                right: 0,
                top: 0,
                bottom: 0,
                width: '100%',
                maxWidth: '500px',
                background: '#1E3A8A',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.3)',
                animation: 'slideInRight 0.3s'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                            Quick Settings
                        </h2>
                        <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                            Configure POS preferences
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }} className="pos-scroll">
                    {/* Printer */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: 'white',
                            marginBottom: '16px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            <Printer size={20} />
                            Receipt Printer
                        </label>
                        <select
                            value={settings.printer}
                            onChange={(e) => setSettings({ ...settings, printer: e.target.value })}
                            className="pos-input"
                            style={{ fontSize: '15px' }}
                        >
                            {printers.map(printer => (
                                <option key={printer} value={printer}>{printer}</option>
                            ))}
                        </select>

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginTop: '16px',
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={settings.autoprint}
                                onChange={(e) => setSettings({ ...settings, autoprint: e.target.checked })}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>
                                Auto-print receipts after payment
                            </span>
                        </label>
                    </div>

                    {/* Language */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: 'white',
                            marginBottom: '16px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            <Globe size={20} />
                            Language
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => setSettings({ ...settings, language: lang.code })}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: settings.language === lang.code ? '2px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                                        background: settings.language === lang.code ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                        color: 'white',
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Theme */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: 'white',
                            marginBottom: '16px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            <Palette size={20} />
                            Theme
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {themes.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => setSettings({ ...settings, theme: theme.id })}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: settings.theme === theme.id ? '2px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                                        background: settings.theme === theme.id ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        background: theme.color,
                                        borderRadius: '8px',
                                        border: '2px solid rgba(255, 255, 255, 0.3)'
                                    }} />
                                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>
                                        {theme.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sound */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: 'white',
                            marginBottom: '16px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            {settings.sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
                            Sound Effects
                        </label>
                        <button
                            onClick={() => setSettings({ ...settings, sound: !settings.sound })}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '2px solid rgba(255, 255, 255, 0.2)',
                                background: settings.sound ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <span style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>
                                {settings.sound ? 'Enabled' : 'Disabled'}
                            </span>
                            <div style={{
                                width: '56px',
                                height: '32px',
                                background: settings.sound ? '#10B981' : '#64748B',
                                borderRadius: '16px',
                                position: 'relative',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '4px',
                                    left: settings.sound ? '28px' : '4px',
                                    transition: 'all 0.2s'
                                }} />
                            </div>
                        </button>
                    </div>

                    {/* Display Mode */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: 'white',
                            marginBottom: '16px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            <Monitor size={20} />
                            Display Mode
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {['normal', 'compact'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setSettings({ ...settings, displayMode: mode })}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: settings.displayMode === mode ? '2px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                                        background: settings.displayMode === mode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                        color: 'white',
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Offline Mode */}
                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: 'white',
                            marginBottom: '16px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            {settings.offline ? <WifiOff size={20} /> : <Wifi size={20} />}
                            Connection Mode
                        </label>
                        <div style={{
                            padding: '16px',
                            background: settings.offline ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            border: `2px solid ${settings.offline ? '#F59E0B' : '#10B981'}`,
                            borderRadius: '12px'
                        }}>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: settings.offline ? '#FCD34D' : '#6EE7B7', marginBottom: '8px' }}>
                                {settings.offline ? 'Offline Mode' : 'Online Mode'}
                            </div>
                            <div style={{ fontSize: '13px', color: settings.offline ? 'rgba(252, 211, 77, 0.8)' : 'rgba(110, 231, 183, 0.8)', fontWeight: 600 }}>
                                {settings.offline ? 'Orders will sync when connection is restored' : 'Connected to server'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '24px', borderTop: '2px solid rgba(255, 255, 255, 0.1)' }}>
                    <div className="pos-grid-2" style={{ gap: '12px' }}>
                        <button onClick={onClose} className="pos-btn pos-btn-secondary">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="pos-btn pos-btn-primary" style={{ background: 'white', color: '#1E3A8A' }}>
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </>
    );
};
