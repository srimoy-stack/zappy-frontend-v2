'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ChevronRight,
    Zap,
    Clock,
    Ticket
} from 'lucide-react';

const MOCK_PROMOS = [
    { id: 'p1', title: 'Buy 1 Get 1 Free', desc: 'On all Large Margherita Pizzas', code: 'BOGO-MARG', type: 'BOGO', expires: 'Ends in 2 days', category: 'Pizza' },
    { id: 'p2', title: '10% Family Discount', desc: 'Orders over $50 get 10% off', code: 'FAM10', type: 'PERCENT', expires: 'Ongoing', category: 'All' },
    { id: 'p3', title: 'Free Garlic Bread', desc: 'When you buy any 2 Large Pizzas', code: 'GB-FREE', type: 'FREEBIE', expires: 'Today Only', category: 'Sides' },
    { id: 'p4', title: 'Weekend Feast Deal', desc: '2 Medium Pizzas + 1 Side + 1 Drink for $39', code: 'WEEKEND39', type: 'BUNDLE', expires: 'Ends Sunday', category: 'Combos' },
];

export default function PromotionsPage() {
    const router = useRouter();
    const [couponCode, setCouponCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const handleApplyCode = (e: React.FormEvent) => {
        e.preventDefault();
        setIsValidating(true);
        setTimeout(() => {
            setIsValidating(false);
            // In a real app, apply to context
            router.push('/callcenter/menu');
        }, 1000);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
            {/* Header */}
            <header style={{
                padding: '24px 40px',
                background: '#1e293b',
                borderBottom: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button
                        onClick={() => router.back()}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>Promotions & Coupons</h1>
                        <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Available deals for the current campaign</p>
                    </div>
                </div>
            </header>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Search & Code Entry */}
                <div style={{
                    width: '450px',
                    background: '#0f172a',
                    borderRight: '1px solid #334155',
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '40px'
                }}>
                    <div>
                        <h2 style={{ fontSize: '12px', fontWeight: 950, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Apply Voucher Code</h2>
                        <form onSubmit={handleApplyCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ position: 'relative' }}>
                                <Ticket color="#64748b" size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    placeholder="ENTER CODE..."
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    style={{
                                        width: '100%',
                                        height: '64px',
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '16px',
                                        paddingLeft: '60px',
                                        color: 'white',
                                        fontSize: '20px',
                                        fontWeight: 900,
                                        outline: 'none',
                                        letterSpacing: '0.1em'
                                    }}
                                />
                            </div>
                            <button
                                disabled={!couponCode || isValidating}
                                style={{
                                    height: '64px',
                                    background: couponCode ? '#3b82f6' : '#334155',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '18px',
                                    fontWeight: 900,
                                    cursor: couponCode ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isValidating ? 'VALIDATING...' : 'APPLY COUPON'}
                            </button>
                        </form>
                    </div>

                    <div style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
                        <div style={{ width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <Zap color="#3b82f6" size={24} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'white', marginBottom: '12px' }}>Smart Suggestions</h3>
                        <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                            Based on common orders, customers tend to enjoy the <strong>WEEKEND39</strong> bundle which offers the best value.
                        </p>
                    </div>
                </div>

                {/* Promo Grid */}
                <div style={{ flex: 1, padding: '40px', overflowY: 'auto', background: '#0f172a' }} className="pos-scroll">
                    <h2 style={{ fontSize: '13px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '32px' }}>Current Store Promotions</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                        {MOCK_PROMOS.map(promo => (
                            <div
                                key={promo.id}
                                style={{
                                    background: '#1e293b',
                                    padding: '32px',
                                    borderRadius: '28px',
                                    border: '1px solid #334155',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{
                                        padding: '6px 12px',
                                        background: '#3b82f6',
                                        color: 'white',
                                        fontSize: '11px',
                                        fontWeight: 900,
                                        borderRadius: '8px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {promo.type}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px', fontWeight: 700 }}>
                                        <Clock size={14} /> {promo.expires}
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'white', margin: '0 0 8px 0' }}>{promo.title}</h3>
                                    <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>{promo.desc}</p>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '8px',
                                    background: '#0f172a',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    border: '1px dashed #334155'
                                }}>
                                    <div style={{ fontSize: '16px', fontWeight: 950, color: '#3b82f6', letterSpacing: '0.05em' }}>{promo.code}</div>
                                    <button
                                        onClick={() => { setCouponCode(promo.code); }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'white',
                                            fontSize: '12px',
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        USE <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .pos-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .pos-scroll::-webkit-scrollbar-track { background: transparent; }
                .pos-scroll::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
