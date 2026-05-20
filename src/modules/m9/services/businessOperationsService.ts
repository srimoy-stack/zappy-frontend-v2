import {
    BusinessOperationsSettings,
    BusinessInfo,
    LocalizationSettings,
    TaxRule,
    SmtpSettings,
    SmsSettings,
    LoyaltySettings,
    ModuleSettings,
    BusinessLocation
} from '../types/business-operations';
import { api } from '@/shared/api';

const INITIAL_DATA: BusinessOperationsSettings = {
    businessInfo: {
        businessName: 'Zyappy Demo',
        startDate: '2024-01-01',
        website: 'https://zyappy.com',
        isWebsitePublic: true,
        phone: '+1 (555) 000-1234',
        isPhonePublic: true,
        address: '123 Tech Avenue, Silicon Valley, CA',
        logoUrl: 'https://placehold.co/200x200/0f172a/ffffff?text=ZYAPPY'
    },
    localization: {
        currency: 'USD',
        decimalPrecision: 2,
        timezone: 'America/Los_Angeles',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
    },
    taxes: [
        {
            id: 'tax_1',
            name: 'VAT',
            percentage: 5,
            type: 'Exclusive',
            applicableChannels: ['POS', 'Online', 'Kiosk'],
            status: 'Active'
        },
        {
            id: 'tax_2',
            name: 'Service Charge',
            percentage: 10,
            type: 'Inclusive',
            applicableChannels: ['POS'],
            status: 'Active'
        }
    ],
    smtp: {
        host: 'smtp.zyappy.com',
        port: 587,
        encryption: 'TLS',
        username: 'notifications@zyappy.com',
        password: '••••••••••••',
        senderName: 'Zyappy POS',
        senderEmail: 'noreply@zyappy.com'
    },
    sms: {
        provider: 'Twilio',
        accountSid: 'AC' + '•'.repeat(32),
        authToken: '•'.repeat(32),
        senderNumber: '+10000000000'
    },
    loyalty: {
        isEnabled: true,
        earningRules: '1 point per $1 spent',
        redemptionRules: '100 points = $5 discount',
        expiryPeriodMonths: 12
    },
    modules: {
        pos: true,
        onlineOrdering: true,
        kiosk: true,
        inventory: true,
        pricing: true,
        kitchen: true,
        delivery: true,
        marketing: true,
        aiPhoneOrdering: false,
        analytics: true
    },
    locations: [
        {
            id: 'loc_1',
            name: 'Flagship Store',
            address: '123 Main St, Downtown',
            status: 'Active',
            timezone: 'America/Los_Angeles',
            timings: {
                pos: Array(7).fill(null).map((_, i) => ({
                    day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i] as any,
                    openTime: '09:00',
                    closeTime: '22:00',
                    isOpen: true
                })),
                online: Array(7).fill(null).map((_, i) => ({
                    day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i] as any,
                    openTime: '10:00',
                    closeTime: '21:00',
                    isOpen: true
                })),
                kiosk: Array(7).fill(null).map((_, i) => ({
                    day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i] as any,
                    openTime: '09:00',
                    closeTime: '22:00',
                    isOpen: true
                }))
            }
        }
    ]
};

let store = { ...INITIAL_DATA };
let auditLogs: any[] = [];

export const businessOperationsService = {
    getSettings: async (tenantId?: string | null): Promise<BusinessOperationsSettings> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        let locations: BusinessLocation[] = [];
        if (tenantId) {
            try {
                const stores = await api.getStores(tenantId);
                locations = stores.map((s) => ({
                    id: s.id,
                    name: s.name,
                    address: s.address || `${s.city}, ${s.province}`,
                    status: s.status === 'Active' ? 'Active' : 'Inactive',
                    timezone: s.timezone,
                    timings: {
                        pos: Array(7).fill(null).map((_, i) => ({
                            day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i] as any,
                            openTime: '09:00',
                            closeTime: '22:00',
                            isOpen: true
                        })),
                        online: Array(7).fill(null).map((_, i) => ({
                            day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i] as any,
                            openTime: '10:00',
                            closeTime: '21:00',
                            isOpen: true
                        })),
                        kiosk: Array(7).fill(null).map((_, i) => ({
                            day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i] as any,
                            openTime: '09:00',
                            closeTime: '22:00',
                            isOpen: true
                        }))
                    }
                }));
            } catch (err) {
                console.error('Failed to load stores from API:', err);
            }
        } else {
            locations = store.locations;
        }
        return { ...store, locations };
    },

    updateBusinessInfo: async (data: BusinessInfo) => {
        store.businessInfo = data;
        logAudit('Business Information Updated', data);
        return { ...store.businessInfo };
    },

    updateLocalization: async (data: LocalizationSettings) => {
        store.localization = data;
        logAudit('Localization Settings Updated', data);
        return { ...store.localization };
    },

    updateTaxes: async (data: TaxRule[]) => {
        store.taxes = data;
        logAudit('Tax Configuration Updated', data);
        return [...store.taxes];
    },

    updateSmtp: async (data: SmtpSettings) => {
        store.smtp = data;
        logAudit('SMTP Settings Updated', { ...data, password: '****' });
        return { ...store.smtp };
    },

    updateSms: async (data: SmsSettings) => {
        store.sms = data;
        logAudit('SMS Settings Updated', { ...data, authToken: '****' });
        return { ...store.sms };
    },

    updateLoyalty: async (data: LoyaltySettings) => {
        store.loyalty = data;
        logAudit('Loyalty Settings Updated', data);
        return { ...store.loyalty };
    },

    updateModules: async (data: ModuleSettings) => {
        store.modules = data;
        logAudit('Module Toggles Updated', data);
        return { ...store.modules };
    },

    updateLocations: async (tenantId: string | null, data: BusinessLocation[]) => {
        store.locations = data;
        logAudit('Location Configuration Updated', data);

        if (tenantId) {
            try {
                const existingStores = await api.getStores(tenantId);
                for (const loc of data) {
                    const existing = existingStores.find(s => s.id === loc.id);
                    const statusStr = loc.status === 'Active' ? 'Active' : 'Inactive';
                    if (existing) {
                        await api.updateStore(tenantId, loc.id, {
                            name: loc.name,
                            address: loc.address,
                            timezone: loc.timezone,
                            status: statusStr,
                        } as any);
                    } else {
                        await api.createStore(tenantId, {
                            name: loc.name,
                            code: loc.name.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 10) + `_${Date.now().toString().slice(-4)}`,
                            address: loc.address,
                            city: 'Default City',
                            province: 'Default Province',
                            timezone: loc.timezone === 'System Default' ? 'America/New_York' : loc.timezone,
                            status: statusStr,
                        } as any);
                    }
                }
            } catch (err) {
                console.error('Failed to sync stores with API:', err);
            }
        }
        return [...store.locations];
    },

    sendTestEmail: async (email: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (email.includes('error')) throw new Error('SMTP Connection Failed');
        return { success: true, message: `Test email sent successfully to ${email}` };
    },

    sendTestSms: async (phone: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (phone.includes('000')) throw new Error('SMS Provider Error');
        return { success: true, message: `Test SMS sent successfully to ${phone}` };
    },

    getAuditLogs: async () => {
        return [...auditLogs];
    }
};

function logAudit(action: string, details: any) {
    auditLogs.unshift({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action,
        details: JSON.stringify(details),
        user: 'Admin User'
    });
}
