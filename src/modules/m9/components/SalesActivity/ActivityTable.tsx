import React from 'react';
import { TransactionEvent, PaymentStatus, SalesChannel } from '../../types/sales-activity';
import { formatCurrency } from '@/utils';
import { cn } from '@/utils';
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Eye,
    Printer,
    Mail,
    Undo2,
    Trash2,
    FileDown,
    FileText
} from 'lucide-react';

interface ActivityTableProps {
    data: TransactionEvent[];
    isLoading: boolean;
    onRowClick: (transaction: TransactionEvent) => void;
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
    data,
    isLoading,
    onRowClick,
    currentPage,
    itemsPerPage,
    totalItems,
    onPageChange,
    onItemsPerPageChange
}) => {
    if (isLoading) {
        return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-24 text-center shadow-sm">
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-slate-50 rounded-full"><AlertCircle className="w-12 h-12 text-slate-200" /></div>
                    <div><h3 className="text-lg font-bold text-slate-800">No Sales Found</h3></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded shadow-sm flex flex-col overflow-visible">
            <div className="overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-left border-collapse table-auto min-w-[1800px] mb-24">
                    <thead>
                        <tr className="bg-white border-b border-slate-100">
                            <TableHead label="Action" sticky={true} />
                            <TableHead label="Date" />
                            <TableHead label="Invoice No." />
                            <TableHead label="Customer name" />
                            <TableHead label="Contact number" />
                            <TableHead label="Location" />
                            <TableHead label="Order Source" />
                            <TableHead label="Payment status" />
                            <TableHead label="Payment Method" />
                            <TableHead label="Total amount" align="right" />
                            <TableHead label="Base Price" align="right" />
                            <TableHead label="Tax" align="right" />
                            <TableHead label="Total" align="right" />
                            <TableHead label="Net Price" align="right" />
                            <TableHead label="Sell Price" align="right" />
                            <TableHead label="Return" align="right" />
                            <TableHead label="Shipping" align="right" />
                            <TableHead label="Net due" align="right" />
                            <TableHead label="Total items" align="center" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((row) => (
                            <ActivityRow key={row.id} row={row} onClick={() => onRowClick(row)} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-4 py-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Show</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                        >
                            {[10, 25, 50, 100].map(val => (
                                <option key={val} value={val}>{val}</option>
                            ))}
                        </select>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entries</span>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-100 hidden sm:block" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    <PaginationButton
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        icon={ChevronsLeft}
                    />
                    <PaginationButton
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        icon={ChevronLeft}
                    />

                    <div className="flex items-center px-2">
                        <span className="text-xs font-black text-slate-900 mx-2">{currentPage}</span>
                        <span className="text-xs font-bold text-slate-300 mx-1">/</span>
                        <span className="text-xs font-bold text-slate-400 mx-2">{Math.ceil(totalItems / itemsPerPage) || 1}</span>
                    </div>

                    <PaginationButton
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                        icon={ChevronRight}
                    />
                    <PaginationButton
                        onClick={() => onPageChange(Math.ceil(totalItems / itemsPerPage))}
                        disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                        icon={ChevronsRight}
                    />
                </div>
            </div>
        </div>
    );
};

const PaginationButton = ({ onClick, disabled, icon: Icon }: { onClick: () => void, disabled: boolean, icon: any }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "p-1.5 rounded-md transition-all border",
            disabled
                ? "bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-90"
        )}
    >
        <Icon className="w-4 h-4" />
    </button>
);

const ActivityRow = ({ row, onClick }: { row: TransactionEvent; onClick: () => void }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const dateStr = new Date(row.timestamp).toLocaleDateString() + ' ' + new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handleAction = (e: React.MouseEvent, action: string) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        switch (action) {
            case 'view':
                onClick();
                break;
            case 'print':
                alert(`Printing Invoice: ${row.invoiceNo}`);
                break;
            case 'email':
                alert(`Emailing Invoice: ${row.invoiceNo} to customer`);
                break;
            case 'export-csv':
                alert(`Exporting transaction ${row.invoiceNo} as CSV...`);
                break;
            case 'export-pdf':
                alert(`Exporting transaction ${row.invoiceNo} as PDF...`);
                break;
            case 'refund':
                alert(`Initiating Refund for: ${row.invoiceNo}`);
                break;
            case 'delete':
                if (confirm(`Are you sure you want to delete transaction ${row.invoiceNo}?`)) {
                    alert('Deleted successfully (Simulated)');
                }
                break;
        }
    };

    return (
        <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={onClick}>
            <td className={cn(
                "px-4 py-3 sticky left-0 group-hover:bg-slate-50 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)] transition-all bg-white",
                isMenuOpen ? "z-50" : "z-10"
            )}>
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all border shadow-sm",
                            isMenuOpen
                                ? "bg-slate-900 text-white border-slate-900 scale-95"
                                : "bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100 active:scale-95"
                        )}
                    >
                        Actions
                        <ChevronDownMini className={cn("w-3 h-3 transition-transform duration-200", isMenuOpen && "rotate-180")} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-visible animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-1.5 bg-white rounded-xl">
                                <ActionItem
                                    icon={Eye}
                                    label="View Details"
                                    onClick={(e) => handleAction(e, 'view')}
                                    variant="blue"
                                />
                                <ActionItem
                                    icon={Printer}
                                    label="Print Invoice"
                                    onClick={(e) => handleAction(e, 'print')}
                                />
                                <ActionItem
                                    icon={Mail}
                                    label="Email Invoice"
                                    onClick={(e) => handleAction(e, 'email')}
                                />
                                <div className="h-px bg-slate-100 my-1 mx-1" />
                                <ActionItem
                                    icon={FileDown}
                                    label="Export CSV"
                                    onClick={(e) => handleAction(e, 'export-csv')}
                                />
                                <ActionItem
                                    icon={FileText}
                                    label="Export PDF"
                                    onClick={(e) => handleAction(e, 'export-pdf')}
                                />
                                <div className="h-px bg-slate-100 my-1 mx-1" />
                                <ActionItem
                                    icon={Undo2}
                                    label="Refund / Return"
                                    onClick={(e) => handleAction(e, 'refund')}
                                    variant="amber"
                                />
                                <ActionItem
                                    icon={Trash2}
                                    label="Delete"
                                    onClick={(e) => handleAction(e, 'delete')}
                                    variant="red"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600 font-medium">{dateStr}</td>
            <td className="px-4 py-3 text-xs text-blue-600 font-bold hover:underline">{row.invoiceNo}</td>
            <td className="px-4 py-3 text-xs text-slate-700 font-medium capitalize prose-sm">{row.customerName}</td>
            <td className="px-4 py-3 text-xs text-slate-500 font-medium">{row.contactNumber}</td>
            <td className="px-4 py-3">
                <div className="max-w-[200px] text-[10px] text-slate-400 font-medium leading-relaxed">
                    {row.location}
                </div>
            </td>
            <td className="px-4 py-3">
                <OrderSourceBadge channel={row.channel} />
            </td>
            <td className="px-4 py-3">
                <div className="flex justify-center">
                    <PaymentStatusBadge status={row.paymentStatus} />
                </div>
            </td>
            <td className="px-4 py-3 text-xs text-slate-600 font-bold">{row.paymentMethod}</td>
            <td className="px-4 py-3 text-right text-xs text-slate-900 font-black">{formatCurrency(row.totalAmount)}</td>
            <td className="px-4 py-3 text-right text-xs text-slate-500 font-medium">{formatCurrency(row.basePrice)}</td>
            <td className="px-4 py-3 text-right text-xs text-slate-500 font-medium">{formatCurrency(row.tax)}</td>
            <td className="px-4 py-3 text-right text-xs text-slate-500 font-medium">{formatCurrency(row.totalAmount)}</td>
            <td className="px-4 py-3 text-right text-xs text-slate-500 font-medium">{formatCurrency(row.netPrice)}</td>
            <td className="px-4 py-3 text-right text-xs text-slate-500 font-medium">{formatCurrency(row.sellPrice)}</td>
            <td className="px-4 py-3 text-right text-xs text-red-400 font-medium">{formatCurrency(row.returnAmount)}</td>
            <td className="px-4 py-3 text-right text-xs text-slate-500 font-medium">{formatCurrency(row.shipping)}</td>
            <td className="px-4 py-3 text-right text-xs text-slate-900 font-black">{formatCurrency(row.netDue)}</td>
            <td className="px-4 py-3 text-center text-xs text-slate-600 font-bold">{row.totalItems}</td>
        </tr>
    );
};

const ActionItem = ({
    icon: Icon,
    label,
    onClick,
    variant = 'default'
}: {
    icon: any,
    label: string,
    onClick: (e: React.MouseEvent) => void,
    variant?: 'default' | 'red' | 'blue' | 'amber'
}) => {
    const variants = {
        default: 'text-slate-700 hover:bg-slate-50',
        red: 'text-rose-600 hover:bg-rose-50',
        blue: 'text-blue-600 hover:bg-blue-50',
        amber: 'text-amber-600 hover:bg-amber-50'
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg transition-colors group",
                variants[variant]
            )}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
};


const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
    const styles = {
        Paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
        Partial: "bg-amber-50 text-amber-600 border-amber-100",
        Due: "bg-red-50 text-red-600 border-red-100",
        Refunded: "bg-slate-50 text-slate-600 border-slate-100"
    };
    return (
        <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-widest", styles[status])}>
            {status}
        </span>
    );
};

const OrderSourceBadge = ({ channel }: { channel: SalesChannel }) => {
    const styles: Record<SalesChannel, string> = {
        POS: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        ONLINE: 'bg-blue-50 text-blue-600 border-blue-100',
        UBER: 'bg-violet-50 text-violet-600 border-violet-100',
        PHONE: 'bg-amber-50 text-amber-600 border-amber-100',
    };
    return (
        <span className={cn('px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-widest', styles[channel] || 'bg-slate-50 text-slate-500 border-slate-100')}>
            {channel}
        </span>
    );
};

const ChevronDownMini = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const TableHead = ({
    label,
    align = 'left',
    sticky = false
}: {
    label: string;
    align?: 'left' | 'right' | 'center';
    sticky?: boolean;
}) => (
    <th className={cn(
        "px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50",
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
        sticky && "sticky left-0 z-20 bg-slate-50 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]"
    )}>
        {label}
    </th>
);
