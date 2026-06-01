import React from 'react';
import { PortionMode, Portion } from './types';

interface Props {
    mode: PortionMode;
    onModeChange: (mode: PortionMode) => void;
    portion?: Portion;
    onPortionChange?: (portion: Portion) => void;
}

const HalfHalfSVG: React.FC<{ portion: Portion; active: boolean; size: number }> = ({ portion, active, size }) => {
    const activeColor = 'var(--pos-action-primary)';
    const inactiveColor = '#CBD5E1';
    const bgColor = '#F1F5F9';

    const fillLeft = portion === 'LEFT' || portion === 'WHOLE';
    const fillRight = portion === 'RIGHT' || portion === 'WHOLE';

    return (
        <svg width={size} height={size} viewBox="0 0 40 40">
            {/* Background circle */}
            <circle cx="20" cy="20" r="18" fill={bgColor} stroke={active ? activeColor : inactiveColor} strokeWidth={active ? 2.5 : 1.5} />
            
            {/* Left Half Path */}
            <path 
                d="M20 2 A18 18 0 0 0 20 38 Z" 
                fill={fillLeft ? (active ? activeColor : '#94A3B8') : bgColor} 
            />
            
            {/* Right Half Path */}
            <path 
                d="M20 2 A18 18 0 0 1 20 38 Z" 
                fill={fillRight ? (active ? activeColor : '#94A3B8') : bgColor} 
            />
            
            {/* Center dividing line */}
            <line x1="20" y1="2" x2="20" y2="38" stroke="white" strokeWidth="2" />
        </svg>
    );
};

export const PortionSelector: React.FC<Props> = ({ mode, onModeChange, portion = 'WHOLE', onPortionChange }) => {
    const modes: { key: PortionMode; label: string; multiplier: string }[] = [
        { key: 'SINGLE', label: 'Single', multiplier: '1X' },
        { key: 'DOUBLE', label: 'Double', multiplier: '2X' },
        { key: 'TRIPLE', label: 'Triple', multiplier: '3X' },
    ];

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 0'
        }}>
            <div style={{
                display: 'flex',
                background: 'var(--pos-bg-surface)',
                borderRadius: '16px',
                border: '1px solid var(--pos-border-subtle)',
                overflow: 'hidden'
            }}>
                {modes.map(m => (
                    <button
                        key={m.key}
                        onClick={() => onModeChange(m.key)}
                        style={{
                            padding: '14px 24px',
                            border: 'none',
                            background: mode === m.key ? 'var(--pos-bg-main)' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            borderRight: '1px solid var(--pos-border-subtle)'
                        }}
                    >
                        <span style={{
                            fontSize: '22px',
                            fontWeight: 900,
                            color: mode === m.key ? 'var(--pos-text-primary)' : 'var(--pos-text-muted)'
                        }}>
                            {m.multiplier}
                        </span>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--pos-text-muted)',
                            textTransform: 'uppercase'
                        }}>
                            {m.label}
                        </span>
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                <button
                    onClick={() => onPortionChange?.('LEFT')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        borderRadius: '50%',
                        outline: 'none',
                        transition: 'transform 0.1s'
                    }}
                    className="hover-scale"
                    title="Left Half"
                >
                    <HalfHalfSVG portion="LEFT" active={portion === 'LEFT'} size={44} />
                </button>
                <button
                    onClick={() => onPortionChange?.('WHOLE')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        borderRadius: '50%',
                        outline: 'none',
                        transition: 'transform 0.1s'
                    }}
                    className="hover-scale"
                    title="Whole Pizza"
                >
                    <HalfHalfSVG portion="WHOLE" active={portion === 'WHOLE'} size={44} />
                </button>
                <button
                    onClick={() => onPortionChange?.('RIGHT')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        borderRadius: '50%',
                        outline: 'none',
                        transition: 'transform 0.1s'
                    }}
                    className="hover-scale"
                    title="Right Half"
                >
                    <HalfHalfSVG portion="RIGHT" active={portion === 'RIGHT'} size={44} />
                </button>
            </div>
        </div>
    );
};
