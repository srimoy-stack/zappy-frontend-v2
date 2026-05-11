'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerStatsHeader, OrderHistoryTable } from '../components/Customers';
import { CustomerDetails, CustomerOrder } from '../types/customers';
import { mockCustomerDetails } from '../mock/customers';
import { ArrowLeft, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';

interface CustomerProfilePageProps {
    customerId: string;
}

export const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({ customerId }) => {
    const router = useRouter();
    const [customer, setCustomer] = useState<CustomerDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reorderStatus, setReorderStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
    const [reorderMessage, setReorderMessage] = useState('');

    useEffect(() => {
        const fetchCustomer = async () => {
            setIsLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 500));

                const customerData = mockCustomerDetails[customerId];
                if (customerData) {
                    setCustomer(customerData);
                } else {
                    // Customer not found
                    setCustomer(null);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomer();
    }, [customerId]);

    const handleReorder = async (order: CustomerOrder) => {
        console.log('Reordering:', order);

        setReorderStatus('validating');
        setReorderMessage('Validating menu prices and item availability...');

        // Simulate validation process
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Randomly simulate success or failure for demonstration
        const isSuccess = Math.random() > 0.3; // 70% success rate

        if (isSuccess) {
            setReorderStatus('success');
            setReorderMessage(`Order #${order.id} validated successfully! Items added to cart with current prices.`);

            // Reset after 5 seconds
            setTimeout(() => {
                setReorderStatus('idle');
                setReorderMessage('');
            }, 5000);
        } else {
            setReorderStatus('error');
            setReorderMessage('Some items are no longer available. Please review the menu and create a new order.');

            // Reset after 5 seconds
            setTimeout(() => {
                setReorderStatus('idle');
                setReorderMessage('');
            }, 5000);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                    <span className="text-sm text-slate-500 font-medium">Loading customer profile...</span>
                </div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900">Customer Not Found</h2>
                    <p className="text-slate-600">The customer you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.push('/backoffice/customers')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Customers
                    </button>
                </div>
            </div>
        );
    }

    const hasOrders = customer.orderHistory && customer.orderHistory.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/backoffice/customers')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Customer Hub
                </button>

                {/* Customer Stats Header */}
                <CustomerStatsHeader customer={customer} />

                {/* One-Click Reorder Banner */}
                {hasOrders && (
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-xl border border-blue-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        One-Click Reorder Enabled
                                    </h3>
                                    <p className="text-sm text-blue-100 mt-1">
                                        Quickly reorder the most recent order with automatic price and availability validation
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reorder Status Messages */}
                {reorderStatus !== 'idle' && (
                    <div className={`rounded-xl p-4 border ${reorderStatus === 'validating'
                        ? 'bg-blue-50 border-blue-200'
                        : reorderStatus === 'success'
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-red-50 border-red-200'
                        }`}>
                        <div className="flex items-center gap-3">
                            {reorderStatus === 'validating' && (
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            )}
                            {reorderStatus === 'success' && (
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            )}
                            {reorderStatus === 'error' && (
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            )}
                            <p className={`text-sm font-semibold ${reorderStatus === 'validating'
                                ? 'text-blue-900'
                                : reorderStatus === 'success'
                                    ? 'text-emerald-900'
                                    : 'text-red-900'
                                }`}>
                                {reorderMessage}
                            </p>
                        </div>
                    </div>
                )}

                {/* Order History Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                        <h2 className="text-2xl font-black text-slate-900">
                            Unified Order History
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            Cross-channel aggregation from all sales channels
                        </p>
                    </div>

                    <OrderHistoryTable
                        orders={customer.orderHistory || []}
                        onReorder={handleReorder}
                    />
                </div>
            </div>
        </div>
    );
};
