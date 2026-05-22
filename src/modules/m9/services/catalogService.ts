'use client';

import { apiClient } from '@/shared/api/apiClient';
import { Item, Category } from '../types/items';

/**
 * Enterprise Catalog Intelligence REST Integration Service
 *
 * Implements the concrete API routing layer to coordinate master products,
 * deployments, and sync operations with the microservices aggregator.
 */
export const catalogService = {
    /**
     * Retrieves the entire master product directory catalog for the current tenant.
     */
    listProducts: async (): Promise<Item[]> => {
        const res = await apiClient.get('/api/v2/catalog/products');
        return res.data;
    },

    /**
     * Creates a new gourmet composition master draft.
     */
    createProduct: async (data: Partial<Item>): Promise<Item> => {
        const res = await apiClient.post('/api/v2/catalog/products', data);
        return res.data;
    },

    /**
     * Updates an existing master product draft.
     */
    updateProduct: async (id: string, updates: Partial<Item>): Promise<Item> => {
        const res = await apiClient.put(`/api/v2/catalog/products/${id}`, updates);
        return res.data;
    },

    /**
     * Deletes a product draft from the catalog.
     */
    deleteProduct: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/v2/catalog/products/${id}`);
    },

    /**
     * Deploys and publishes a product version to all channels.
     */
    publishProduct: async (id: string): Promise<boolean> => {
        const res = await apiClient.post(`/api/v2/catalog/products/${id}/publish`);
        return res.data?.success || res.status === 200;
    },

    /**
     * Triggers a point-of-sale or online channel synchronization pipeline action.
     */
    triggerSync: async (id: string, channelId: string): Promise<{ success: boolean }> => {
        const res = await apiClient.post(`/api/v2/catalog/products/${id}/sync/${channelId}`);
        return res.data;
    }
};
