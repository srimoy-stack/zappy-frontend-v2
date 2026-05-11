import React, { useState } from 'react';
import { Customer, ColumnVisibilitySettings } from '../../types/customers';
import {
    Eye,
    Edit,
    Trash2,
    DollarSign,
    FileText,
    ShoppingCart,
    ChevronRight
} from 'lucide-react';
import { CustomerActionModal } from './CustomerActionModal';

interface CustomersTableProps {
    data: Customer[];
    onRowClick: (customer: Customer) => void;
    columnVisibility: ColumnVisibilitySettings;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
    data,
    onRowClick,
    columnVisibility
}) => {
    const [openActionId, setOpenActionId] = useState<string | null>(null);
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        customer: Customer | null;
        type: 'pay' | 'edit' | 'documents' | null;
    }>({
        isOpen: false,
        customer: null,
        type: null
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            signDisplay: 'always',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const toggleActions = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setOpenActionId(openActionId === id ? null : id);
    };

    const handleAction = (e: React.MouseEvent, action: string, customer: Customer) => {
        e.stopPropagation();
        setOpenActionId(null);

        switch (action) {
            case 'view':
                onRowClick(customer);
                break;
            case 'edit':
                setModalConfig({ isOpen: true, customer, type: 'edit' });
                break;
            case 'sales':
                const searchParam = encodeURIComponent(customer.name);
                window.location.href = `/backoffice/sales-activity?q=${searchParam}`;
                break;
            case 'pay':
                setModalConfig({ isOpen: true, customer, type: 'pay' });
                break;
            case 'documents':
                setModalConfig({ isOpen: true, customer, type: 'documents' });
                break;
            case 'delete':
                if (confirm(`Are you sure you want to deactivate ${customer.name}? This will mark them as Inactive.`)) {
                    console.log(`Deactivating customer ${customer.id}`);
                }
                break;
        }
    };

    return (
        <div className="relative">
            {/* Backdrop for dropdown */}
            {openActionId && (
                <div
                    className="fixed inset-0 z-40 outline-none"
                    onClick={() => setOpenActionId(null)}
                />
            )}

            <div className="overflow-x-auto pb-48 w-full max-w-full">
                <table className="w-full text-left border-separate border-spacing-0 min-w-max">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {columnVisibility.action && (
                                <th className="px-4 py-4 text-[11px] font-black text-slate-700 uppercase tracking-widest w-[120px] sticky left-0 bg-slate-100 z-30 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.15)] border-r border-slate-200">
                                    Action
                                </th>
                            )}
                            {columnVisibility.contactId && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Contact ID</th>
                            )}
                            {columnVisibility.businessName && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Business Name</th>
                            )}
                            {columnVisibility.name && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Name</th>
                            )}
                            {columnVisibility.email && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Email</th>
                            )}
                            {columnVisibility.taxNumber && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Tax number</th>
                            )}
                            {columnVisibility.creditLimit && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center whitespace-nowrap">Credit Limit</th>
                            )}
                            {columnVisibility.payTerm && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center whitespace-nowrap">Pay term</th>
                            )}
                            {columnVisibility.openingBalance && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right whitespace-nowrap">Opening Balance</th>
                            )}
                            {columnVisibility.advanceBalance && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right whitespace-nowrap">Advance Balance</th>
                            )}
                            {columnVisibility.addedOn && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Added On</th>
                            )}
                            {columnVisibility.group && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Customer Group</th>
                            )}
                            {columnVisibility.address && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Address</th>
                            )}
                            {columnVisibility.mobile && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Mobile</th>
                            )}
                            {columnVisibility.totalSaleDue && (
                                <th className="px-6 py-4 text-[11px] font-bold text-red-600 uppercase tracking-wider text-right whitespace-nowrap">Total Sale Due</th>
                            )}
                            {columnVisibility.totalSellReturnDue && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right whitespace-nowrap">Total Sell Return Due</th>
                            )}
                            {columnVisibility.status && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center whitespace-nowrap">Status</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={17} className="px-6 py-12 text-center text-sm text-slate-500 whitespace-nowrap">
                                    No customers found
                                </td>
                            </tr>
                        ) : (
                            data.map((customer, index) => (
                                <tr
                                    key={customer.id}
                                    onClick={() => onRowClick(customer)}
                                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group text-sm"
                                >
                                    {/* Action Column */}
                                    {columnVisibility.action && (
                                        <td className={`px-4 py-4 text-center sticky left-0 bg-white group-hover:bg-blue-50/80 transition-colors border-r border-slate-100 whitespace-nowrap shadow-[4px_0_8px_-4px_rgba(0,0,0,0.15)] ${openActionId === customer.id ? 'z-50' : 'z-20'}`}>
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={(e) => toggleActions(e, customer.id)}
                                                    className="px-3 py-1.5 hover:bg-slate-900 hover:text-white rounded-lg text-slate-600 transition-all bg-slate-50 border border-slate-200 font-bold text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1.5"
                                                    aria-label="Actions"
                                                >
                                                    Actions <ChevronRight className={`w-3 h-3 transition-transform ${openActionId === customer.id ? 'rotate-90' : ''}`} />
                                                </button>

                                                {openActionId === customer.id && (
                                                    <div
                                                        className={`absolute left-0 ${index >= data.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'} w-64 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-200 z-[9999] overflow-hidden font-bold animate-in fade-in zoom-in-95 duration-200 origin-top-left`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="py-2.5">
                                                            <div className="px-5 py-2 text-[9px] uppercase font-black text-slate-400 border-b border-slate-100 mb-2 tracking-[0.2em]">
                                                                Management Menu
                                                            </div>
                                                            <button
                                                                onClick={(e) => handleAction(e, 'pay', customer)}
                                                                className="flex items-center gap-3 px-5 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 w-full text-left transition-colors whitespace-nowrap group/item"
                                                            >
                                                                <div className="p-1 bg-emerald-50 group-hover/item:bg-emerald-100 rounded transition-colors">
                                                                    <DollarSign className="w-3.5 h-3.5" />
                                                                </div>
                                                                Process Payment
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleAction(e, 'view', customer)}
                                                                className="flex items-center gap-3 px-5 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 w-full text-left transition-colors whitespace-nowrap group/item"
                                                            >
                                                                <div className="p-1 bg-blue-50 group-hover/item:bg-blue-100 rounded transition-colors">
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </div>
                                                                View Detailed Profile
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleAction(e, 'edit', customer)}
                                                                className="flex items-center gap-3 px-5 py-2.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-700 w-full text-left transition-colors whitespace-nowrap group/item"
                                                            >
                                                                <div className="p-1 bg-amber-50 group-hover/item:bg-amber-100 rounded transition-colors">
                                                                    <Edit className="w-3.5 h-3.5" />
                                                                </div>
                                                                Edit Information
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleAction(e, 'sales', customer)}
                                                                className="flex items-center gap-3 px-5 py-2.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 w-full text-left transition-colors whitespace-nowrap group/item"
                                                            >
                                                                <div className="p-1 bg-purple-50 group-hover/item:bg-purple-100 rounded transition-colors">
                                                                    <ShoppingCart className="w-3.5 h-3.5" />
                                                                </div>
                                                                Sales History
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleAction(e, 'documents', customer)}
                                                                className="flex items-center gap-3 px-5 py-2.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 w-full text-left transition-colors whitespace-nowrap group/item"
                                                            >
                                                                <div className="p-1 bg-indigo-50 group-hover/item:bg-indigo-100 rounded transition-colors">
                                                                    <FileText className="w-3.5 h-3.5" />
                                                                </div>
                                                                Manage Documents
                                                            </button>
                                                            <div className="h-px bg-slate-100 my-2 mx-5" />
                                                            <button
                                                                onClick={(e) => handleAction(e, 'delete', customer)}
                                                                className="flex items-center gap-3 px-5 py-2.5 text-xs text-red-600 hover:bg-red-50 w-full text-left transition-colors whitespace-nowrap"
                                                            >
                                                                <div className="p-1 bg-red-50 rounded">
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </div>
                                                                Deactivate Account
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    )}

                                    {/* Contact ID */}
                                    {columnVisibility.contactId && (
                                        <td className="px-6 py-4 font-medium text-blue-600 whitespace-nowrap">{customer.contactId}</td>
                                    )}

                                    {/* Business Name */}
                                    {columnVisibility.businessName && (
                                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">{customer.businessName || '-'}</td>
                                    )}

                                    {/* Name */}
                                    {columnVisibility.name && (
                                        <td className="px-6 py-4 font-medium whitespace-nowrap">{customer.name}</td>
                                    )}

                                    {/* Email */}
                                    {columnVisibility.email && (
                                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{customer.email}</td>
                                    )}

                                    {/* Tax Number */}
                                    {columnVisibility.taxNumber && (
                                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{customer.taxNumber || '-'}</td>
                                    )}

                                    {/* Credit Limit */}
                                    {columnVisibility.creditLimit && (
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600">
                                                {customer.creditLimit}
                                            </span>
                                        </td>
                                    )}

                                    {/* Pay Term */}
                                    {columnVisibility.payTerm && (
                                        <td className="px-6 py-4 text-center font-medium whitespace-nowrap">{customer.payTerm}</td>
                                    )}

                                    {/* Opening Balance */}
                                    {columnVisibility.openingBalance && (
                                        <td className="px-6 py-4 text-right font-medium whitespace-nowrap">
                                            {formatCurrency(customer.openingBalance)}
                                        </td>
                                    )}

                                    {/* Advance Balance */}
                                    {columnVisibility.advanceBalance && (
                                        <td className="px-6 py-4 text-right font-medium text-green-600 whitespace-nowrap">
                                            {formatCurrency(customer.advanceBalance)}
                                        </td>
                                    )}

                                    {/* Added On */}
                                    {columnVisibility.addedOn && (
                                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                            {formatDate(customer.addedOn)}
                                        </td>
                                    )}

                                    {/* Customer Group */}
                                    {columnVisibility.group && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-700">
                                                {customer.group}
                                            </span>
                                        </td>
                                    )}

                                    {/* Address */}
                                    {columnVisibility.address && (
                                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate whitespace-nowrap">{customer.address || '-'}</td>
                                    )}

                                    {/* Mobile */}
                                    {columnVisibility.mobile && (
                                        <td className="px-6 py-4 font-medium whitespace-nowrap">{customer.mobile}</td>
                                    )}

                                    {/* Total Sale Due */}
                                    {columnVisibility.totalSaleDue && (
                                        <td className="px-6 py-4 text-right font-bold text-red-600 whitespace-nowrap">
                                            {formatCurrency(customer.totalSaleDue)}
                                        </td>
                                    )}

                                    {/* Total Sell Return Due */}
                                    {columnVisibility.totalSellReturnDue && (
                                        <td className="px-6 py-4 text-right font-medium whitespace-nowrap">
                                            {formatCurrency(customer.totalSellReturnDue)}
                                        </td>
                                    )}

                                    {/* Status */}
                                    {columnVisibility.status && (
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${customer.status === 'Active'
                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <CustomerActionModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                customer={modalConfig.customer}
                type={modalConfig.type}
            />
        </div>
    );
};

