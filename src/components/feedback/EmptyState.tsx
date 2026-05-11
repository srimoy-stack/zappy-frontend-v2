import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../utils';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon,
    action,
    className
}) => {
    return (
        <div className={cn('flex flex-col items-center justify-center p-12', className)}>
            <div className="rounded-full bg-slate-100 p-3 mb-4">
                {icon || <Inbox className="h-6 w-6 text-slate-400" />}
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-slate-500 text-center mb-4 max-w-md">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};
