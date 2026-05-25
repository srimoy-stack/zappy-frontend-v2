'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    DashboardHeader,
    AlertsRecoveryCenter,
    KpiRow,
    LiveOperationsMonitor,
    AnalyticsSuite,
    StorePerformance,
    OrderFlowVisibility,
    QuickActionCenter
} from '../components/Dashboard';
import { 
    DashboardData, 
    RecentOrder, 
    OperationalAlert, 
    StoreInfo, 
    HeatmapPoint, 
    TopProduct, 
    ComboPerformance, 
    DashboardKpis 
} from '../types/dashboard';
import { useAuth } from '@/shared/contexts/AuthContext';
import { storeService } from '@/shared/api/services/store.service';

/**
 * HomePage Component (M9-T1 REBUILT)
 * Premium Restaurant Commerce Operations Dashboard & Cockpit
 */
export const HomePage: React.FC = () => {
    const { tenantId, user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isRushMode, setIsRushMode] = useState(false);
    
    // Core Dashboard States
    const [kpis, setKpis] = useState<DashboardKpis | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [stores, setStores] = useState<StoreInfo[]>([]);
    const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
    const [heatmap, setHeatmap] = useState<HeatmapPoint[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [combos, setCombos] = useState<ComboPerformance[]>([]);

    // ── INITIAL DATA SEEDING ──────────────────────────────────────────────
    const initializeData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Retrieve live store count from API
            let storeCount = 4;
            if (tenantId) {
                try {
                    const storesList = await storeService.list(tenantId);
                    if (storesList && storesList.length > 0) {
                        storeCount = storesList.length;
                    }
                } catch (e) {
                    console.error('Failed to fetch active store count', e);
                }
            }

            // Seed mock metrics
            const initialKpis: DashboardKpis = {
                grossSales: 12420.00,
                netSales: 11160.00,
                orders: 418,
                averageOrderValue: 26.70,
                refunds: 120.00,
                cancellations: 6,
                liveCustomers: 84,
                onlineRevenue: 3900.00,
                posRevenue: 6900.00,
                activeStores: storeCount,
                delayedOrders: 2,
                kitchenLoad: 58,
                deliverySuccessRate: 98.4
            };

            const initialStores: StoreInfo[] = [
                {
                    id: 'store-101',
                    name: 'Downtown Main Outlet',
                    revenue: 4850.00,
                    orders: 142,
                    activeStaff: 8,
                    prepTime: 11,
                    status: 'online',
                    inventoryAlerts: 1,
                    delayedOrders: 0,
                    healthScore: 99.4,
                    runtimeHealth: { latency: 15, posConnected: true, lastSync: 'Just now' }
                },
                {
                    id: 'store-102',
                    name: 'Westside Drive-Thru',
                    revenue: 3210.00,
                    orders: 98,
                    activeStaff: 6,
                    prepTime: 14,
                    status: 'degraded',
                    inventoryAlerts: 4,
                    delayedOrders: 2,
                    healthScore: 82.5,
                    runtimeHealth: { latency: 45, posConnected: true, lastSync: '3 min ago' }
                },
                {
                    id: 'store-103',
                    name: 'Metro Center Food Court',
                    revenue: 2420.00,
                    orders: 60,
                    activeStaff: 4,
                    prepTime: 18,
                    status: 'offline',
                    inventoryAlerts: 0,
                    delayedOrders: 3,
                    healthScore: 60.2,
                    runtimeHealth: { latency: 0, posConnected: false, lastSync: 'Disconnected' }
                },
                {
                    id: 'store-104',
                    name: 'Uptown Bistro',
                    revenue: 1940.00,
                    orders: 58,
                    activeStaff: 5,
                    prepTime: 9,
                    status: 'online',
                    inventoryAlerts: 0,
                    delayedOrders: 0,
                    healthScore: 98.8,
                    runtimeHealth: { latency: 18, posConnected: true, lastSync: 'Just now' }
                }
            ];

            const initialAlerts: OperationalAlert[] = [
                {
                    id: 'alert-1',
                    severity: 'critical',
                    message: 'POS Terminal Disconnected - Local SQL instance sync stopped',
                    storeName: 'Metro Center Food Court',
                    timestamp: '4 min ago',
                    type: 'pos_disconnect',
                    status: 'active'
                },
                {
                    id: 'alert-2',
                    severity: 'warning',
                    message: 'Stripe Gateway Latency High - UPI payload retries at 4.2%',
                    storeName: 'Global Checkout',
                    timestamp: '10 min ago',
                    type: 'payment_fail',
                    status: 'active'
                },
                {
                    id: 'alert-3',
                    severity: 'info',
                    message: 'UberEats catalog publish validation error - Missing modifier attachments',
                    storeName: 'Catalog sync',
                    timestamp: '15 min ago',
                    type: 'menu_publish_fail',
                    status: 'active'
                }
            ];

            const initialOrders: RecentOrder[] = [
                {
                    id: 'order-10492',
                    orderNumber: '#10492',
                    time: '7:45 PM',
                    customer: 'Sarah Warren',
                    channel: 'POS',
                    status: 'prep',
                    total: 34.20,
                    prepTimeRemaining: 12,
                    storeName: 'Downtown Main Outlet',
                    syncStatus: 'synced',
                    items: [
                        { name: 'Truffle Mushroom Burger', qty: 1, price: 18.50, modifiers: ['Extra Cheddar Melt', 'Double Patty'] },
                        { name: 'Loaded Cheese Fries', qty: 2, price: 7.85 }
                    ]
                },
                {
                    id: 'order-10491',
                    orderNumber: '#10491',
                    time: '7:42 PM',
                    customer: 'Mike Jenkins',
                    channel: 'Online',
                    status: 'prep',
                    total: 48.90,
                    prepTimeRemaining: 8,
                    storeName: 'Westside Drive-Thru',
                    syncStatus: 'synced',
                    items: [
                        { name: 'Gourmet Double Combo', qty: 2, price: 24.45 }
                    ]
                },
                {
                    id: 'order-10490',
                    orderNumber: '#10490',
                    time: '7:38 PM',
                    customer: 'Esther Howard',
                    channel: 'Zomato',
                    status: 'ready',
                    total: 12.00,
                    prepTimeRemaining: 0,
                    storeName: 'Uptown Bistro',
                    syncStatus: 'synced',
                    items: [
                        { name: 'Spicy Szechuan Wings', qty: 1, price: 12.00 }
                    ]
                },
                {
                    id: 'order-10489',
                    orderNumber: '#10489',
                    time: '7:35 PM',
                    customer: 'Anonymous POS',
                    channel: 'POS',
                    status: 'cancelled',
                    total: 54.20,
                    storeName: 'Downtown Main Outlet',
                    syncStatus: 'synced',
                    items: [
                        { name: 'Loaded Cheese Fries', qty: 3, price: 7.85 },
                        { name: 'Truffle Mushroom Burger', qty: 1, price: 18.50 }
                    ]
                },
                {
                    id: 'order-10488',
                    orderNumber: '#10488',
                    time: '7:30 PM',
                    customer: 'Delivery Agent #405',
                    channel: 'Swiggy',
                    status: 'prep',
                    total: 72.10,
                    prepTimeRemaining: 2,
                    storeName: 'Metro Center Food Court',
                    syncStatus: 'failed',
                    failReason: 'SQlite POS connection timed out',
                    items: [
                        { name: 'Truffle Mushroom Burger', qty: 3, price: 18.50, modifiers: ['Caramelized Onion'] },
                        { name: 'Spicy Szechuan Wings', qty: 1, price: 12.00 }
                    ]
                }
            ];

            const initialTopProducts: TopProduct[] = [
                {
                    name: 'Truffle Mushroom Burger',
                    salesCount: 420,
                    revenue: 7770.00,
                    modifierAttachment: [
                        { name: 'Cheddar Melt Upgrade', attachmentRate: 88 },
                        { name: 'Caramelized Onion', attachmentRate: 68 },
                        { name: 'Extra Patty Upgrade', attachmentRate: 42 }
                    ]
                },
                {
                    name: 'Loaded Cheese Fries',
                    salesCount: 310,
                    revenue: 2433.50,
                    modifierAttachment: [
                        { name: 'Spicy Dip Upgrade', attachmentRate: 52 }
                    ]
                },
                {
                    name: 'Spicy Szechuan Wings',
                    salesCount: 180,
                    revenue: 2160.00,
                    modifierAttachment: []
                }
            ];

            const initialCombos: ComboPerformance[] = [
                { comboName: 'Gourmet Double Combo', attachmentRate: 48, ordersCount: 210, revenue: 5134.50 },
                { comboName: 'Quick Lunch Box Special', attachmentRate: 36, ordersCount: 142, revenue: 2548.00 },
                { comboName: 'Family Feaster Feast', attachmentRate: 22, ordersCount: 98, revenue: 6410.00 }
            ];

            // Generating heatmap points
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const hours = ['11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'];
            const generatedHeatmap: HeatmapPoint[] = [];
            
            days.forEach(day => {
                hours.forEach(hour => {
                    // Make peak hours intense
                    const isPeakHour = ['12PM', '1PM', '8PM', '9PM'].includes(hour);
                    const isWeekend = ['Fri', 'Sat', 'Sun'].includes(day);
                    let intensity = Math.floor(Math.random() * 5);
                    if (isPeakHour) intensity += 4;
                    if (isWeekend) intensity += 2;
                    generatedHeatmap.push({
                        hour,
                        day,
                        salesVolume: Math.min(10, intensity)
                    });
                });
            });

            // Seed local states
            setKpis(initialKpis);
            setStores(initialStores);
            setAlerts(initialAlerts);
            setRecentOrders(initialOrders);
            setTopProducts(initialTopProducts);
            setCombos(initialCombos);
            setHeatmap(generatedHeatmap);

            await new Promise((resolve) => setTimeout(resolve, 650));
        } catch (e) {
            console.error('Failed to seed operations data', e);
        } finally {
            setIsLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        initializeData();
    }, [initializeData]);

    // ── SIMULATION ENGINE (Real-time Operations ticks) ───────────────────────
    useEffect(() => {
        if (isLoading) return;

        const interval = setInterval(() => {
            // 1. Tick prep timers down
            setRecentOrders(prev => 
                prev.map(order => {
                    if (order.status === 'prep' && order.prepTimeRemaining !== undefined) {
                        const newTime = Math.max(0, order.prepTimeRemaining - 1);
                        return {
                            ...order,
                            prepTimeRemaining: newTime,
                            status: newTime === 0 ? 'ready' : 'prep'
                        };
                    }
                    return order;
                })
            );

            // 2. Fluctuates POS Latencies on live stores
            setStores(prev => 
                prev.map(store => {
                    if (store.status === 'online') {
                        const baseLatency = store.id === 'store-101' ? 15 : 18;
                        const jitter = Math.floor(Math.random() * 8) - 4;
                        return {
                            ...store,
                            runtimeHealth: {
                                ...store.runtimeHealth,
                                latency: Math.max(8, baseLatency + jitter)
                            }
                        };
                    }
                    return store;
                })
            );

            // 3. Fluctuates live metric sessions slightly
            setKpis(prev => {
                if (!prev) return null;
                const sessionsJitter = Math.floor(Math.random() * 4) - 2;
                return {
                    ...prev,
                    liveCustomers: Math.max(40, prev.liveCustomers + sessionsJitter)
                };
            });

            // 4. Random incoming simulated order every few intervals
            const triggerNewOrder = Math.random() > 0.65;
            if (triggerNewOrder) {
                const channels = ['POS', 'Online', 'Uber', 'Zomato', 'Swiggy'] as const;
                const names = ['David Beckham', 'Gordon Ramsay', 'Selena G.', 'Will Smith', 'Taylor S.'];
                const selectedChannel = channels[Math.floor(Math.random() * channels.length)];
                const randomId = Math.floor(Math.random() * 900) + 10500;
                
                const newOrder: RecentOrder = {
                    id: `order-${randomId}`,
                    orderNumber: `#${randomId}`,
                    time: 'Just now',
                    customer: names[Math.floor(Math.random() * names.length)],
                    channel: selectedChannel,
                    status: 'prep',
                    total: parseFloat((Math.random() * 45 + 10).toFixed(2)),
                    prepTimeRemaining: Math.floor(Math.random() * 10) + 6,
                    storeName: 'Downtown Main Outlet',
                    syncStatus: 'synced',
                    items: [
                        { name: 'Truffle Mushroom Burger', qty: 1, price: 18.50 },
                        { name: 'Loaded Cheese Fries', qty: 1, price: 7.85 }
                    ]
                };

                setRecentOrders(prev => [newOrder, ...prev.slice(0, 9)]);

                // Upgrade KPIs accordingly
                setKpis(prev => {
                    if (!prev) return null;
                    const isOnline = ['Online', 'Uber', 'Zomato', 'Swiggy'].includes(selectedChannel);
                    return {
                        ...prev,
                        grossSales: prev.grossSales + newOrder.total,
                        netSales: prev.netSales + (newOrder.total * 0.9),
                        orders: prev.orders + 1,
                        onlineRevenue: isOnline ? prev.onlineRevenue + newOrder.total : prev.onlineRevenue,
                        posRevenue: !isOnline ? prev.posRevenue + newOrder.total : prev.posRevenue,
                        kitchenLoad: Math.min(95, prev.kitchenLoad + 2)
                    };
                });
            }
        }, 8000);

        return () => clearInterval(interval);
    }, [isLoading]);

    // Rush mode trigger
    useEffect(() => {
        if (!isRushMode) return;

        // Peak rush increases kitchen loads, triggers store warning, and alerts
        setKpis(prev => prev ? { ...prev, kitchenLoad: 92, delayedOrders: prev.delayedOrders + 3 } : null);
        setStores(prev => 
            prev.map(s => s.id === 'store-102' ? { ...s, prepTime: 24, delayedOrders: 5, status: 'degraded' } : s)
        );
        
        const rushAlert: OperationalAlert = {
            id: 'alert-rush',
            severity: 'critical',
            message: 'Kitchen Utilization Peak Capacity - Prep stations saturated. Latency warnings active.',
            storeName: 'Westside Drive-Thru',
            timestamp: 'Just now',
            type: 'delay',
            status: 'active'
        };

        setAlerts(prev => [rushAlert, ...prev.filter(a => a.id !== 'alert-rush')]);

    }, [isRushMode]);

    // ── ADMINISTRATIVE OPERATIONS HANDLERS ────────────────────────────────
    const handleRetrySync = (alertId: string) => {
        // Marks active sync alert as resolved, restoring connection mock state
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
        
        if (alertId === 'alert-1') {
            setStores(prev => 
                prev.map(s => s.id === 'store-103' ? { 
                    ...s, 
                    status: 'online', 
                    runtimeHealth: { latency: 19, posConnected: true, lastSync: 'Just now' }
                } : s)
            );
            setKpis(prev => prev ? { ...prev, activeStores: prev.activeStores + 1 } : null);
        }
    };

    const handleResolveAlert = (alertId: string) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
    };

    const handleAcknowledgeAlert = (alertId: string) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
    };

    const handlePingPOS = (storeId: string) => {
        // Mock connection response ping
        setStores(prev => 
            prev.map(s => s.id === storeId ? { 
                ...s, 
                runtimeHealth: { ...s.runtimeHealth, lastSync: 'Verified now' } 
            } : s)
        );
        alert(`POS terminal at ${stores.find(s => s.id === storeId)?.name} responsive. Ping complete.`);
    };

    const handleMuteAlerts = (storeId: string) => {
        alert(`Alert triggers muted for outlet: ${stores.find(s => s.id === storeId)?.name}`);
    };

    const handleRestartNode = (storeId: string) => {
        setIsLoading(true);
        setTimeout(() => {
            setStores(prev => 
                prev.map(s => s.id === storeId ? { 
                    ...s, 
                    status: 'online',
                    healthScore: 98.4,
                    runtimeHealth: { latency: 14, posConnected: true, lastSync: 'Rebooted' } 
                } : s)
            );
            setIsLoading(false);
            alert(`Uvicorn/FastAPI runtime node successfully restarted for store ${storeId}.`);
        }, 1200);
    };

    const handleRetryOrderPayload = (orderId: string) => {
        setRecentOrders(prev => 
            prev.map(o => o.id === orderId ? { ...o, syncStatus: 'synced', failReason: undefined } : o)
        );
        // Decrease cancellations/failures
        setKpis(prev => prev ? { ...prev, delayedOrders: Math.max(0, prev.delayedOrders - 1) } : null);
        alert(`Order payload ${orderId} successfully flushed into outlet POS database SQLite terminal.`);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col gap-8 pb-16">
            {/* 1. Header (Operations-grade HUD) */}
            <DashboardHeader
                brandName={user?.tenantName || 'Zyappy Gourmet'}
                userName={user?.name || 'Operations Executive'}
                storeCount={kpis?.activeStores || 4}
                isLoading={isLoading}
                onRefresh={() => initializeData()}
                onPublishMenu={() => alert('Menus successfully catalog-mapped and published to Zomato, Swiggy, & UberEats.')}
                onForceSync={() => {
                    alert('Triggered global POS SQLite synchronization protocols.');
                    initializeData();
                }}
                onToggleRushMode={(active) => setIsRushMode(active)}
                isRushMode={isRushMode}
            />

            {/* 2. Alerts & Recovery Center (Realtime Warning Ticker) */}
            <AlertsRecoveryCenter
                alerts={alerts}
                onRetry={handleRetrySync}
                onResolve={handleResolveAlert}
                onAcknowledge={handleAcknowledgeAlert}
            />

            {/* 3. KPI Grid (Aggregated Metrics row) */}
            <KpiRow
                data={kpis}
                isLoading={isLoading}
            />

            {/* 4. Live Kitchen Operations Cockpit */}
            <LiveOperationsMonitor
                orders={recentOrders}
                kitchenLoad={kpis?.kitchenLoad || 58}
                isLoading={isLoading}
            />

            {/* 5. Business Intelligence Analytics Suite */}
            <AnalyticsSuite
                channels={[
                    { channel: 'POS Terminals', orders: 220, sales: kpis?.posRevenue || 6900, percentage: 56.0 },
                    { channel: 'Online Web ordering', orders: 160, sales: kpis?.onlineRevenue || 3900, percentage: 31.0 },
                    { channel: 'UberEats Aggregator', orders: 38, sales: 1620.00, percentage: 13.0 },
                ]}
                heatmap={heatmap}
                topProducts={topProducts}
                combos={combos}
                isLoading={isLoading}
            />

            {/* 6. Active Stores Outlet Grid */}
            <StorePerformance
                stores={stores}
                onPingPOS={handlePingPOS}
                onMuteAlerts={handleMuteAlerts}
                onRestartNode={handleRestartNode}
                isLoading={isLoading}
            />

            {/* 7. Realtime Transaction & Order Flow stream */}
            <OrderFlowVisibility
                orders={recentOrders}
                onRetryOrderSync={handleRetryOrderPayload}
                isLoading={isLoading}
            />

            {/* 8. Administrative Quick Action Panel */}
            <QuickActionCenter
                onCreateProduct={() => alert('Add Item Catalog modal launched.')}
                onAddStore={() => alert('Onboard Physical Outlet workflow launched.')}
                onPublishMenu={() => alert('Universal menu catalog successfully compiled.')}
                onConfigureIntegrations={() => alert('Redirecting to Integration Gateway Settings...')}
                onAddStaff={() => alert('Staff role manager dashboard loaded.')}
                onCreateOffer={() => alert('Coupon campaign generator loaded.')}
                onManageSettings={() => alert('Brand workspace settings configured.')}
                onRetrySync={() => {
                    initializeData();
                    alert('Re-fetched live SQLite connections.');
                }}
            />
        </div>
    );
};
