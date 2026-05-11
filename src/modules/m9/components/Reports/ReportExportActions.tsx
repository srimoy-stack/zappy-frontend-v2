import React from 'react';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { cn } from '@/utils';

interface ReportExportActionsProps {
    onExport: (format: 'csv' | 'excel' | 'pdf') => void;
    disabled?: boolean;
}

export const ReportExportActions: React.FC<ReportExportActionsProps> = ({
    onExport,
    disabled = false
}) => {
    return (
        <div className="flex items-center gap-2 justify-end mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Export Data:</span>

            <ExportButton
                label="CSV"
                icon={Download}
                onClick={() => onExport('csv')}
                disabled={disabled}
            />
            <ExportButton
                label="Excel"
                icon={FileSpreadsheet}
                onClick={() => onExport('excel')}
                disabled={disabled}
                variant="secondary"
            />
            <ExportButton
                label="Print / PDF"
                icon={Printer}
                onClick={() => onExport('pdf')}
                disabled={disabled}
                variant="secondary"
            />
        </div>
    );
};

const ExportButton = ({
    label,
    icon: Icon,
    onClick,
    disabled,
    variant = 'primary'
}: {
    label: string,
    icon: any,
    onClick: () => void,
    disabled: boolean,
    variant?: 'primary' | 'secondary'
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 border",
            disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md",
            variant === 'primary'
                ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-700"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
        )}
    >
        <Icon className="w-3.5 h-3.5" />
        {label}
    </button>
);
