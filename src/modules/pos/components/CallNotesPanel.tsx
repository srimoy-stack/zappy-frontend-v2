'use client';

import React, { useState } from 'react';
import { FileText, MapPin, Mic, Save, X } from 'lucide-react';
import '../styles/pos-rush.css';

interface CallNotesPanelProps {
    onSave: (notes: string, landmark: string) => void;
    initialNotes?: string;
    initialLandmark?: string;
    onClose?: () => void;
}

const QUICK_NOTES = [
    'Gate Code needed',
    'Call on Arrival',
    'Leave at Door',
    'Extra Napkins',
    'Allergies: Nuts',
    'Allergies: Gluten'
];

export const CallNotesPanel: React.FC<CallNotesPanelProps> = ({
    onSave,
    initialNotes = '',
    initialLandmark = '',
    onClose
}) => {
    const [notes, setNotes] = useState(initialNotes);
    const [landmark, setLandmark] = useState(initialLandmark);

    const handleQuickNote = (note: string) => {
        setNotes(prev => prev ? `${prev}, ${note}` : note);
    };

    const handleSave = () => {
        onSave(notes, landmark);
        if (onClose) onClose();
    };

    return (
        <div className="pos-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="pos-header" style={{ padding: '16px', background: 'var(--pos-bg-card)', borderBottom: '1px solid var(--pos-border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} color="var(--pos-action-primary)" />
                    <span className="pos-title-md">Call / Delivery Notes</span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="pos-btn-secondary" style={{ width: '32px', height: '32px', padding: 0 }}>
                        <X size={16} />
                    </button>
                )}
            </div>

            <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--pos-text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} /> Landmark / Direction
                    </div>
                    <input
                        className="pos-input"
                        placeholder="e.g. Near the big oak tree, blue door..."
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--pos-text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mic size={16} /> Special Instructions
                    </div>
                    <textarea
                        className="pos-input"
                        style={{ height: '120px', resize: 'none', paddingTop: '12px', lineHeight: '1.4' }}
                        placeholder="Type notes here..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--pos-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Quick Notes
                    </div>
                    <div className="pos-grid-2">
                        {QUICK_NOTES.map(note => (
                            <button
                                key={note}
                                className="pos-btn-secondary"
                                style={{ fontSize: '13px', padding: '8px', height: 'auto', justifyContent: 'start' }}
                                onClick={() => handleQuickNote(note)}
                            >
                                + {note}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid var(--pos-border-subtle)', background: 'var(--pos-bg-card)' }}>
                <button
                    onClick={handleSave}
                    className="pos-btn-primary"
                    style={{ width: '100%' }}
                >
                    <Save size={20} style={{ marginRight: '8px' }} />
                    Save Notes
                </button>
            </div>
        </div>
    );
};

export default CallNotesPanel;
