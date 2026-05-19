import { env } from '@/shared/config/env';
import { InventoryAdapter } from './inventory.interface';
import { mockInventoryAdapter } from './mock.adapter';
// import { httpInventoryAdapter } from './http.adapter'; // To be implemented later

export const inventoryApi: InventoryAdapter = env.apiMode === 'live' 
    ? mockInventoryAdapter // Fallback to mock until HTTP is ready
    : mockInventoryAdapter;

export * from './inventory.interface';
