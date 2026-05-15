import React from 'react';
import { X, DollarSign, Edit, FileText, CheckCircle } from 'lucide-react';
import { Customer } from '../../types/customers';

interface CustomerActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    type: 'pay' | 'edit' | 'documents' | null;
}

export const CustomerActionModal: React.FC<CustomerActionModalProps> = ({
    isOpen,
    onClose,
    customer,
    type
}) => {
    if (!isOpen || !customer) return null;

    const titles = {
        pay: 'Process Payment',
        edit: 'Edit Customer Details',
        documents: 'Documents & Notes'
    };

    const icons = {
        pay: <DollarSign className="w-5 h-5 text-emerald-600" />,
        edit: <Edit className="w-5 h-5 text-blue-600" />,
        documents: <FileText className="w-5 h-5 text-purple-600" />
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg">
                            {type && icons[type]}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{type && titles[type]}</h3>
                            <p className="text-xs text-slate-500 font-medium">Customer: <span className="text-blue-600">{customer.name}</span> ({customer.contactId})</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {type === 'pay' && (
                        <div className="space-y-4">
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Total Sale Due</p>
                                <p className="text-2xl font-black text-emerald-900">${customer.totalSaleDue.toLocaleString()}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase">Payment Amount</label>
                                <input
                                    type="number"
                                    defaultValue={customer.totalSaleDue}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-900"
                                />
                            </div>
                        </div>
                    )}

                    {type === 'edit' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Business Name</label>
                                <input type="text" defaultValue={customer.businessName || ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Contact Name</label>
                                <input type="text" defaultValue={customer.name} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                                <input type="email" defaultValue={customer.email || ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Mobile Number</label>
                                <input type="tel" defaultValue={customer.mobile} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Tax Number</label>
                                <input type="text" defaultValue={customer.taxNumber || ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Customer Group</label>
                                <input type="text" defaultValue={customer.group || ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Credit Limit</label>
                                <input type="text" defaultValue={customer.creditLimit} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Pay Term</label>
                                <input type="text" defaultValue={customer.payTerm} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5 col-span-1 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Address</label>
                                <textarea defaultValue={customer.address} rows={2} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Status</label>
                                <select defaultValue={customer.status} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {type === 'documents' && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50">
                                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm font-bold text-slate-600">Drag & Drop Documents</p>
                                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Notes</h4>
                                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                    <p className="text-sm text-slate-700">Inquired about bulk order discount for next month.</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-bold">JAN 12, 2024</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            alert('Changes saved successfully!');
                            onClose();
                        }}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-black text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-lg active:scale-95"
                    >
                        <CheckCircle className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
