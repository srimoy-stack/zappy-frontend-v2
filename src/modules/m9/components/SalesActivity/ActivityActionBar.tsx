import React from 'react';
import { Search, FileSpreadsheet, FileText, FileCode, Printer, Columns, Plus } from 'lucide-react';
import { useRouteAccess } from '@/hooks/useRouteAccess';

interface ActivityActionBarProps {
    onSearch: (query: string) => void;
    onExport: (format: 'csv' | 'excel' | 'pdf' | 'print') => void;
    onAdd: () => void;
}

export const ActivityActionBar: React.FC<ActivityActionBarProps> = ({
    onSearch,
    onExport,
    onAdd
}) => {
    const { role } = useRouteAccess();
    const canExport = role === 'ADMIN' || role === 'STORE_MANAGER';

    return (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-4 w-full lg:w-auto">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest whitespace-nowrap">All sales</h3>
                <div className="relative flex-1 lg:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-emerald-500"
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                {canExport && (
                    <>
                        <IconButton onClick={() => onExport('pdf')} icon={FileText} label="Export PDF" />
                        <IconButton onClick={() => onExport('excel')} icon={FileSpreadsheet} label="Export Excel" />
                        <IconButton onClick={() => onExport('csv')} icon={FileCode} label="Export Multi" />
                        <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                    </>
                )}

                <IconButton icon={Columns} label="Column visibility" />
                <IconButton onClick={() => window.print()} icon={Printer} label="Export PDF" />

                <button
                    onClick={onAdd}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ml-2"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                </button>
            </div>
        </div>
    );
};

const IconButton = ({ onClick, icon: Icon, label }: { onClick?: () => void, icon: any, label: string }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-600 uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap"
    >
        <Icon className="w-3 h-3 text-slate-400" />
        {label}
    </button>
);
