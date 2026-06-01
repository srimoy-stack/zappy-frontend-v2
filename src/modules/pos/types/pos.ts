import { POSCustomer } from '../mock/posData';
export type { POSCustomer };

export type POSType = 'STORE' | 'CALL_CENTER';

export type OrderChannel = 'Dine-In' | 'Pickup' | 'Delivery' | 'Phone Order';

export type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

export interface POSTable {
    id: string;
    name: string;
    seats: number;
    status: TableStatus;
    orderId?: string;
    areaId: string;
    // Floor map positioning (percentage based for responsiveness)
    x: number;
    y: number;
    width?: number;
    height?: number;
    shape?: 'rectangle' | 'circle';
    // Live data
    orderCount?: number;
    durationMinutes?: number;
    customerName?: string;
    totalAmount?: number;
    mergedWith?: string[]; // IDs of tables merged with this one
}

export interface POSArea {
    id: string;
    name: string;
}

export interface POSUser {
    id: string;
    name: string;
    role: string;
    accessibleStores: string[]; // Store IDs
}

export interface POSShift {
    startTime: string;
    openingCash: number;
    notes?: string;
}

export interface POSStore {
    id: string;
    name: string;
    address: string;
}

export interface POSSession {
    user: POSUser;
    posType: POSType;
    store: POSStore;
    channel?: OrderChannel;
    activeTable?: POSTable;
    activeCustomer?: POSCustomer;
    deliveryAddress?: { id: string; text: string; label: string };
    deviceId: string;
    isOffline?: boolean;
    shift?: POSShift;
}

export interface POSContextType {
    session: POSSession | null;
    isOffline: boolean;
    deviceId: string;
    login: (type: POSType, credentials: { pin?: string; email?: string; password?: string; deviceId: string; cashierId?: string; cashierName?: string; cashierEmail?: string; storeId?: string }) => Promise<{ requiresStoreSelection: boolean } | undefined>;
    setStore: (store: POSStore) => void;
    setChannel: (channel: OrderChannel) => void;
    setTable: (table: POSTable | null) => void;
    moveTable: (sourceTableId: string, targetTableId: string) => void;
    setCustomer: (customer: POSCustomer | null) => void;
    logout: () => void;
    tables: POSTable[];
    updateTables: (newTables: POSTable[]) => void;
    cart: POSCartItem[];
    setCart: React.Dispatch<React.SetStateAction<POSCartItem[]>>;
    addToCart: (product: any) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    updateCartItem: (itemId: string, updates: Partial<POSCartItem>) => void;
    clearCart: () => void;
    cartTotal: number;
    selectedCustomer?: POSCustomer;
    deliveryAddress?: { id: string; text: string; label: string };
    setDeliveryAddress: (address: { id: string; text: string; label: string } | null) => void;
    incomingCall: { number: string; caller: string; location: string; customerId?: string } | null;
    setIncomingCall: (call: { number: string; caller: string; location: string; customerId?: string } | null) => void;
    updateCustomer: (customerId: string, data: Partial<POSCustomer>) => void;
    addOrderToCustomerHistory: (customerId: string, order: any) => void;
    customers: POSCustomer[];
    startShift: (openingCash: number, notes?: string) => Promise<void>;
    isSyncing: boolean;
    setSyncing: (syncing: boolean) => void;
    mergeTables: (tableIds: string[]) => void;
    unmergeTable: (tableId: string) => void;
}

export interface POSVariantGroup {
    id: string;
    name: string;
    options: {
        id: string;
        name: string;
        additionalPrice: number;
        isDefault?: boolean;
    }[];
}

export interface POSModifierGroup {
    id: string;
    name: string;
    minSelection?: number;
    maxSelection?: number;
    options: {
        id: string;
        name: string;
        price: number;
        isDefault?: boolean;
    }[];
}

export interface POSComboSlot {
    id: string;
    name: string;
    allowedCategoryIds: string[];
}

export interface POSProduct {
    id: string;
    categoryId: string;
    name: string;
    sku: string;
    price: number;
    image: string;
    hasVariants: boolean;
    isVeg: boolean;
    isAvailable: boolean;
    isFavorite?: boolean;
    isTopItem?: boolean;
    isCombo?: boolean;
    barcode?: string;
    isOnHold?: boolean;
    variantGroups?: POSVariantGroup[];
    modifierGroups?: POSModifierGroup[];
    comboSlots?: POSComboSlot[];
    ingredients?: string[];
    slots?: any[];
}

export interface POSCartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    variants: { groupId: string; optionId: string; name: string; price: number }[];
    modifiers: { optionId: string; name: string; price: number; quantity: number }[];
    isCombo?: boolean;
    slots?: any[];
    comboSelections?: { [slotId: string]: any };
    pizzaModifiers?: {
        toppings: {
            optionId: string;
            name: string;
            basePrice: number;
            portion: 'WHOLE' | 'LEFT' | 'RIGHT';
            level: 'NORMAL' | 'EXTRA' | 'DOUBLE';
        }[];
        addOns: {
            optionId: string;
            name: string;
            price: number;
            quantity: number;
        }[];
        removals: string[];
    };
    isPizza?: boolean;
    notes?: string;
    kitchenNote?: string;
}
