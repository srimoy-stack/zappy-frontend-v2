import type { RegistryNode } from '../types';

/**
 * AI Call Analytics — Centrally Managed
 *
 * Only visibility is tenant-configurable.
 * Provider configuration is NOT tenant-configurable.
 */
export const AI_ANALYTICS_REGISTRY: RegistryNode[] = [
    {
        id: 'ai-call-analytics', label: 'AI Call Analytics', description: 'Call insights, transcripts and AI scoring',
        icon: 'Phone', parentId: null, moduleKey: 'ai-call-analytics', level: 'module', sortOrder: 11,
        route: '/backoffice/call-analytics', routePrefix: '/backoffice', entitlementKey: 'ai-call-analytics',
        isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: true, sidebarGroup: 'marketing',
    },
    // ── Submodules
    { id: 'ai-call-analytics.dashboard', label: 'Call Dashboard', parentId: 'ai-call-analytics', moduleKey: 'ai-call-analytics', level: 'submodule', sortOrder: 1, entitlementKey: 'ai-call-analytics.dashboard', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'ai-call-analytics.transcripts', label: 'Transcripts', parentId: 'ai-call-analytics', moduleKey: 'ai-call-analytics', level: 'submodule', sortOrder: 2, entitlementKey: 'ai-call-analytics.transcripts', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'ai-call-analytics.insights', label: 'Insights', parentId: 'ai-call-analytics', moduleKey: 'ai-call-analytics', level: 'submodule', sortOrder: 3, entitlementKey: 'ai-call-analytics.insights', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'ai-call-analytics.scoring', label: 'AI Scoring', parentId: 'ai-call-analytics', moduleKey: 'ai-call-analytics', level: 'submodule', sortOrder: 4, entitlementKey: 'ai-call-analytics.scoring', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    // ── Pages
    { id: 'ai-call-analytics.dashboard.main', label: 'Call Dashboard', parentId: 'ai-call-analytics.dashboard', moduleKey: 'ai-call-analytics', level: 'page', sortOrder: 1, route: '/backoffice/call-analytics', entitlementKey: 'ai-call-analytics.dashboard.main', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'ai-call-analytics.dashboard.history', label: 'Call History', parentId: 'ai-call-analytics.dashboard', moduleKey: 'ai-call-analytics', level: 'page', sortOrder: 2, entitlementKey: 'ai-call-analytics.dashboard.history', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'ai-call-analytics.transcripts.view', label: 'Call Transcript', parentId: 'ai-call-analytics.transcripts', moduleKey: 'ai-call-analytics', level: 'page', sortOrder: 1, entitlementKey: 'ai-call-analytics.transcripts.view', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'ai-call-analytics.insights.sentiment', label: 'AI Sentiment', parentId: 'ai-call-analytics.insights', moduleKey: 'ai-call-analytics', level: 'page', sortOrder: 1, entitlementKey: 'ai-call-analytics.insights.sentiment', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'ai-call-analytics.scoring.performance', label: 'AI Performance', parentId: 'ai-call-analytics.scoring', moduleKey: 'ai-call-analytics', level: 'page', sortOrder: 1, entitlementKey: 'ai-call-analytics.scoring.performance', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
    { id: 'ai-call-analytics.scoring.agents', label: 'Agent Insights', parentId: 'ai-call-analytics.scoring', moduleKey: 'ai-call-analytics', level: 'page', sortOrder: 2, entitlementKey: 'ai-call-analytics.scoring.agents', isCore: false, isSystem: false, isBeta: false, status: 'active', showInSidebar: false },
];
