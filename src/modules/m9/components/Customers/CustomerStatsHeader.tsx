import React from 'react';
import { Customer } from '../../types/customers';
import { ShoppingBag, DollarSign, Star, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface CustomerStatsHeaderProps {
    customer: Customer;
}

export const CustomerStatsHeader: React.FC<CustomerStatsHeaderProps> = ({ customer }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-8">
                {/* Customer Identity */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-8">
                    {/* Left: Profile Info */}
                    <div className="flex items-start gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-600/30">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-3">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {customer.name}
                                </h1>
                                <p className="text-sm text-slate-500 font-medium mt-1">
                                    Contact ID: <span className="text-blue-600">{customer.contactId}</span>
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    {customer.mobile}
                                </div>
                                {customer.email && (
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        {customer.email}
                                    </div>
                                )}
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${customer.status === 'Active'
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}>
                                    {customer.status === 'Active' ? (
                                        <CheckCircle className="w-3.5 h-3.5" />
                                    ) : (
                                        <AlertCircle className="w-3.5 h-3.5" />
                                    )}
                                    {customer.status}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Orders */}
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                Total Orders
                            </span>
                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-3xl font-black text-blue-900">{customer.totalOrders || 0}</p>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                            Across all channels
                        </p>
                    </div>

                    {/* Total Spend */}
                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                Total Spend
                            </span>
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-3xl font-black text-emerald-900">
                            {formatCurrency(customer.totalSpend || 0)}
                        </p>
                        <p className="text-xs text-emerald-600 font-medium mt-1">
                            Lifetime value
                        </p>
                    </div>

                    {/* Loyalty */}
                    <div className={`p-6 rounded-xl border ${customer.loyaltyTier === 'GOLD'
                        ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200'
                        : customer.loyaltyTier === 'SILVER'
                            ? 'bg-gradient-to-br from-slate-100 to-slate-200/50 border-slate-300'
                            : 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-bold uppercase tracking-wider ${customer.loyaltyTier === 'GOLD'
                                ? 'text-amber-700'
                                : customer.loyaltyTier === 'SILVER'
                                    ? 'text-slate-700'
                                    : 'text-orange-700'
                                }`}>
                                Loyalty Tier
                            </span>
                            <Star className={`w-5 h-5 fill-current ${customer.loyaltyTier === 'GOLD'
                                ? 'text-amber-600'
                                : customer.loyaltyTier === 'SILVER'
                                    ? 'text-slate-600'
                                    : 'text-orange-600'
                                }`} />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className={`text-2xl font-black ${customer.loyaltyTier === 'GOLD'
                                ? 'text-amber-900'
                                : customer.loyaltyTier === 'SILVER'
                                    ? 'text-slate-900'
                                    : 'text-orange-900'
                                }`}>
                                {customer.loyaltyTier || 'BRONZE'}
                            </p>
                            <span className={`text-sm font-bold ${customer.loyaltyTier === 'GOLD'
                                ? 'text-amber-700'
                                : customer.loyaltyTier === 'SILVER'
                                    ? 'text-slate-700'
                                    : 'text-orange-700'
                                }`}>
                                {customer.loyaltyPoints || 0} pts
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

