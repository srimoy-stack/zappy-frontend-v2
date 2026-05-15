'use client';

import React from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface TooltipProps {
    /** Text to show in the tooltip */
    label: string;
    /** Position of the tooltip relative to the trigger */
    position?: 'top' | 'bottom' | 'left' | 'right';
    /** Child element that triggers the tooltip */
    children: React.ReactNode;
}

// ============================================================================
// POSITION STYLES
// ============================================================================

const POSITION_CLASSES: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Accessible Tooltip component.
 *
 * Usage:
 * ```tsx
 * <Tooltip label="Edit segment">
 *   <button><Pencil /></button>
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
    label,
    position = 'top',
    children,
}) => {
    return (
        <div className="group/tooltip relative inline-flex">
            {children}
            <div
                role="tooltip"
                className={`
                    absolute ${POSITION_CLASSES[position]}
                    pointer-events-none
                    opacity-0 group-hover/tooltip:opacity-100
                    scale-95 group-hover/tooltip:scale-100
                    transition-all duration-150 ease-out
                    z-50
                    px-2.5 py-1.5 rounded-lg
                    bg-slate-900 text-white
                    text-[11px] font-semibold
                    whitespace-nowrap
                    shadow-lg
                `}
            >
                {label}
            </div>
        </div>
    );
};

export default Tooltip;
