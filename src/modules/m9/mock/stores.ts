export interface StoreInfo {
    id: string;
    name: string;
    region: 'NORTH_AMERICA' | 'EUROPE' | 'ASIA';
    city: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export const mockStores: StoreInfo[] = [
    { id: 'store_001', name: 'Flagship San Francisco', region: 'NORTH_AMERICA', city: 'San Francisco', status: 'ACTIVE' },
    { id: 'store_002', name: 'New York Boutique', region: 'NORTH_AMERICA', city: 'New York', status: 'ACTIVE' },
    { id: 'store_003', name: 'London Outlet', region: 'EUROPE', city: 'London', status: 'ACTIVE' },
    { id: 'store_004', name: 'Tokyo Concept', region: 'ASIA', city: 'Tokyo', status: 'ACTIVE' },
    { id: 'store_005', name: 'Online Store', region: 'NORTH_AMERICA', city: 'San Francisco', status: 'ACTIVE' },
    { id: 'store_006', name: 'Chicago Express', region: 'NORTH_AMERICA', city: 'Chicago', status: 'INACTIVE' },
];
