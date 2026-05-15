import apiClient from '@/api/axios';
import {
    ContactRecord,
    CreateContactPayload,
    ContactFilters,
} from '../types/contact.types';
import { StoreOption } from '../types/campaign.types';
import { DEV_SEED_CONTACTS } from '../utils/contactSeeds';
import { isDemoMode } from '../utils/demoMode';

/**
 * Contact API Service
 *
 * Centralized access to contact management endpoints.
 * Falls back to deterministic seed data in development when API is unavailable.
 */
export const contactService = {
    /**
     * Fetch all contacts with optional filters.
     */
    getContacts: async (filters?: Partial<ContactFilters>): Promise<ContactRecord[]> => {
        try {
            const response = await apiClient.get<ContactRecord[]>('/email-campaigns/contacts/list', {
                params: filters,
            });
            return response.data;
        } catch {
            if (isDemoMode()) {
                let contacts = [...DEV_SEED_CONTACTS];

                // Apply client-side filtering for dev
                if (filters?.consent_status && filters.consent_status !== 'all') {
                    contacts = contacts.filter((c) => c.consent_status === filters.consent_status);
                }
                if (filters?.store_id && filters.store_id !== 'all') {
                    contacts = contacts.filter((c) => c.store_id === filters.store_id);
                }
                if (filters?.suppression_status && filters.suppression_status !== 'all') {
                    contacts = contacts.filter(
                        (c) => c.suppression_status === filters.suppression_status
                    );
                }
                if (filters?.search) {
                    const q = filters.search.toLowerCase();
                    contacts = contacts.filter(
                        (c) =>
                            c.name.toLowerCase().includes(q) ||
                            c.email.toLowerCase().includes(q)
                    );
                }

                return contacts;
            }
            throw new Error('Failed to load contacts');
        }
    },

    /**
     * Create a new contact.
     * consent_status MUST be provided explicitly — the API never assumes consent.
     */
    createContact: async (payload: CreateContactPayload): Promise<ContactRecord> => {
        try {
            const response = await apiClient.post<ContactRecord>(
                '/email-campaigns/contacts',
                payload
            );
            return response.data;
        } catch {
            if (isDemoMode()) {
                // Generate a mock record for dev
                const storeNames: Record<string, string> = {
                    store_001: 'Flagship San Francisco',
                    store_002: 'New York Boutique',
                    store_003: 'London Outlet',
                    store_004: 'Tokyo Concept',
                    store_005: 'Online Store',
                };
                const newContact: ContactRecord = {
                    id: `ct-${Date.now()}`,
                    name: payload.name,
                    email: payload.email,
                    store_id: payload.store_id,
                    store_name: storeNames[payload.store_id] || payload.store_id,
                    total_spend: 0,
                    consent_status: payload.consent_status,
                    suppression_status: 'not_suppressed',
                    created_at: new Date().toISOString(),
                };
                DEV_SEED_CONTACTS.unshift(newContact);
                return newContact;
            }
            throw new Error('Failed to create contact');
        }
    },

    /**
     * Import contacts from parsed CSV rows.
     * Only valid rows are submitted to the backend.
     * consent_acknowledged must be true — the backend blocks without it.
     */
    importContacts: async (
        contacts: CreateContactPayload[],
        consentAcknowledged: boolean = true
    ): Promise<{ imported: number; updated: number; failed: number; suppressed_blocked: number; message: string }> => {
        try {
            const response = await apiClient.post<{ imported: number; updated: number; failed: number; suppressed_blocked: number; message: string }>(
                '/email-campaigns/contacts/import',
                { contacts, consent_acknowledged: consentAcknowledged }
            );
            return response.data;
        } catch (err: any) {
            // Surface backend compliance errors to the UI
            if (err.response?.data?.code === 'consent_acknowledgment_required') {
                throw new Error(err.response.data.error);
            }
            if (isDemoMode()) {
                const storeNames: Record<string, string> = {
                    store_001: 'Flagship San Francisco',
                    store_002: 'New York Boutique',
                    store_003: 'London Outlet',
                    store_004: 'Tokyo Concept',
                    store_005: 'Online Store',
                };
                for (const c of contacts) {
                    const newContact: ContactRecord = {
                        id: `ct-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                        name: c.name,
                        email: c.email,
                        store_id: c.store_id,
                        store_name: storeNames[c.store_id] || c.store_id,
                        total_spend: 0,
                        consent_status: c.consent_status,
                        suppression_status: 'active',
                        created_at: new Date().toISOString(),
                    };
                    DEV_SEED_CONTACTS.unshift(newContact);
                }
                return { imported: contacts.length, updated: 0, failed: 0, suppressed_blocked: 0, message: `${contacts.length} contacts imported (demo)` };
            }
            throw new Error('Failed to import contacts');
        }
    },

    /**
     * Update an existing contact.
     */
    updateContact: async (
        contactId: string,
        payload: Partial<CreateContactPayload>
    ): Promise<ContactRecord> => {
        try {
            const response = await apiClient.put<ContactRecord>(
                `/email-campaigns/contacts/${contactId}`,
                payload
            );
            return response.data;
        } catch (err: any) {
            if (isDemoMode()) {
                const contact = DEV_SEED_CONTACTS.find((c) => c.id === contactId);
                if (contact) {
                    Object.assign(contact, payload);
                    contact.updated_at = new Date().toISOString();
                    return { ...contact };
                }
                throw new Error('Contact not found');
            }
            const message = err.response?.data?.error || 'Failed to update contact';
            throw new Error(message);
        }
    },

    /**
     * Update suppression status for a contact.
     */
    updateSuppression: async (
        contactId: string,
        status: 'suppressed' | 'not_suppressed'
    ): Promise<ContactRecord> => {
        try {
            const response = await apiClient.patch<ContactRecord>(
                `/email-campaigns/contacts/${contactId}/suppression`,
                { suppression_status: status }
            );
            return response.data;
        } catch {
            if (isDemoMode()) {
                const contact = DEV_SEED_CONTACTS.find((c) => c.id === contactId);
                if (contact) {
                    contact.suppression_status = status;
                    contact.updated_at = new Date().toISOString();
                    return { ...contact };
                }
                throw new Error('Contact not found');
            }
            throw new Error('Failed to update suppression status');
        }
    },

    /**
     * Get available stores (delegates to segment service pattern).
     */
    getStores: async (): Promise<StoreOption[]> => {
        try {
            const response = await apiClient.get<StoreOption[]>('/email-campaigns/stores');
            return response.data;
        } catch {
            if (isDemoMode()) {
                return [
                    { id: 'store_001', name: 'Flagship San Francisco' },
                    { id: 'store_002', name: 'New York Boutique' },
                    { id: 'store_003', name: 'London Outlet' },
                    { id: 'store_004', name: 'Tokyo Concept' },
                    { id: 'store_005', name: 'Online Store' },
                ];
            }
            throw new Error('Failed to load stores');
        }
    },
};
