import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface POSBackButtonProps {
    onClick?: () => void;
    label?: string;
    style?: React.CSSProperties;
}

export const POSBackButton: React.FC<POSBackButtonProps> = ({ onClick, label = 'BACK', style }) => {
    const router = useRouter();

    const handleBack = () => {
        if (onClick) {
            onClick();
        } else {
            router.back();
        }
    };

    return (
        <button
            onClick={handleBack}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0 24px',
                height: '64px',
                background: 'var(--pos-bg-surface)',
                border: '1px solid var(--pos-border-subtle)',
                borderRadius: '16px',
                color: 'var(--pos-text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                fontWeight: 900,
                fontSize: '18px',
                textTransform: 'uppercase',
                zIndex: 100,
                ...style
            }}
            className="hover-scale"
        >
            <ArrowLeft size={28} strokeWidth={3} />
            {label}
        </button>
    );
};
