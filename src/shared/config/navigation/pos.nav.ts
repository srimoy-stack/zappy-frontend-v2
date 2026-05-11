import { ShoppingCart } from 'lucide-react';
import type { NavItem } from './backoffice.nav';

export const posNavigation: NavItem[] = [
    { id: 'pos-terminal', label: 'POS', href: '/pos', icon: ShoppingCart },
];
