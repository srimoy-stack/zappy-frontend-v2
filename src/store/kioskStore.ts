import { create } from 'zustand';

// ─── Screen Definitions ────────────────────────────────────────────────────────
export type KioskScreen =
    | 'start'
    | 'identity'
    | 'restaurant'
    | 'menu'
    | 'product'
    | 'builder'
    | 'cart'
    | 'review'
    | 'payment'
    | 'success';

// ─── Data Types ────────────────────────────────────────────────────────────────
export interface KioskTotals {
    subtotal: number;
    tax: number;
    serviceCharge: number;
    total: number;
}

export interface Topping {
    name: string;
    zone: 'left' | 'right' | 'whole';
    price?: number;
}

export interface PizzaBuilderState {
    size: string | null;
    crust: string | null;
    toppings: Topping[];
    basePrice: number;
}

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    basePrice: number;
    image: string;
    selectedModifiers: Record<string, Record<string, number>>;
    selectedCombo: Record<string, string>;
    toppings?: Topping[];
    size?: string;
    crust?: string;
    modifierNames?: string[];
    comboNames?: string[];
    quantity: number;
    kitchenNote: string;
    price: number;
    finalTotal: number;
    type: 'pizza' | 'item';
}

export interface CustomerIdentity {
    id: string;
    name?: string;
    points?: number;
    authenticated: boolean;
    pastOrders?: PastOrder[];
}

export interface PastOrder {
    id: string;
    date?: string;
    total?: number;
    items: CartItem[];
}

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failure';
export type OrderType = 'dine-in' | 'to-go';

// ─── Store Interface ───────────────────────────────────────────────────────────
interface KioskState {
    // Navigation
    currentScreen: KioskScreen;
    screenHistory: KioskScreen[];
    screenParams: Record<string, unknown>;

    // Session
    sessionActive: boolean;
    idleTimeoutMs: number;
    lastActivityTimestamp: number;

    // Restaurant
    selectedRestaurant: { id: string; name: string; location: string; image: string; color: string } | null;

    // Menu
    activeCategory: string | null;

    // Identity (in-memory only, NO localStorage)
    identity: CustomerIdentity | null;

    // Order
    orderType: OrderType;
    cart: CartItem[];
    totals: KioskTotals;

    // Pizza Builder
    pizzaBuilderState: PizzaBuilderState;

    // Payment
    paymentState: {
        status: PaymentStatus;
        message: string;
        orderId?: string;
    };

    // Kitchen
    kitchenQueueCount: number;
    orderNumber: number | null;

    // ── Navigation Actions ─────────────────────────────────────────────────
    navigateTo: (screen: KioskScreen, params?: Record<string, unknown>) => void;
    goBack: () => void;

    // ── Session Actions ────────────────────────────────────────────────────
    startSession: () => void;
    resetSession: () => void;
    touchActivity: () => void;

    // ── Restaurant Actions ─────────────────────────────────────────────────
    setRestaurant: (restaurant: KioskState['selectedRestaurant']) => void;

    // ── Menu Actions ───────────────────────────────────────────────────────
    setActiveCategory: (categoryId: string | null) => void;

    // ── Identity Actions ───────────────────────────────────────────────────
    setIdentity: (identity: CustomerIdentity | null) => void;
    clearIdentity: () => void;

    // ── Order Actions ──────────────────────────────────────────────────────
    setOrderType: (type: OrderType) => void;

    // ── Cart Actions ───────────────────────────────────────────────────────
    addToCart: (item: CartItem) => void;
    updateCartItem: (index: number, item: Partial<CartItem>) => void;
    updateCartItemQuantity: (index: number, delta: number) => void;
    removeCartItem: (index: number) => void;
    clearCart: () => void;

    // ── Pizza Builder Actions ──────────────────────────────────────────────
    updateBuilder: (update: Partial<PizzaBuilderState>) => void;
    resetBuilder: () => void;
    addTopping: (topping: Topping) => void;
    removeTopping: (toppingName: string, zone: string) => void;

    // ── Payment Actions ────────────────────────────────────────────────────
    setPaymentStatus: (status: PaymentStatus, message: string) => void;
    setKitchenQueueCount: (count: number) => void;

    // ── Computed ───────────────────────────────────────────────────────────
    calculateTotals: () => void;
}

// ─── Initial States ────────────────────────────────────────────────────────────
const initialPizzaBuilderState: PizzaBuilderState = {
    size: null,
    crust: null,
    toppings: [],
    basePrice: 0,
};

const initialTotals: KioskTotals = {
    subtotal: 0,
    tax: 0,
    serviceCharge: 0,
    total: 0,
};

const IDLE_TIMEOUT_MS = 90_000; // 90 seconds

// ─── Store Implementation ──────────────────────────────────────────────────────
export const useKioskStore = create<KioskState>((set, get) => ({
    // Navigation
    currentScreen: 'start',
    screenHistory: [],
    screenParams: {},

    // Session
    sessionActive: false,
    idleTimeoutMs: IDLE_TIMEOUT_MS,
    lastActivityTimestamp: Date.now(),

    // Restaurant
    selectedRestaurant: null,

    // Menu
    activeCategory: null,

    // Identity
    identity: null,

    // Order
    orderType: 'dine-in',
    cart: [],
    totals: { ...initialTotals },

    // Pizza Builder
    pizzaBuilderState: { ...initialPizzaBuilderState },

    // Payment
    paymentState: {
        status: 'idle',
        message: '',
    },

    // Kitchen
    kitchenQueueCount: 5,
    orderNumber: null,

    // ── Navigation ─────────────────────────────────────────────────────────
    navigateTo: (screen, params = {}) => {
        const { currentScreen } = get();
        set(state => ({
            currentScreen: screen,
            screenHistory: [...state.screenHistory, currentScreen],
            screenParams: params,
            lastActivityTimestamp: Date.now(),
        }));
    },

    goBack: () => {
        const { screenHistory } = get();
        if (screenHistory.length === 0) {
            set({ currentScreen: 'start', screenParams: {} });
            return;
        }
        const newHistory = [...screenHistory];
        const previousScreen = newHistory.pop()!;
        set({
            currentScreen: previousScreen,
            screenHistory: newHistory,
            screenParams: {},
            lastActivityTimestamp: Date.now(),
        });
    },

    // ── Session ────────────────────────────────────────────────────────────
    startSession: () => set({
        sessionActive: true,
        lastActivityTimestamp: Date.now(),
    }),

    resetSession: () => set({
        currentScreen: 'start',
        screenHistory: [],
        screenParams: {},
        sessionActive: false,
        selectedRestaurant: null,
        activeCategory: null,
        identity: null,
        cart: [],
        orderType: 'dine-in',
        totals: { ...initialTotals },
        pizzaBuilderState: { ...initialPizzaBuilderState },
        paymentState: { status: 'idle', message: '' },
        orderNumber: null,
        lastActivityTimestamp: Date.now(),
    }),

    touchActivity: () => set({ lastActivityTimestamp: Date.now() }),

    // ── Restaurant ─────────────────────────────────────────────────────────
    setRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),

    // ── Menu ───────────────────────────────────────────────────────────────
    setActiveCategory: (categoryId) => set({ activeCategory: categoryId }),

    // ── Identity ───────────────────────────────────────────────────────────
    setIdentity: (identity) => set({ identity }),
    clearIdentity: () => set({ identity: null }),

    // ── Order Type ─────────────────────────────────────────────────────────
    setOrderType: (orderType) => set({ orderType }),

    // ── Cart ───────────────────────────────────────────────────────────────
    addToCart: (item) => {
        set(state => ({ cart: [...state.cart, item] }));
        get().calculateTotals();
    },

    updateCartItem: (index, updates) => {
        const { cart } = get();
        const newCart = [...cart];
        if (newCart[index]) {
            newCart[index] = { ...newCart[index], ...updates };
            set({ cart: newCart });
            get().calculateTotals();
        }
    },

    updateCartItemQuantity: (index, delta) => {
        const { cart } = get();
        const newCart = [...cart];
        if (newCart[index]) {
            const newQty = Math.max(0, newCart[index].quantity + delta);
            if (newQty === 0) {
                newCart.splice(index, 1);
            } else {
                newCart[index] = {
                    ...newCart[index],
                    quantity: newQty,
                    finalTotal: newCart[index].price * newQty,
                };
            }
            set({ cart: newCart });
            get().calculateTotals();
        }
    },

    removeCartItem: (index) => {
        const { cart } = get();
        const newCart = [...cart];
        newCart.splice(index, 1);
        set({ cart: newCart });
        get().calculateTotals();
    },

    clearCart: () => {
        set({ cart: [] });
        get().calculateTotals();
    },

    // ── Pizza Builder ──────────────────────────────────────────────────────
    updateBuilder: (update) => set(state => ({
        pizzaBuilderState: { ...state.pizzaBuilderState, ...update },
    })),

    resetBuilder: () => set({ pizzaBuilderState: { ...initialPizzaBuilderState } }),

    addTopping: (topping) => set(state => ({
        pizzaBuilderState: {
            ...state.pizzaBuilderState,
            toppings: [...state.pizzaBuilderState.toppings, topping],
        },
    })),

    removeTopping: (toppingName, zone) => set(state => ({
        pizzaBuilderState: {
            ...state.pizzaBuilderState,
            toppings: state.pizzaBuilderState.toppings.filter(
                t => t.name !== toppingName || t.zone !== zone
            ),
        },
    })),

    // ── Payment ────────────────────────────────────────────────────────────
    setPaymentStatus: (status, message) => set({ paymentState: { status, message } }),
    setKitchenQueueCount: (count) => set({ kitchenQueueCount: count }),

    // ── Totals ─────────────────────────────────────────────────────────────
    calculateTotals: () => {
        const { cart } = get();
        const subtotal = cart.reduce((acc, item) => acc + item.finalTotal, 0);
        const tax = subtotal * 0.1;
        const serviceCharge = subtotal > 0 ? 0.50 : 0;
        const total = subtotal + tax + serviceCharge;
        set({ totals: { subtotal, tax, serviceCharge, total } });
    },
}));
