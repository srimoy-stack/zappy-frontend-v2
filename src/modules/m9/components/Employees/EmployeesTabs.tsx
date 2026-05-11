import React from 'react';

interface EmployeesTabsProps {
    activeTab: 'employees' | 'shifts';
    onTabChange: (tab: 'employees' | 'shifts') => void;
    showEmployeesTab: boolean;
}

export const EmployeesTabs: React.FC<EmployeesTabsProps> = ({
    activeTab,
    onTabChange,
    showEmployeesTab
}) => {
    return (
        <div className="flex items-center gap-8">
            {showEmployeesTab && (
                <button
                    onClick={() => onTabChange('employees')}
                    className={`relative py-3 text-[13px] font-bold tracking-wide transition-all ${activeTab === 'employees'
                        ? 'text-black'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Employees
                    {activeTab === 'employees' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                    )}
                </button>
            )}
            <button
                onClick={() => onTabChange('shifts')}
                className={`relative py-3 text-[13px] font-bold tracking-wide transition-all ${activeTab === 'shifts'
                    ? 'text-black'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
            >
                Shifts
                {activeTab === 'shifts' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                )}
            </button>
        </div>
    );
};
