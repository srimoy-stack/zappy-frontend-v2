import React from 'react';
import { FileText, Download, X } from 'lucide-react';

interface BulkSelectionBarProps {
    selectedCount: number;
    onClear: () => void;
    onGenerateReport: () => void;
}

export const BulkSelectionBar: React.FC<BulkSelectionBarProps> = ({
    selectedCount,
    onClear,
    onGenerateReport
}) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-6 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-md bg-opacity-95">
                <div className="flex items-center gap-3 border-r border-slate-700 pr-6">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-[11px] font-bold rounded-full">
                        {selectedCount}
                    </div>
                    <span className="text-[13px] font-bold tracking-wide uppercase">Selected</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onGenerateReport}
                        className="flex items-center gap-2 px-4 py-1.5 bg-white text-black hover:bg-slate-100 rounded-lg text-[13px] font-bold transition-all"
                    >
                        <FileText className="w-4 h-4" />
                        Generate Report
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[13px] font-bold transition-all"
                        onClick={() => { }} // Placeholder for Export
                    >
                        <Download className="w-4 h-4" />
                        Export XML/CSV
                    </button>
                </div>

                <button
                    onClick={onClear}
                    className="p-1 hover:bg-slate-800 rounded-md transition-all text-slate-400 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
