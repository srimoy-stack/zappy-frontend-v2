// Multi-tenant audit mock data for production-grade audit center

export interface AuditEntry {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    actorRole: string;
    brandId: string;
    brandName: string;
    storeId?: string;
    storeName?: string;
    entity: string;
    entityId?: string;
    details: string;
    status: 'success' | 'failed' | 'warning';
    ip?: string;
    metadata?: Record<string, any>;
}

export interface BrandMetrics {
    id: string;
    name: string;
    slug: string;
    status: string;
    totalStores: number;
    totalUsers: number;
    activeUsers: number;
    todayOrders: number;
    todayRevenue: number;
    weekOrders: number;
    weekRevenue: number;
    lastLogin: string;
    loginCount7d: number;
    failedLogins7d: number;
}

const now = new Date();
const h = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600000).toISOString();
const d = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

export const MOCK_BRAND_METRICS: BrandMetrics[] = [
    { id: '1', name: 'Acme Pizza Co.', slug: 'acme-pizza', status: 'Operational', totalStores: 8, totalUsers: 24, activeUsers: 18, todayOrders: 142, todayRevenue: 4280.50, weekOrders: 983, weekRevenue: 29450.75, lastLogin: h(0.5), loginCount7d: 312, failedLogins7d: 3 },
    { id: '2', name: 'QuickBite Foods', slug: 'quickbite', status: 'Operational', totalStores: 3, totalUsers: 9, activeUsers: 7, todayOrders: 67, todayRevenue: 1890.25, weekOrders: 445, weekRevenue: 12650.00, lastLogin: h(1.2), loginCount7d: 148, failedLogins7d: 1 },
    { id: '3', name: 'Burger Nation', slug: 'burger-nation', status: 'Suspended', totalStores: 5, totalUsers: 15, activeUsers: 0, todayOrders: 0, todayRevenue: 0, weekOrders: 12, weekRevenue: 340.00, lastLogin: d(3), loginCount7d: 8, failedLogins7d: 12 },
    { id: '4', name: 'Taco Republic', slug: 'taco-republic', status: 'Operational', totalStores: 2, totalUsers: 6, activeUsers: 5, todayOrders: 89, todayRevenue: 2670.00, weekOrders: 612, weekRevenue: 18360.00, lastLogin: h(0.1), loginCount7d: 201, failedLogins7d: 0 },
    { id: '5', name: 'Noodle House', slug: 'noodle-house', status: 'Configuring', totalStores: 1, totalUsers: 2, activeUsers: 1, todayOrders: 0, todayRevenue: 0, weekOrders: 0, weekRevenue: 0, lastLogin: d(1), loginCount7d: 14, failedLogins7d: 0 },
];

export const MOCK_AUDIT_ENTRIES: AuditEntry[] = [
    { id: 'a1', timestamp: h(0.1), action: 'ORDER_CREATED', actor: 'POS Terminal #3', actorRole: 'Cashier', brandId: '1', brandName: 'Acme Pizza Co.', storeId: 's1', storeName: 'Downtown', entity: 'ORDER', entityId: 'ORD-4821', details: 'New order $34.50 — 3 items, dine-in', status: 'success', ip: '192.168.1.45' },
    { id: 'a2', timestamp: h(0.2), action: 'USER_LOGIN', actor: 'sarah.mgr@acme.com', actorRole: 'Store Manager', brandId: '1', brandName: 'Acme Pizza Co.', storeId: 's2', storeName: 'Uptown', entity: 'SESSION', details: 'Dashboard login via Chrome/Mac', status: 'success', ip: '74.125.24.100' },
    { id: 'a3', timestamp: h(0.3), action: 'ORDER_CREATED', actor: 'POS Terminal #1', actorRole: 'Cashier', brandId: '4', brandName: 'Taco Republic', storeId: 's8', storeName: 'Main St', entity: 'ORDER', entityId: 'ORD-1192', details: 'New order $22.75 — 2 items, takeaway', status: 'success', ip: '10.0.0.12' },
    { id: 'a4', timestamp: h(0.5), action: 'ITEM_UPDATED', actor: 'admin@quickbite.com', actorRole: 'Brand Admin', brandId: '2', brandName: 'QuickBite Foods', storeId: 's4', storeName: 'Central', entity: 'ITEM', entityId: 'ITM-392', details: 'Price changed: Classic Burger $12.99 → $13.49', status: 'success', ip: '98.45.12.7' },
    { id: 'a5', timestamp: h(0.8), action: 'USER_LOGIN_FAILED', actor: 'unknown@burger-nation.com', actorRole: 'Unknown', brandId: '3', brandName: 'Burger Nation', entity: 'SESSION', details: 'Failed login attempt — invalid credentials (attempt 5/5)', status: 'failed', ip: '185.220.101.34' },
    { id: 'a6', timestamp: h(1.0), action: 'STORE_CREATED', actor: 'Super Admin', actorRole: 'Platform Owner', brandId: '4', brandName: 'Taco Republic', entity: 'STORE', entityId: 'STR-9', details: 'New store "Airport Terminal" provisioned', status: 'success' },
    { id: 'a7', timestamp: h(1.5), action: 'MODULE_ENABLED', actor: 'Super Admin', actorRole: 'Platform Owner', brandId: '2', brandName: 'QuickBite Foods', entity: 'MODULE', entityId: 'kds', details: 'Kitchen Display System module activated', status: 'success' },
    { id: 'a8', timestamp: h(2.0), action: 'BRAND_SUSPENDED', actor: 'Super Admin', actorRole: 'Platform Owner', brandId: '3', brandName: 'Burger Nation', entity: 'TENANT', entityId: '3', details: 'Tenant suspended — billing delinquency (90+ days overdue)', status: 'warning' },
    { id: 'a9', timestamp: h(3.0), action: 'ROLE_CREATED', actor: 'admin@acme.com', actorRole: 'Brand Admin', brandId: '1', brandName: 'Acme Pizza Co.', entity: 'ROLE', entityId: 'shift-lead', details: 'Custom role "Shift Lead" created with 12 permissions', status: 'success' },
    { id: 'a10', timestamp: h(4.0), action: 'ORDER_REFUNDED', actor: 'sarah.mgr@acme.com', actorRole: 'Store Manager', brandId: '1', brandName: 'Acme Pizza Co.', storeId: 's2', storeName: 'Uptown', entity: 'ORDER', entityId: 'ORD-4790', details: 'Full refund $28.00 — customer complaint', status: 'warning' },
    { id: 'a11', timestamp: h(5.0), action: 'SETTINGS_UPDATED', actor: 'admin@taco.com', actorRole: 'Brand Admin', brandId: '4', brandName: 'Taco Republic', entity: 'SETTINGS', details: 'Payment terms changed: Net 30 → Prepaid', status: 'success' },
    { id: 'a12', timestamp: h(6.0), action: 'USER_CREATED', actor: 'Super Admin', actorRole: 'Platform Owner', brandId: '5', brandName: 'Noodle House', entity: 'USER', entityId: 'usr-42', details: 'Brand admin john@noodle.com invited via magic link', status: 'success' },
    { id: 'a13', timestamp: h(8.0), action: 'IMPERSONATION_STARTED', actor: 'Super Admin', actorRole: 'Platform Owner', brandId: '1', brandName: 'Acme Pizza Co.', entity: 'SESSION', details: 'Impersonating admin@acme.com for support ticket #4821', status: 'warning' },
    { id: 'a14', timestamp: h(8.1), action: 'IMPERSONATION_ENDED', actor: 'Super Admin', actorRole: 'Platform Owner', brandId: '1', brandName: 'Acme Pizza Co.', entity: 'SESSION', details: 'Impersonation session ended (duration: 6m 42s)', status: 'success' },
    { id: 'a15', timestamp: h(12.0), action: 'TENANT_CREATED', actor: 'Super Admin', actorRole: 'Platform Owner', brandId: '5', brandName: 'Noodle House', entity: 'TENANT', entityId: '5', details: 'New tenant onboarded — Single Store architecture', status: 'success' },
    { id: 'a16', timestamp: h(18.0), action: 'ORDER_CANCELLED', actor: 'POS Terminal #2', actorRole: 'Cashier', brandId: '2', brandName: 'QuickBite Foods', storeId: 's5', storeName: 'West End', entity: 'ORDER', entityId: 'ORD-887', details: 'Order cancelled before preparation — customer left', status: 'warning' },
    { id: 'a17', timestamp: h(24.0), action: 'GATEWAY_CONFIG_UPDATED', actor: 'Super Admin', actorRole: 'Platform Owner', brandId: '1', brandName: 'Acme Pizza Co.', entity: 'SETTINGS', details: 'Email provider changed: SMTP → SendGrid', status: 'success' },
    { id: 'a18', timestamp: h(36.0), action: 'ENTITLEMENT_CONFIGURED', actor: 'Super Admin', actorRole: 'Platform Owner', brandId: '4', brandName: 'Taco Republic', entity: 'MODULE', details: '3 new entitlement paths enabled for AI Call Analytics', status: 'success' },
];

export const ACTION_CATEGORIES: Record<string, { label: string; color: string; bg: string }> = {
    ORDER_CREATED: { label: 'Order', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    ORDER_CANCELLED: { label: 'Order', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    ORDER_REFUNDED: { label: 'Order', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
    USER_LOGIN: { label: 'Auth', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    USER_LOGIN_FAILED: { label: 'Security', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
    USER_CREATED: { label: 'User', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
    TENANT_CREATED: { label: 'Tenant', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    BRAND_SUSPENDED: { label: 'Tenant', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
    STORE_CREATED: { label: 'Store', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    MODULE_ENABLED: { label: 'Module', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
    ROLE_CREATED: { label: 'Role', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    ITEM_UPDATED: { label: 'Menu', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
    SETTINGS_UPDATED: { label: 'Config', color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
    IMPERSONATION_STARTED: { label: 'Security', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    IMPERSONATION_ENDED: { label: 'Security', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    GATEWAY_CONFIG_UPDATED: { label: 'Config', color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
    ENTITLEMENT_CONFIGURED: { label: 'Module', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
};
