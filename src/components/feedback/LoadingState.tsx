import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils';

interface LoadingStateProps {
    message?: string;
    className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Loading...',
    className
}) => {
    return (
        <div className={cn('flex flex-col items-center justify-center p-12', className)}>
            <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-3" />
            <p className="text-sm text-slate-500">{message}</p>
        </div>
    );
};
