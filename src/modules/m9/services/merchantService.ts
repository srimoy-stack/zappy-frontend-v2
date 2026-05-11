/**
 * merchantService — Refactored to use Global API Adapter
 *
 * This service maps legacy 'Merchant' and 'Location' concepts to the new
 * canonical 'Tenant' and 'Store' entities.
 */

import { api } from '@/shared/api';
import type { Merchant, MerchantLocation, CreateLocationPayload } from '../types/merchant';
import type { Tenant, Store } from '@/shared/types';

// ─── Type Mappers ────────────────────────────────────────────────────────────

function mapToMerchant(t: Tenant): Merchant {
    return {
        id: t.id,
        name: t.name,
        description: t.description || '',
        status: (t.status as any) || 'Active',
        totalLocations: 0, // This would ideally come from the API or a separate count
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt || new Date().toISOString(),
    };
}

function mapToMerchantLocation(s: Store): MerchantLocation {
    return {
        id: s.id,
        locationId: s.code || s.id,
        name: s.name,
        landmark: '',
        address: s.address || '',
        city: s.city || '',
        zipCode: s.zipCode || '',
        state: s.province || '',
        country: s.country || '',
        contact: '',
        phone: s.phone || '',
        email: '',
        tax: s.taxProfile || '',
        timezone: s.timezone || 'UTC',
        priceGroup: '',
        invoiceScheme: s.paymentTerms || '',
        invoiceLayoutPOS: '',
        invoiceLayoutSale: '',
        status: s.status === 'Active' ? 'Active' : 'Inactive',
        timings: [], // Timings should be added to the canonical Store type if needed
        createdAt: s.createdAt || new Date().toISOString(),
        updatedAt: s.updatedAt || new Date().toISOString(),
    };
}

// ─── Service Implementation ──────────────────────────────────────────────────

class MerchantService {
    // Get all merchants (Tenants)
    async getMerchants(): Promise<Merchant[]> {
        const tenants = await api.getTenants();
        return tenants.map(mapToMerchant);
    }

    // Get merchant by ID
    async getMerchantById(id: string): Promise<Merchant | null> {
        const tenant = await api.getTenant(id);
        return tenant ? mapToMerchant(tenant) : null;
    }

    // Get locations for a merchant (Stores for a Tenant)
    async getLocationsByMerchant(merchantId: string): Promise<MerchantLocation[]> {
        const stores = await api.getStores(merchantId);
        return stores.map(mapToMerchantLocation);
    }

    // Get location by ID
    async getLocationById(merchantId: string, locationId: string): Promise<MerchantLocation | null> {
        const store = await api.getStore(locationId);
        return store ? mapToMerchantLocation(store) : null;
    }

    // Create new location
    async createLocation(merchantId: string, payload: CreateLocationPayload): Promise<MerchantLocation> {
        const store = await api.createStore(merchantId, {
            name: payload.name,
            code: payload.timezone, // Mapping loosely for now
            timezone: payload.timezone,
            city: payload.city,
            province: payload.state,
            country: payload.country,
            address: payload.address,
            zipCode: payload.zipCode,
            phone: payload.phone,
            status: 'Active',
            paymentTerms: payload.invoiceScheme,
            taxProfile: payload.tax,
        });
        return mapToMerchantLocation(store);
    }

    // Update location
    async updateLocation(merchantId: string, locationId: string, updates: Partial<MerchantLocation>): Promise<MerchantLocation> {
        const store = await api.updateStore(locationId, {
            name: updates.name,
            city: updates.city,
            province: updates.state,
            country: updates.country,
            address: updates.address,
            zipCode: updates.zipCode,
            phone: updates.phone,
            status: updates.status === 'Active' ? 'Active' : 'Disabled',
        });
        return mapToMerchantLocation(store);
    }

    // Delete location
    async deleteLocation(merchantId: string, locationId: string): Promise<void> {
        await api.deleteStore(locationId);
    }
}

export const merchantService = new MerchantService();
