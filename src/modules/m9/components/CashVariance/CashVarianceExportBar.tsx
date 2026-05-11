import React from 'react';
import { Download, FileText, Printer, Search } from 'lucide-react';

interface CashVarianceExportBarProps {
    onSearch: (query: string) => void;
    onExport: (format: 'CSV' | 'PDF' | 'PRINT') => void;
}

export const CashVarianceExportBar: React.FC<CashVarianceExportBarProps> = ({
    onSearch,
    onExport
}) => {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            {/* Search */}
            <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by user or record ID..."
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                />
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2 whitespace-nowrap">Exports:</p>
                <button
                    onClick={() => onExport('CSV')}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all whitespace-nowrap"
                >
                    <FileText className="w-3.5 h-3.5" />
                    CSV
                </button>
                <button
                    onClick={() => onExport('PDF')}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all whitespace-nowrap"
                >
                    <Download className="w-3.5 h-3.5" />
                    Excel
                </button>
                <button
                    onClick={() => onExport('PRINT')}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all whitespace-nowrap"
                >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                </button>
            </div>
        </div>
    );
};
