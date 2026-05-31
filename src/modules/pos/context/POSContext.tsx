'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { POSType, OrderChannel, POSSession, POSContextType, POSStore, POSTable, POSCartItem, POSUser } from '../types/pos';
import { POSCustomer, mockPOSUsers, mockStores, VALID_STORE_PINS, VALID_CALL_CENTER_USERS, mockPOSTables, mockPOSCustomers } from '../mock/posData';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { env } from '@/shared/config/env';
import { setAccessToken, setRefreshToken } from '@/shared/utils/tokenManager';
import { openPOSShift } from '@/modules/pos/services/posShiftService';

const POSContext = createContext<POSContextType | undefined>(undefined);

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;

const getString = (value: unknown) => typeof value === 'string' && value.trim() ? value : undefined;

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<POSSession | null>(null);
    const [tables, setTables] = useState<POSTable[]>(mockPOSTables as POSTable[]);
    const [cart, setCart] = useState<POSCartItem[]>([]);
    const [customers, setCustomers] = useState<POSCustomer[]>([]);
    const [isOffline, setIsOffline] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [deviceId, setDeviceId] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateSession = useCallback((updates: Partial<POSSession> | null) => {
        console.log('💾 updateSession called with updates:', updates);
        setSession(prev => {
            if (updates === null) {
                localStorage.removeItem('pos_session');
                return null;
            }
            const updated = prev ? { ...prev, ...updates } : (updates as POSSession);
            localStorage.setItem('pos_session', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const replaceSession = useCallback((nextSession: POSSession) => {
        console.log('💾 replaceSession called with session:', nextSession);
        localStorage.setItem('pos_session', JSON.stringify(nextSession));
        setSession(nextSession);
    }, []);

    // Platform Auto-Login Bridge
    useEffect(() => {
        const platformStoreId = searchParams?.get('storeId');
        if (platformStoreId && !session) {
            console.log('🚀 Platform Auto-Login Init for Store:', platformStoreId);

            // Map platform ID or just pick first store
            const store = mockStores.find(s => s.id === 'S001') || mockStores[0]!;
            const user = mockPOSUsers[0]!; // Default to first mock manager

            const autoSession: POSSession = {
                user,
                posType: 'STORE',
                store,
                deviceId: 'PLATFORM-BRIDGE',
                isOffline: false,
                channel: 'Pickup'
            };

            updateSession(autoSession);
        }
    }, [searchParams, session, updateSession]);
    useEffect(() => {
        const updateStatus = () => setIsOffline(!navigator.onLine);
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        updateStatus();
        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
        };
    }, []);

    // Get or generate Device ID and persist session to localStorage
    useEffect(() => {
        let savedDeviceId = localStorage.getItem('pos_device_id');
        if (!savedDeviceId) {
            savedDeviceId = `POS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            localStorage.setItem('pos_device_id', savedDeviceId);
        }
        setDeviceId(savedDeviceId);

        const savedSession = localStorage.getItem('pos_session');
        const savedTables = localStorage.getItem('pos_tables');
        const savedCart = localStorage.getItem('pos_cart');

        if (savedSession) {
            try {
                setSession(JSON.parse(savedSession));
            } catch (e) {
                console.error('Failed to parse POS session', e);
            }
        }

        if (savedTables) {
            try {
                const parsed = JSON.parse(savedTables);
                if (parsed.length > 0) {
                    setTables(parsed);
                } else {
                    setTables(mockPOSTables as POSTable[]);
                    localStorage.setItem('pos_tables', JSON.stringify(mockPOSTables));
                }
            } catch (e) {
                console.error('Failed to parse POS tables', e);
                setTables(mockPOSTables as POSTable[]);
                localStorage.setItem('pos_tables', JSON.stringify(mockPOSTables));
            }
        } else {
            setTables(mockPOSTables as POSTable[]);
            localStorage.setItem('pos_tables', JSON.stringify(mockPOSTables));
        }

        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse POS cart', e);
            }
        }

        const savedCustomers = localStorage.getItem('pos_customers');
        if (savedCustomers) {
            try {
                setCustomers(JSON.parse(savedCustomers));
            } catch (e) {
                console.error('Failed to parse POS customers', e);
                setCustomers(mockPOSCustomers);
            }
        } else {
            setCustomers(mockPOSCustomers);
            localStorage.setItem('pos_customers', JSON.stringify(mockPOSCustomers));
        }
    }, []);



    const updateTables = useCallback((newTables: POSTable[]) => {
        setTables(newTables);
        localStorage.setItem('pos_tables', JSON.stringify(newTables));
    }, []);

    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem('pos_cart', JSON.stringify(cart));
        } else {
            localStorage.removeItem('pos_cart');
        }
    }, [cart]);

    const login = async (type: POSType, credentials: { pin?: string; email?: string; password?: string; deviceId: string; cashierId?: string; cashierName?: string; cashierEmail?: string; storeId?: string }) => {
        // Offline logic
        if (!navigator.onLine) {
            const savedSessionStr = localStorage.getItem('pos_session');
            if (savedSessionStr) {
                const savedSession = JSON.parse(savedSessionStr);
                // Check if it's the same device and type
                if (type === 'STORE' && credentials.pin) {
                    const userId = VALID_STORE_PINS[credentials.pin];
                    if (userId === savedSession.user.id) {
                        setSession({ ...savedSession, isOffline: true });
                        return;
                    }
                }
            }
            throw new Error('Offline: No previous session found on this device');
        }

        let user: POSUser;
        let accessibleStores: POSStore[] = [];

        const shouldUseBackendStoreLogin = type === 'STORE' && !!credentials.cashierName;

        if (env.apiMode === 'live' || shouldUseBackendStoreLogin) {
            const loginEmail = type === 'CALL_CENTER' ? credentials.email : undefined;
            const loginPassword = type === 'STORE' ? credentials.pin : credentials.password;

            if (type === 'STORE' && (!credentials.cashierName || !credentials.pin)) {
                throw new Error('Select cashier and enter PIN');
            }

            if (type === 'CALL_CENTER' && (!loginEmail || !loginPassword)) {
                throw new Error(type === 'STORE' ? 'Select cashier and enter PIN' : 'Credentials are required');
            }

            try {
                console.log('--- START POS LOGIN ---', { type, credentials, apiBaseUrl: env.apiBaseUrl });
                // 1. Authenticate cashier
                const loginPayload = type === 'STORE'
                    ? {
                        cashier_name: credentials.cashierName,
                        pin: credentials.pin
                    }
                    : {
                        email: loginEmail,
                        password: loginPassword
                    };
                const loginRes = await axios.post(`${env.apiBaseUrl}/pos/cashier_login`, loginPayload);
                console.log('loginRes response:', loginRes.status, loginRes.data);

                const loginData = asRecord(loginRes.data) || {};
                const loginStore = asRecord(loginData.store);
                const loginStoreId = getString(loginStore?.id) || getString(loginStore?.store_id) || getString(loginStore?.storeId);
                const loginStoreName = getString(loginStore?.name) || getString(loginStore?.store_name) || getString(loginStore?.storeName);
                const loginStoreAddress = getString(loginStore?.address) || getString(loginStore?.store_address) || getString(loginStore?.storeAddress) || getString(loginStore?.slug);

                const access_token = getString(loginData.access_token);
                const refresh_token = getString(loginData.refresh_token);
                if (!access_token) {
                    throw new Error('Auth token not received from server');
                }

                // 2. Set tokens
                setAccessToken(access_token);
                setRefreshToken(refresh_token || null);

                // 3. Fetch user profile
                const meRes = await axios.get(`${env.apiBaseUrl}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${access_token}` }
                });
                console.log('meRes response:', meRes.status, meRes.data);

                const meData = meRes.data;
                user = {
                    id: String(meData.id),
                    name: meData.full_name || 'Cashier',
                    role: meData.role || 'POS_cashier',
                    accessibleStores: (loginStoreId || meData.store_id || credentials.storeId) ? [loginStoreId || meData.store_id || credentials.storeId] : []
                };

                // Create POS store object
                const resolvedStoreId = loginStoreId || meData.store_id || credentials.storeId;
                if (resolvedStoreId) {
                    accessibleStores = [{
                        id: resolvedStoreId,
                        name: loginStoreName || meData.store_name || meData.brand_name || 'Assigned Store',
                        address: loginStoreAddress || meData.store_slug || 'Store Address'
                    }];
                } else {
                    accessibleStores = mockStores; // Fallback
                }

            } catch (err: any) {
                console.error('POS cashier login integration failed:', err);
                if (err.response) {
                    console.error('Response error data:', err.response.status, err.response.data);
                }
                const errorMsg = err.response?.data?.message || err.response?.data?.frontend_error?.message || err.message || 'Login failed';
                throw new Error(errorMsg);
            }
        } else {
            // Online authentication (mock mode)
            let userId: string | undefined;

            if (type === 'STORE') {
                if (!credentials.pin) throw new Error('PIN is required');
                userId = VALID_STORE_PINS[credentials.pin];
            } else {
                if (!credentials.email || !credentials.password) throw new Error('Email and Password are required');
                const userAuth = VALID_CALL_CENTER_USERS[credentials.email];
                if (userAuth && userAuth.password === credentials.password) {
                    userId = userAuth.userId;
                }
            }

            if (!userId) {
                throw new Error('Invalid credentials');
            }

            const mockUser = mockPOSUsers.find(u => u.id === userId);
            if (!mockUser) throw new Error('User not found');
            user = mockUser;
            accessibleStores = mockStores.filter(s => user.accessibleStores.includes(s.id));
        }

        if (accessibleStores.length === 0) throw new Error('User has no assigned stores');

        const initialSession: POSSession = {
            user,
            posType: type,
            store: accessibleStores[0]!,
            deviceId: credentials.deviceId,
            isOffline: false,
            shift: undefined
        };

        setIsSyncing(true);
        setTimeout(() => {
            replaceSession(initialSession);
            setIsSyncing(false);
        }, 1500);

        // Return sync info for the caller to handle immediate redirection
        return {
            requiresStoreSelection: accessibleStores.length > 1 || accessibleStores.length === 0,
            hasSingleStore: accessibleStores.length === 1
        };
    };

    const setStore = (store: POSStore) => {
        updateSession({ store });
    };

    const setChannel = (channel: OrderChannel) => {
        const updates: Partial<POSSession> = { channel };
        if (channel !== 'Dine-In') {
            updates.activeTable = undefined;
        }
        updateSession(updates);
    };

    const setTable = (table: POSTable | null) => {
        updateSession({ activeTable: table || undefined });

        if (table) {
            const updatedTables = tables.map(t =>
                t.id === table.id ? { ...t, status: 'OCCUPIED' as const, orderId: t.orderId || `ORD-${Math.floor(Math.random() * 9000) + 1000}` } : t
            );
            updateTables(updatedTables);
        }
    };

    const moveTable = (sourceTableId: string, targetTableId: string) => {
        if (!session) return;

        const sourceTable = tables.find(t => t.id === sourceTableId);
        if (!sourceTable) return;

        const updatedTables = tables.map(t => {
            if (t.id === sourceTableId) {
                return { ...t, status: 'FREE' as const, orderId: undefined };
            }
            if (t.id === targetTableId) {
                return { ...t, status: 'OCCUPIED' as const, orderId: sourceTable.orderId };
            }
            return t;
        });

        updateTables(updatedTables);

        if (session.activeTable?.id === sourceTableId) {
            const targetTable = updatedTables.find(t => t.id === targetTableId);
            updateSession({ ...session, activeTable: targetTable });
        }
    };

    const setCustomer = (customer: POSCustomer | null) => {
        console.log('🔧 setCustomer called:', { customer });

        if (customer) {
            setCustomers(prev => {
                const exists = prev.find(c => c.id === customer.id);
                if (!exists) {
                    const updated = [...prev, customer];
                    localStorage.setItem('pos_customers', JSON.stringify(updated));
                    return updated;
                }
                return prev;
            });
        }

        updateSession({ activeCustomer: customer || undefined });
    };

    const mergeTables = (tableIds: string[]) => {
        if (tableIds.length < 2) return;
        const mainTableId = tableIds[0];
        const otherTableIds = tableIds.slice(1);

        const totalSeats = tables
            .filter(t => tableIds.includes(t.id))
            .reduce((sum, t) => sum + t.seats, 0);

        const updatedTables = tables.map(t => {
            if (t.id === mainTableId) {
                return {
                    ...t,
                    seats: totalSeats,
                    mergedWith: otherTableIds,
                    name: `${t.name} + ${otherTableIds.length}`
                } as POSTable;
            }
            if (otherTableIds.includes(t.id)) {
                return { ...t, status: 'OCCUPIED' as const, mergedWith: [mainTableId] } as POSTable;
            }
            return t;
        });

        updateTables(updatedTables);
    };

    const unmergeTable = (tableId: string) => {
        const table = tables.find(t => t.id === tableId);
        if (!table || !table.mergedWith) return;

        const mergedIds = table.mergedWith;
        const updatedTables = tables.map(t => {
            if (t.id === tableId || mergedIds.includes(t.id)) {
                return {
                    ...t,
                    mergedWith: undefined,
                    seats: t.id === tableId ? t.seats - (mergedIds.length * 2) : t.seats,
                    status: 'FREE' as const,
                    name: t.name.split(' + ')[0]
                } as POSTable;
            }
            return t;
        });

        updateTables(updatedTables);
    };

    const logout = () => {
        updateSession(null);
        router.push('/pos/login');
    };

    const addToCart = (item: any) => {
        setCart(prev => {
            // Check if it's a simple product add or a full customized item
            const isFullItem = !!item.variants || !!item.pizzaModifiers || !!item.modifiers || !!item.isCombo;

            // Merging logic: Only merge simple items with no customizations
            if (!isFullItem) {
                const existing = prev.find(i => i.productId === item.id && !i.variants?.length && !i.modifiers?.length && !i.pizzaModifiers);
                if (existing) {
                    return prev.map(i =>
                        i.id === existing.id
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    );
                }
            }

            // Otherwise add as new item (or if it's already a full item with its own ID)
            return [...prev, {
                id: item.id || Math.random().toString(36).substr(2, 9),
                productId: item.productId || item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                variants: item.variants || [],
                modifiers: item.modifiers || [],
                pizzaModifiers: item.pizzaModifiers,
                slots: item.slots,
                isCombo: item.isCombo,
                isPizza: item.isPizza,
                notes: item.notes || ''
            }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));
    };

    const updateCartItem = (itemId: string, updates: Partial<POSCartItem>) => {
        setCart(prev => prev.map(item => item.id === itemId ? { ...item, ...updates } : item));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const [incomingCall, setIncomingCall] = useState<{ number: string; caller: string; location: string; customerId?: string } | null>(null);

    const updateCustomer = useCallback((customerId: string, data: Partial<POSCustomer>) => {
        setCustomers(prev => {
            const updated = prev.map(c => c.id === customerId ? { ...c, ...data } : c);
            localStorage.setItem('pos_customers', JSON.stringify(updated));
            return updated;
        });

        if (session?.activeCustomer?.id === customerId) {
            updateSession({ ...session, activeCustomer: { ...session.activeCustomer, ...data } });
        }
    }, [session, updateSession]);

    const addOrderToCustomerHistory = useCallback((customerId: string, order: any) => {
        setCustomers(prev => {
            const updated = prev.map(c => {
                if (c.id === customerId) {
                    const updatedOrders = [order, ...(c.recentOrders || [])];
                    return { ...c, recentOrders: updatedOrders };
                }
                return c;
            });
            localStorage.setItem('pos_customers', JSON.stringify(updated));
            return updated;
        });

        if (session?.activeCustomer?.id === customerId) {
            const updatedOrders = [order, ...(session.activeCustomer.recentOrders || [])];
            updateSession({
                ...session,
                activeCustomer: { ...session.activeCustomer, recentOrders: updatedOrders }
            });
        }
    }, [session, updateSession]);

    const setDeliveryAddress = useCallback((address: { id: string; text: string; label: string } | null) => {
        updateSession({ deliveryAddress: address || undefined });
    }, [updateSession]);

    const formatBusinessDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatLocalDateTimeWithOffset = (date: Date) => {
        const pad = (value: number) => String(value).padStart(2, '0');
        const offsetMinutes = -date.getTimezoneOffset();
        const offsetSign = offsetMinutes >= 0 ? '+' : '-';
        const absoluteOffset = Math.abs(offsetMinutes);
        const offsetHours = pad(Math.floor(absoluteOffset / 60));
        const offsetMins = pad(absoluteOffset % 60);

        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${offsetSign}${offsetHours}:${offsetMins}`;
    };

    const startShift = useCallback(async (openingCash: number, notes?: string) => {
        if (!session) return;
        setIsSyncing(true);
        const now = new Date();
        const shift = {
            startTime: formatLocalDateTimeWithOffset(now),
            openingCash,
            notes
        };

        try {
            await openPOSShift({
                store_id: session.store.id,
                businessDate: formatBusinessDate(now),
                systemHandshakeTime: shift.startTime,
                initialFloatCash: openingCash.toFixed(2),
                personnelNotes: notes || ''
            });

            updateSession({ ...session, shift });
        } finally {
            setIsSyncing(false);
        }
    }, [session, updateSession]);

    return (
        <POSContext.Provider value={{
            session, isOffline, deviceId, login, setStore, setChannel, setTable, moveTable, setCustomer, logout,
            cart, setCart, addToCart, removeFromCart, updateQuantity, updateCartItem, clearCart, cartTotal,
            selectedCustomer: session?.activeCustomer,
            deliveryAddress: session?.deliveryAddress,
            setDeliveryAddress,
            incomingCall, setIncomingCall, updateCustomer, addOrderToCustomerHistory,
            customers,
            startShift,
            isSyncing,
            setSyncing: setIsSyncing,
            tables,
            updateTables,
            mergeTables,
            unmergeTable
        }}>
            {children}
        </POSContext.Provider>
    );
};

export const usePOS = () => {
    const context = useContext(POSContext);
    if (!context) {
        throw new Error('usePOS must be used within a POSProvider');
    }
    return context;
};
