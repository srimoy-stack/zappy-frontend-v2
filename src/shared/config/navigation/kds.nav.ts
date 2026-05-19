import { Monitor, Tv } from 'lucide-react';
import type { NavItem } from './backoffice.nav';

export const kdsNavigation: NavItem[] = [
    { id: 'kds-master', label: 'KDS Master', href: '/kds/master', icon: Monitor },
    { id: 'kds-expo', label: 'KDS Expo', href: '/kds/expo', icon: Tv },
];
