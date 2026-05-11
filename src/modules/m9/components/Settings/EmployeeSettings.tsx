import React from 'react';
import { Users } from 'lucide-react';
import { SettingsSectionCard } from './SettingsSectionCard';
import { SettingsItem } from '../../types/settings';

export const EmployeeSettings: React.FC = () => {
    const items: SettingsItem[] = [
        { id: 'roles', label: 'Employee Roles', description: 'Admin, Manager, POS, KDS', route: '/backoffice/more/employees/roles' },
        { id: 'permissions', label: 'Employee Permissions', description: 'Feature-level access control', route: '/backoffice/more/employees/permissions' },
        { id: 'passcodes', label: 'Device Passcode', description: 'POS / KDS security', route: '/backoffice/more/employees/passcodes' },
    ];

    return (
        <SettingsSectionCard
            title="Employees"
            description="User access & security configuration across your organization."
            items={items}
            icon={Users}
            iconColor="text-blue-500"
        />
    );
};
