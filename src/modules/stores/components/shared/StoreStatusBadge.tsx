'use client';

import React from 'react';
import { cn } from '@/utils';
import type { StoreStatus } from '@/shared/types/store';
import { STORE_STATUS_CONFIG } from '@/shared/types/store';

interface StoreStatusBadgeProps {
    status: StoreStatus;
    size?: 'sm' | 'md';
    showDot?: boolean;
}

/**
 * Consistent status badge for store cards and detail pages.
 * Maps to STORE_STATUS_CONFIG for centralized color definitions.
 */
export function StoreStatusBadge({ status, size = 'sm', showDot = true }: StoreStatusBadgeProps) {
    const config = STORE_STATUS_CONFIG[status] || STORE_STATUS_CONFIG.Draft;

    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full border font-black uppercase tracking-wider',
            config.bgColor, config.color, config.borderColor,
            size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]',
        )}>
            {showDot && (
                <span className={cn('rounded-full shrink-0', config.dotColor,
                    size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
                )} />
            )}
            {config.label}
        </span>
    );
}
