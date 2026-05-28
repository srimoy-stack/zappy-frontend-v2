/**
 * Icon Map — String → Lucide Component Resolution
 *
 * Single location for all icon imports.
 * Registry nodes store icon names as strings for serialization.
 * This map resolves them to actual React components at render time.
 */

import type { LucideIcon } from 'lucide-react';
import {
    ShoppingCart, TrendingUp, FileText, DollarSign, Package,
    Users, UserCircle, Globe, Monitor, Tv, Mail, Phone,
    Warehouse, Settings, Plug, Home, LayoutGrid, Shield,
    Building2, MoreHorizontal, Menu,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
    ShoppingCart,
    TrendingUp,
    FileText,
    DollarSign,
    Package,
    Users,
    UserCircle,
    Globe,
    Monitor,
    Tv,
    Mail,
    Phone,
    Warehouse,
    Settings,
    Plug,
    Home,
    LayoutGrid,
    Shield,
    Building2,
    MoreHorizontal,
    Menu,
};

/**
 * Resolve an icon string name to a Lucide component.
 * Returns Package as fallback for unknown icons.
 */
export function resolveIcon(name?: string): LucideIcon {
    if (!name) return Package;
    return ICON_MAP[name] || Package;
}

export { ICON_MAP };
