'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from '@/modules/pos/context/POSContext';
import { useRouter } from 'next/navigation';
import {
    ShoppingBag,
    Bike,
    Utensils,
    User,
    MapPin,
    ChevronRight,
    Search,
    Plus,
    Phone
} from 'lucide-react';
import { OrderChannel } from '../types/pos';

export const OrderInitiationPage: React.FC = () => {
    const { session, setChannel, setCustomer } = usePOS();
    const router = useRouter();

    const [selectedType, setSelectedType] = useState<OrderChannel>(session?.channel || 'Pickup');
    const [deliveryAddress, setDeliveryAddress] = useState<string | null>(null);

    // Sync local state with session if changed externally
    useEffect(() => {
        if (session?.channel) {
            setSelectedType(session.channel);
        }
    }, [session?.channel]);

    const handleTypeSelect = (type: OrderChannel) => {
        setSelectedType(type);
        setChannel(type); // Update global context

        if (type === 'Dine-In') {
            router.push('/pos/tables');
        }
    };

    const handleContinue = () => {
        // Validation logic
        if (selectedType === 'Delivery' && !session?.activeCustomer) {
            // Ideally show error or highlight customer section
            return;
        }

        if (selectedType === 'Delivery' && session?.activeCustomer && !deliveryAddress) {
            // Show error for address
            return;
        }

        // Proceed to Menu (Section 5 - Placeholder for now)
        // For now, we'll just go back to Dashboard or a new Menu placeholder
        router.push('/pos/menu');
    };

    const FullfillmentCard = ({ type, icon: Icon, label, desc }: { type: OrderChannel, icon: any, label: string, desc: string }) => (
        <button
            onClick={() => handleTypeSelect(type)}
            className={`flex-1 p-6 rounded-3xl border-2 text-left transition-all group relative overflow-hidden ${selectedType === type
                ? 'bg-brand border-brand shadow-xl shadow-brand/20'
                : 'bg-white border-brand/10 hover:border-brand hover:bg-brand/5'
                }`}
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${selectedType === type ? 'bg-white/20 text-white' : 'bg-brand/5 text-brand/40 group-hover:text-brand'
                }`}>
                <Icon size={28} />
            </div>
            <h3 className={`text-xl font-black tracking-tight mb-2 ${selectedType === type ? 'text-white' : 'text-brand'}`}>
                {label}
            </h3>
            <p className={`text-sm font-medium leading-relaxed ${selectedType === type ? 'text-white/80' : 'text-brand/60'}`}>
                {desc}
            </p>

            {/* Active Indicator */}
            {selectedType === type && (
                <div className="absolute top-6 right-6 w-4 h-4 bg-white rounded-full shadow-lg animate-pulse"></div>
            )}
        </button>
    );

    return (
        <div className="flex h-screen bg-white text-brand font-sans overflow-hidden">
            <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-5xl mx-auto w-full">

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-brand tracking-tight mb-4">Start New Order</h1>
                    <p className="text-brand/40 text-lg">Select fulfillment method to proceed</p>
                </div>

                <div className="flex gap-6 w-full mb-12 h-64">
                    <FullfillmentCard
                        type="Pickup"
                        icon={ShoppingBag}
                        label="Takeaway / Pickup"
                        desc="Customer collects order at the counter."
                    />
                    <FullfillmentCard
                        type="Delivery"
                        icon={Bike}
                        label="Home Delivery"
                        desc="Dispatch order via rider network."
                    />
                    <FullfillmentCard
                        type="Dine-In"
                        icon={Utensils}
                        label="Dine-In"
                        desc="Serve at a table."
                    />
                </div>

                {/* DELIVERY & CUSTOMER DETAILS SECTION */}
                <div className={`w-full bg-white rounded-[2.5rem] border border-brand/10 p-8 transition-all duration-500 shadow-xl shadow-brand/5 ${selectedType === 'Delivery' ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4 grayscale'}`}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            {session?.posType === 'CALL_CENTER' && (
                                <div className="px-4 py-2 bg-brand/10 border border-brand/20 text-brand rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <Phone size={14} /> Call Center Mode
                                </div>
                            )}
                            <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-brand">Customer Details</h3>
                                <p className="text-brand/40 text-sm font-medium">Required for delivery orders</p>
                            </div>
                        </div>

                        {!session?.activeCustomer ? (
                            <button
                                onClick={() => router.push('/pos/customer-search')}
                                className="px-6 py-3 bg-white text-brand text-sm font-black uppercase tracking-widest rounded-xl hover:bg-brand/5 transition-all flex items-center gap-2 border border-brand/10 shadow-lg shadow-brand/5"
                            >
                                <Search size={16} /> Find Customer
                            </button>
                        ) : (
                            <div className="flex items-center gap-4 bg-brand/5 px-6 py-3 rounded-xl border border-brand/10">
                                <div>
                                    <div className="text-brand font-bold">{session.activeCustomer.name}</div>
                                    <div className="text-brand/40 text-xs font-black uppercase tracking-widest">{session.activeCustomer.phone}</div>
                                </div>
                                <button
                                    onClick={() => setCustomer(null)}
                                    className="p-2 bg-white rounded-lg text-brand/40 hover:text-brand transition-all border border-brand/10"
                                >
                                    <Search size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ADDRESS SELECTOR (Only if customer selected) */}
                    {session?.activeCustomer && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            {session.activeCustomer.addresses.map(addr => (
                                <button
                                    key={addr.id}
                                    onClick={() => setDeliveryAddress(addr.id)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${deliveryAddress === addr.id
                                        ? 'bg-brand border-brand text-white shadow-lg shadow-brand/10'
                                        : 'bg-white border-brand/10 hover:border-brand hover:bg-brand/5 text-brand/40'
                                        }`}
                                >
                                    <MapPin size={20} className={deliveryAddress === addr.id ? 'text-white' : 'text-brand/20'} />
                                    <div>
                                        <div className={`text-xs font-black uppercase tracking-widest mb-1 ${deliveryAddress === addr.id ? 'text-white/80' : 'text-brand/20'}`}>{addr.label}</div>
                                        <div className={`font-bold leading-tight ${deliveryAddress === addr.id ? 'text-white' : 'text-brand'}`}>{addr.text}</div>
                                    </div>
                                    {deliveryAddress === addr.id && <div className="ml-auto w-3 h-3 bg-white rounded-full"></div>}
                                </button>
                            ))}
                            {/* Add Address Placeholder */}
                            <button className="p-4 rounded-xl border-2 border-dashed border-brand/20 text-brand/40 font-bold hover:text-brand hover:border-brand hover:bg-brand/5 transition-all flex items-center justify-center gap-2">
                                <Plus size={20} /> Add New Address
                            </button>
                        </div>
                    )}
                </div>

                {/* FOOTER ACTIONS */}
                <div className="mt-12 flex justify-between w-full">
                    <button
                        onClick={() => router.back()}
                        className="px-8 py-4 bg-transparent text-brand/40 font-bold hover:text-brand transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleContinue}
                        disabled={selectedType === 'Delivery' && (!session?.activeCustomer || !deliveryAddress)}
                        className="px-12 py-4 bg-brand text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-brand/20 hover:bg-brand-dark active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-3"
                    >
                        Proceed to Menu <ChevronRight size={20} />
                    </button>
                </div>

            </main>
        </div>
    );
};

// Simple Plus icon helper since we didn't import it in lucide import list above
