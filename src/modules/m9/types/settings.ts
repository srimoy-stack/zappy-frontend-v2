

export interface SettingsItem {
    id: string;
    label: string;
    description?: string;
    route: string;
    icon?: string;
    badge?: string;
}

export interface SettingsSection {
    id: string;
    title: string;
    description: string;
    items: SettingsItem[];
}

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    role: string;
    twoFactorEnabled: boolean;
}
