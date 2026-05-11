export interface BusinessInfo {
    businessName: string;
    startDate: string;
    website: string;
    isWebsitePublic: boolean;
    phone: string;
    isPhonePublic: boolean;
    address: string;
    logoUrl?: string;
}

export interface LocalizationSettings {
    currency: string;
    decimalPrecision: number;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
}

export interface TaxRule {
    id: string;
    name: string;
    percentage: number;
    type: 'Inclusive' | 'Exclusive';
    applicableChannels: ('POS' | 'Online' | 'Kiosk')[];
    status: 'Active' | 'Inactive';
}

export interface SmtpSettings {
    host: string;
    port: number;
    encryption: 'SSL' | 'TLS' | 'None';
    username: string;
    password: string; // Masked in UI
    senderName: string;
    senderEmail: string;
}

export interface SmsSettings {
    provider: 'Twilio';
    accountSid: string;
    authToken: string; // Masked in UI
    senderNumber: string;
}

export interface LoyaltySettings {
    isEnabled: boolean;
    earningRules: string; // e.g. "1 point per $1"
    redemptionRules: string;
    expiryPeriodMonths: number;
}

export interface ModuleSettings {
    pos: boolean;
    onlineOrdering: boolean;
    kiosk: boolean;
    inventory: boolean;
    pricing: boolean;
    kitchen: boolean;
    delivery: boolean;
    marketing: boolean;
    aiPhoneOrdering: boolean;
    analytics: boolean;
}

export interface LocationTiming {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    openTime: string;
    closeTime: string;
    isOpen: boolean;
}

export interface LocationChannelTiming {
    pos: LocationTiming[];
    online: LocationTiming[];
    kiosk: LocationTiming[];
}

export interface BusinessLocation {
    id: string;
    name: string;
    address: string;
    status: 'Active' | 'Inactive';
    timezone: string;
    timings: LocationChannelTiming;
}

export interface BusinessOperationsSettings {
    businessInfo: BusinessInfo;
    localization: LocalizationSettings;
    taxes: TaxRule[];
    smtp: SmtpSettings;
    sms: SmsSettings;
    loyalty: LoyaltySettings;
    modules: ModuleSettings;
    locations: BusinessLocation[];
}
