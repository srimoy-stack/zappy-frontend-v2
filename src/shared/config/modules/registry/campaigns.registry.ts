import type { RegistryNode } from '../types';

export const CAMPAIGNS_REGISTRY: RegistryNode[] = [
    {
        id: 'email-campaigns', label: 'Email Campaigns', description: 'Campaign orchestration, templates and analytics',
        icon: 'Mail', parentId: null, moduleKey: 'email-campaigns', level: 'module', sortOrder: 10,
        route: '/backoffice/email-campaigns', routePrefix: '/backoffice', entitlementKey: 'email-campaigns',
        isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, sidebarGroup: 'marketing',
    },
    // ── Submodules
    { id: 'email-campaigns.campaigns', label: 'Campaigns', parentId: 'email-campaigns', moduleKey: 'email-campaigns', level: 'submodule', sortOrder: 1, entitlementKey: 'email-campaigns.campaigns', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'email-campaigns.templates', label: 'Templates', parentId: 'email-campaigns', moduleKey: 'email-campaigns', level: 'submodule', sortOrder: 2, entitlementKey: 'email-campaigns.templates', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'email-campaigns.segments', label: 'Segments', parentId: 'email-campaigns', moduleKey: 'email-campaigns', level: 'submodule', sortOrder: 3, entitlementKey: 'email-campaigns.segments', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'email-campaigns.analytics', label: 'Analytics', parentId: 'email-campaigns', moduleKey: 'email-campaigns', level: 'submodule', sortOrder: 4, entitlementKey: 'email-campaigns.analytics', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'email-campaigns.audit', label: 'Audit Logs', parentId: 'email-campaigns', moduleKey: 'email-campaigns', level: 'submodule', sortOrder: 5, entitlementKey: 'email-campaigns.audit', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    // ── Pages
    { id: 'email-campaigns.campaigns.dashboard', label: 'Dashboard', parentId: 'email-campaigns.campaigns', moduleKey: 'email-campaigns', level: 'page', sortOrder: 1, route: '/backoffice/email-campaigns', entitlementKey: 'email-campaigns.campaigns.dashboard', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'email-campaigns.campaigns.list', label: 'Campaign List', parentId: 'email-campaigns.campaigns', moduleKey: 'email-campaigns', level: 'page', sortOrder: 2, entitlementKey: 'email-campaigns.campaigns.list', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'email-campaigns.campaigns.create', label: 'Create Campaign', parentId: 'email-campaigns.campaigns', moduleKey: 'email-campaigns', level: 'page', sortOrder: 3, entitlementKey: 'email-campaigns.campaigns.create', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'email-campaigns.templates.manage', label: 'Templates', parentId: 'email-campaigns.templates', moduleKey: 'email-campaigns', level: 'page', sortOrder: 1, entitlementKey: 'email-campaigns.templates.manage', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'email-campaigns.segments.audience', label: 'Audience Segments', parentId: 'email-campaigns.segments', moduleKey: 'email-campaigns', level: 'page', sortOrder: 1, entitlementKey: 'email-campaigns.segments.audience', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'email-campaigns.analytics.reports', label: 'Campaign Analytics', parentId: 'email-campaigns.analytics', moduleKey: 'email-campaigns', level: 'page', sortOrder: 1, entitlementKey: 'email-campaigns.analytics.reports', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'email-campaigns.audit.delivery', label: 'Delivery Logs', parentId: 'email-campaigns.audit', moduleKey: 'email-campaigns', level: 'page', sortOrder: 1, entitlementKey: 'email-campaigns.audit.delivery', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'email-campaigns.audit.logs', label: 'Audit Logs', parentId: 'email-campaigns.audit', moduleKey: 'email-campaigns', level: 'page', sortOrder: 2, entitlementKey: 'email-campaigns.audit.logs', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
];
