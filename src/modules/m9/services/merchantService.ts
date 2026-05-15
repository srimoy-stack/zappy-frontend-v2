import { Merchant, MerchantLocation, CreateLocationPayload } from '../types/merchant';

// Mock data for demonstration
const mockMerchants: Merchant[] = [
    {
        id: 'merch-1',
        name: 'Brand Flagship Store',
        description: 'Main flagship store and headquarters',
        status: 'Active',
        totalLocations: 2,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'merch-2',
        name: 'Airdrie',
        description: 'Airdrie regional location',
        status: 'Active',
        totalLocations: 1,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
    }
];

const mockLocations: Record<string, MerchantLocation[]> = {
    'merch-1': [
        {
            id: 'loc-1',
            locationId: 'L24',
            name: 'Brand Flagship Store - Main',
            landmark: 'Near City Center',
            address: '500 Centre Ave E #117',
            city: 'Airdrie',
            zipCode: 'T4B 1R2',
            state: 'Alberta',
            country: 'Canada',
            contact: 'John Manager',
            phone: '+1 (555) 123-4567',
            email: 'flagship@example.com',
            tax: 'TAX-001-AB',
            timezone: 'America/Edmonton',
            priceGroup: 'Ontario Tax',
            invoiceScheme: 'Invoice',
            invoiceLayoutPOS: 'Invoice',
            invoiceLayoutSale: 'Invoice',
            status: 'Active',
            timings: [
                { day: 'Monday', openTime: '09:00', closeTime: '21:00', isOpen: true },
                { day: 'Tuesday', openTime: '09:00', closeTime: '21:00', isOpen: true },
                { day: 'Wednesday', openTime: '09:00', closeTime: '21:00', isOpen: true },
                { day: 'Thursday', openTime: '09:00', closeTime: '21:00', isOpen: true },
                { day: 'Friday', openTime: '09:00', closeTime: '22:00', isOpen: true },
                { day: 'Saturday', openTime: '10:00', closeTime: '22:00', isOpen: true },
                { day: 'Sunday', openTime: '10:00', closeTime: '20:00', isOpen: true }
            ],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        },
        {
            id: 'loc-2',
            locationId: 'L25',
            name: 'Brand Flagship Store - Express',
            landmark: 'Downtown Plaza',
            address: '123 Main Street',
            city: 'Calgary',
            zipCode: 'T2P 1H9',
            state: 'Alberta',
            country: 'Canada',
            contact: 'Sarah Smith',
            phone: '+1 (555) 234-5678',
            email: 'express@example.com',
            tax: 'TAX-002-AB',
            timezone: 'America/Edmonton',
            priceGroup: 'Ontario Tax',
            invoiceScheme: 'Invoice',
            invoiceLayoutPOS: 'Invoice',
            invoiceLayoutSale: 'Invoice',
            status: 'Active',
            timings: [
                { day: 'Monday', openTime: '08:00', closeTime: '20:00', isOpen: true },
                { day: 'Tuesday', openTime: '08:00', closeTime: '20:00', isOpen: true },
                { day: 'Wednesday', openTime: '08:00', closeTime: '20:00', isOpen: true },
                { day: 'Thursday', openTime: '08:00', closeTime: '20:00', isOpen: true },
                { day: 'Friday', openTime: '08:00', closeTime: '21:00', isOpen: true },
                { day: 'Saturday', openTime: '09:00', closeTime: '21:00', isOpen: true },
                { day: 'Sunday', openTime: '10:00', closeTime: '18:00', isOpen: true }
            ],
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z'
        }
    ],
    'merch-2': [
        {
            id: 'loc-3',
            locationId: 'L26',
            name: 'Airdrie',
            landmark: 'Shopping District',
            address: '500 Centre Ave E #117',
            city: 'Airdrie',
            zipCode: 'T4B 1R2',
            state: 'Alberta',
            country: 'Canada',
            contact: 'Mike Johnson',
            phone: '+1 (555) 345-6789',
            email: 'airdrie@example.com',
            tax: 'TAX-003-AB',
            timezone: 'America/Edmonton',
            priceGroup: 'Ontario Tax',
            invoiceScheme: 'Invoice',
            invoiceLayoutPOS: 'Invoice',
            invoiceLayoutSale: 'Invoice',
            status: 'Active',
            timings: [
                { day: 'Monday', openTime: '07:00', closeTime: '19:00', isOpen: true },
                { day: 'Tuesday', openTime: '07:00', closeTime: '19:00', isOpen: true },
                { day: 'Wednesday', openTime: '07:00', closeTime: '19:00', isOpen: true },
                { day: 'Thursday', openTime: '07:00', closeTime: '19:00', isOpen: true },
                { day: 'Friday', openTime: '07:00', closeTime: '20:00', isOpen: true },
                { day: 'Saturday', openTime: '08:00', closeTime: '20:00', isOpen: true },
                { day: 'Sunday', openTime: '09:00', closeTime: '17:00', isOpen: true }
            ],
            createdAt: '2024-01-20T00:00:00Z',
            updatedAt: '2024-01-20T00:00:00Z'
        }
    ]
};

class MerchantService {
    // Get all merchants
    async getMerchants(): Promise<Merchant[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockMerchants), 500);
        });
    }

    // Get merchant by ID
    async getMerchantById(id: string): Promise<Merchant | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const merchant = mockMerchants.find(m => m.id === id);
                resolve(merchant || null);
            }, 300);
        });
    }

    // Get locations for a merchant
    async getLocationsByMerchant(merchantId: string): Promise<MerchantLocation[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockLocations[merchantId] || []);
            }, 500);
        });
    }

    // Get location by ID
    async getLocationById(merchantId: string, locationId: string): Promise<MerchantLocation | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const locations = mockLocations[merchantId] || [];
                const location = locations.find(l => l.id === locationId);
                resolve(location || null);
            }, 300);
        });
    }

    // Create new location
    async createLocation(merchantId: string, payload: CreateLocationPayload): Promise<MerchantLocation> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newLocation: MerchantLocation = {
                    id: `loc-${Date.now()}`,
                    locationId: `L${Math.floor(Math.random() * 1000)}`,
                    ...payload,
                    status: 'Active',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                if (!mockLocations[merchantId]) {
                    mockLocations[merchantId] = [];
                }
                mockLocations[merchantId].push(newLocation);

                // Update merchant total locations
                const merchant = mockMerchants.find(m => m.id === merchantId);
                if (merchant) {
                    merchant.totalLocations = mockLocations[merchantId].length;
                }

                resolve(newLocation);
            }, 500);
        });
    }

    // Update location
    async updateLocation(merchantId: string, locationId: string, updates: Partial<MerchantLocation>): Promise<MerchantLocation> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const locations = mockLocations[merchantId];
                if (!locations) {
                    reject(new Error('Merchant not found'));
                    return;
                }

                const index = locations.findIndex(l => l.id === locationId);

                if (index === -1) {
                    reject(new Error('Location not found'));
                    return;
                }

                const existingLocation = locations[index]!;
                const updatedLocation: MerchantLocation = {
                    id: existingLocation.id,
                    locationId: existingLocation.locationId,
                    name: updates.name ?? existingLocation.name,
                    landmark: updates.landmark ?? existingLocation.landmark,
                    address: updates.address ?? existingLocation.address,
                    city: updates.city ?? existingLocation.city,
                    zipCode: updates.zipCode ?? existingLocation.zipCode,
                    state: updates.state ?? existingLocation.state,
                    country: updates.country ?? existingLocation.country,
                    contact: updates.contact ?? existingLocation.contact,
                    phone: updates.phone ?? existingLocation.phone,
                    email: updates.email ?? existingLocation.email,
                    tax: updates.tax ?? existingLocation.tax,
                    timezone: updates.timezone ?? existingLocation.timezone,
                    priceGroup: updates.priceGroup ?? existingLocation.priceGroup,
                    invoiceScheme: updates.invoiceScheme ?? existingLocation.invoiceScheme,
                    invoiceLayoutPOS: updates.invoiceLayoutPOS ?? existingLocation.invoiceLayoutPOS,
                    invoiceLayoutSale: updates.invoiceLayoutSale ?? existingLocation.invoiceLayoutSale,
                    status: updates.status ?? existingLocation.status,
                    timings: updates.timings ?? existingLocation.timings,
                    createdAt: existingLocation.createdAt,
                    updatedAt: new Date().toISOString()
                };

                mockLocations[merchantId]![index] = updatedLocation;
                resolve(updatedLocation);
            }, 500);
        });
    }

    // Delete location
    async deleteLocation(merchantId: string, locationId: string): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (mockLocations[merchantId]) {
                    mockLocations[merchantId] = mockLocations[merchantId].filter(l => l.id !== locationId);

                    // Update merchant total locations
                    const merchant = mockMerchants.find(m => m.id === merchantId);
                    if (merchant) {
                        merchant.totalLocations = mockLocations[merchantId].length;
                    }
                }
                resolve();
            }, 300);
        });
    }
}

export const merchantService = new MerchantService();
