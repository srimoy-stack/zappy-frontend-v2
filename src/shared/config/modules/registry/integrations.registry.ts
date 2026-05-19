import type { RegistryNode } from '../types';

export const INTEGRATIONS_REGISTRY: RegistryNode[] = [
    {
        id: 'integrations', label: 'Integrations', description: 'Third-party delivery, payment and communication providers',
        icon: 'Plug', parentId: null, moduleKey: 'integrations', level: 'module', sortOrder: 14,
        route: '/backoffice/settings/integrations', routePrefix: '/backoffice', entitlementKey: 'integrations',
        isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, sidebarGroup: 'system',
    },
    // ── Submodules
    { id: 'integrations.delivery', label: 'Delivery Platforms', parentId: 'integrations', moduleKey: 'integrations', level: 'submodule', sortOrder: 1, entitlementKey: 'integrations.delivery', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'integrations.payment', label: 'Payment Gateways', parentId: 'integrations', moduleKey: 'integrations', level: 'submodule', sortOrder: 2, entitlementKey: 'integrations.payment', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'integrations.communication', label: 'Communication Providers', parentId: 'integrations', moduleKey: 'integrations', level: 'submodule', sortOrder: 3, entitlementKey: 'integrations.communication', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    // ── Pages
    { id: 'integrations.delivery.ubereats', label: 'Uber Eats', parentId: 'integrations.delivery', moduleKey: 'integrations', level: 'page', sortOrder: 1, route: '/backoffice/settings/integrations', entitlementKey: 'integrations.delivery.ubereats', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'integrations.delivery.doordash', label: 'DoorDash', parentId: 'integrations.delivery', moduleKey: 'integrations', level: 'page', sortOrder: 2, entitlementKey: 'integrations.delivery.doordash', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'integrations.payment.stripe', label: 'Stripe', parentId: 'integrations.payment', moduleKey: 'integrations', level: 'page', sortOrder: 1, entitlementKey: 'integrations.payment.stripe', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'integrations.payment.razorpay', label: 'Razorpay', parentId: 'integrations.payment', moduleKey: 'integrations', level: 'page', sortOrder: 2, entitlementKey: 'integrations.payment.razorpay', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'integrations.communication.twilio', label: 'Twilio', parentId: 'integrations.communication', moduleKey: 'integrations', level: 'page', sortOrder: 1, entitlementKey: 'integrations.communication.twilio', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'integrations.communication.elastic-email', label: 'Elastic Email', parentId: 'integrations.communication', moduleKey: 'integrations', level: 'page', sortOrder: 2, entitlementKey: 'integrations.communication.elastic-email', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'integrations.delivery.webhooks', label: 'Webhook Logs', parentId: 'integrations.delivery', moduleKey: 'integrations', level: 'page', sortOrder: 3, entitlementKey: 'integrations.delivery.webhooks', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
];
