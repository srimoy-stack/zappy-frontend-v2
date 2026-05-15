import React from 'react';
import { Employee } from '../../types/employees';
import { X, User as UserIcon, Shield, MapPin, Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface UserDetailDrawerProps {
    employee: Employee | null;
    onClose: () => void;
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({ employee, onClose }) => {
    if (!employee) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Employee Details</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-8">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
                                    <UserIcon className="w-8 h-8 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{employee.name}</h3>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 uppercase mt-1">
                                        ID: {employee.id}
                                    </span>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 gap-6">
                                <DetailItem
                                    icon={<Shield className="w-4 h-4" />}
                                    label="Role"
                                    value={employee.role.replace('_', ' ')}
                                    subValue={`Type: ${employee.type.replace('_', ' ')}`}
                                />
                                <DetailItem
                                    icon={<MapPin className="w-4 h-4" />}
                                    label="Assigned Stores"
                                    value={employee.stores.join(', ')}
                                />
                                <DetailItem
                                    icon={<Activity className="w-4 h-4" />}
                                    label="Account Status"
                                    value={employee.status}
                                    isStatus
                                />
                                <DetailItem
                                    icon={<Clock className="w-4 h-4" />}
                                    label="Last Session"
                                    value={format(new Date(employee.lastLogin), 'MMMM d, yyyy HH:mm')}
                                />
                            </div>

                            {/* Audit Message */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                    This is a read-only view of the employee profile. For role changes or store re-assignments,
                                    please use the "Edit Employee" function if permitted.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface DetailItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subValue?: string;
    isStatus?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value, subValue, isStatus }) => (
    <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {icon}
            {label}
        </div>
        <p className={`text-sm font-semibold ${isStatus
                ? value === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'
                : 'text-slate-700'
            }`}>
            {value}
        </p>
        {subValue && <p className="text-[11px] text-slate-400 font-medium">{subValue}</p>}
    </div>
);
