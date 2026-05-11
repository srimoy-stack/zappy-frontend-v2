import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils';

interface ErrorStateProps {
    title?: string;
    message: string;
    className?: string;
    onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Error',
    message,
    className,
    onRetry
}) => {
    return (
        <div className={cn('flex flex-col items-center justify-center p-12', className)}>
            <div className="rounded-full bg-red-50 p-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 text-center mb-4 max-w-md">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    );
};
