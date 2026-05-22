import type { BusinessType, DeliveryProviderType, PaymentProvider } from '@/shared/types/store';

// ─── Tax Rule ───────────────────────────────────────────────────────────────

export type TaxType = 'GST' | 'HST' | 'PST' | 'QST' | 'VAT' | 'Sales Tax' | 'Alcohol Tax' | 'Delivery Tax' | 'Service Tax' | 'Environmental Fee';
export type TaxMode = 'exclusive' | 'inclusive' | 'compound';

export interface WizardTaxRule {
    id: string;
    name: string;
    type: TaxType;
    rate: string;
    mode: TaxMode;
    channelScope: string;
    priority: number;
}

// ─── Fee Rule ───────────────────────────────────────────────────────────────

export type FeeType = 'delivery' | 'service' | 'packaging' | 'convenience' | 'small_order' | 'fuel_surcharge' | 'late_night' | 'processing' | 'bottle_deposit' | 'bag';
export type FeeCalcMethod = 'fixed' | 'percentage' | 'distance_based' | 'tier_based' | 'per_item' | 'per_order';

export interface WizardFeeRule {
    id: string;
    name: string;
    type: FeeType;
    method: FeeCalcMethod;
    value: string;
    taxable: boolean;
    refundable: boolean;
    enabled: boolean;
}

// ─── Wizard Data ────────────────────────────────────────────────────────────

export interface StoreWizardData {
    // Basic Info
    name: string;
    code: string;
    businessType: BusinessType;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    timezone: string;
    phone: string;
    secondaryPhone: string;
    email: string;
    website: string;
    latitude: string;
    longitude: string;
    // Services
    enablePickup: boolean;
    enableDelivery: boolean;
    enableDineIn: boolean;
    enableKiosk: boolean;
    // Hours
    posOpen: string; posClose: string;
    onlineOpen: string; onlineClose: string;
    // Delivery
    deliveryRadius: string;
    deliveryMinOrder: string;
    deliveryBaseFee: string;
    deliveryFreeThreshold: string;
    deliveryEstMinutes: string;
    deliveryProvider: DeliveryProviderType;
    // Pickup
    pickupPrepTime: string;
    pickupSlotDuration: string;
    pickupCurbside: boolean;
    pickupInstructions: string;
    // Dine-In
    dineInQR: boolean;
    dineInTableService: boolean;
    dineInReservation: boolean;
    dineInWaitlist: boolean;
    // Payments
    paymentProvider: PaymentProvider | '';
    merchantId: string;
    terminalId: string;
    tipsEnabled: boolean;
    refundEnabled: boolean;
    splitPayment: boolean;
    // Tax
    taxProfile: 'Inherit' | 'Override';
    taxRules: WizardTaxRule[];
    // Tips
    tipPresets: string;
    tipCalcMode: 'before_tax' | 'after_tax';
    autoGratuityEnabled: boolean;
    autoGratuityMinParty: string;
    autoGratuityPercent: string;
    // Fees
    feeRules: WizardFeeRule[];
    // Payment Terms
    paymentTerms: string;
}

export const DEFAULT_WIZARD_DATA: StoreWizardData = {
    name: '', code: '', businessType: 'single_store',
    address: '', city: '', province: 'Ontario', postalCode: '', country: 'Canada',
    timezone: 'America/Toronto', phone: '', secondaryPhone: '', email: '', website: '',
    latitude: '', longitude: '',
    enablePickup: true, enableDelivery: false, enableDineIn: false, enableKiosk: false,
    posOpen: '09:00', posClose: '22:00', onlineOpen: '10:00', onlineClose: '21:00',
    deliveryRadius: '5', deliveryMinOrder: '15', deliveryBaseFee: '3.99',
    deliveryFreeThreshold: '40', deliveryEstMinutes: '30', deliveryProvider: 'internal',
    pickupPrepTime: '15', pickupSlotDuration: '15', pickupCurbside: false, pickupInstructions: '',
    dineInQR: false, dineInTableService: false, dineInReservation: false, dineInWaitlist: false,
    paymentProvider: '', merchantId: '', terminalId: '',
    tipsEnabled: true, refundEnabled: true, splitPayment: false,
    taxProfile: 'Inherit',
    taxRules: [{ id: 'tax-1', name: 'HST', type: 'HST', rate: '13', mode: 'exclusive', channelScope: 'all', priority: 1 }],
    tipPresets: '10,15,18,20',
    tipCalcMode: 'before_tax',
    autoGratuityEnabled: false, autoGratuityMinParty: '6', autoGratuityPercent: '18',
    feeRules: [],
    paymentTerms: 'Net 30',
};
