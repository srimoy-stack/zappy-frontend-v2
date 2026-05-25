import React from 'react';
import { ChevronRight } from 'lucide-react';
import { CategoryView } from './types';

interface SidebarItem {
    id: CategoryView;
    label: string;
    icon: string;
    count: number;
}

interface Props {
    items: SidebarItem[];
    active: CategoryView;
    onSelect: (id: CategoryView) => void;
}

export const ConfiguratorSidebar: React.FC<Props> = ({ items, active, onSelect }) => {
    return (
        <div style={{
            width: '240px',
            background: 'var(--pos-bg-surface)',
            borderRight: '1px solid var(--pos-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 16px',
            gap: '10px',
            overflowY: 'auto',
            flexShrink: 0
        }} className="pos-scroll">
            {items.map(cat => {
                const isActive = active === cat.id;
                return (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        style={{
                            width: '100%',
                            padding: '18px 16px',
                            borderRadius: '16px',
                            background: isActive ? 'rgba(31, 164, 169, 0.08)' : 'transparent',
                            border: isActive ? '2px solid var(--pos-action-primary)' : '1.5px solid var(--pos-border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: isActive ? 'var(--pos-action-primary)' : 'var(--pos-bg-main)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            color: isActive ? 'white' : 'var(--pos-text-muted)',
                            flexShrink: 0
                        }}>
                            {cat.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: '15px',
                                fontWeight: 800,
                                color: isActive ? 'var(--pos-text-primary)' : 'var(--pos-text-secondary)',
                                lineHeight: 1.2
                            }}>
                                {cat.label}
                            </div>
                            {cat.count > 0 && (
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    color: 'var(--pos-action-primary)',
                                    marginTop: '2px'
                                }}>
                                    {cat.count} ACTIVE
                                </div>
                            )}
                        </div>
                        {isActive && <ChevronRight size={18} color="var(--pos-action-primary)" />}
                    </button>
                );
            })}
        </div>
    );
};
