import { Building2, Users, Shield, Settings, FileText, LayoutGrid, BarChart3, MessageSquare } from 'lucide-react';
import type { NavItem } from './backoffice.nav';

/**
 * Platform Sidebar Navigation
 *
 * Structure:
 *   Dashboard       → /platform/dashboard
 *   Tenants         → /platform/tenants
 *   Platform Users  → /platform/users       (platform-scoped only)
 *   Roles           → /platform/roles
 *   Modules         → /platform/modules
 *   Audit Center    → /platform/audit
 *   Comm Services   → /platform/communication
 *   Settings        → /platform/settings
 */
export const platformNavigation: NavItem[] = [
    { id: 'platform-dashboard', label: 'Dashboard', href: '/platform/dashboard', icon: BarChart3 },
    { id: 'platform-tenants', label: 'Tenants', href: '/platform/tenants', icon: Building2 },
    { id: 'platform-users', label: 'Platform Users', href: '/platform/users', icon: Users },
    { id: 'platform-roles', label: 'Roles & Permissions', href: '/platform/roles', icon: Shield },
    { id: 'platform-modules', label: 'Modules Registry', href: '/platform/modules', icon: LayoutGrid },
    { id: 'platform-audit', label: 'Audit Center', href: '/platform/audit', icon: FileText },
    { id: 'platform-communication', label: 'Comm Services', href: '/platform/communication', icon: MessageSquare },
    { id: 'platform-settings', label: 'Platform Settings', href: '/platform/settings', icon: Settings },
];
