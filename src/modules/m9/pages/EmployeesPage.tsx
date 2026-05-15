'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useTenantStore } from '@/app/providers/TenantStoreProvider';
import { Plus, Search, ChevronDown, Calendar, Download } from 'lucide-react';
import { EmployeesTabs } from '../components/Employees/EmployeesTabs';
import { EmployeesTable } from '../components/Employees/EmployeesTable';
import { ShiftsTable } from '../components/Employees/ShiftsTable';
import { UserDetailDrawer } from '../components/Employees/UserDetailDrawer';
import { ShiftEditDrawer } from '../components/Employees/ShiftEditDrawer';
import { UserFormModal } from '../components/Employees/UserFormModal';
import { DeleteConfirmationModal } from '../components/Employees/DeleteConfirmationModal';
import { Pagination } from '../components/Employees/Pagination';
import { BulkSelectionBar } from '../components/Employees/BulkSelectionBar';
import { MOCK_EMPLOYEES, MOCK_SHIFTS } from '../mock/employeesData';
import { Employee, Shift } from '../types/employees';

export const EmployeesPage: React.FC = () => {
    const { role } = useAuth();
    const { store, tenant } = useTenantStore();

    // Data State (Management for demo)
    const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
    const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);

    // Role-based logic
    const isAdmin = role === 'ADMIN';
    const isManager = role === 'STORE_MANAGER';
    const isEmployee = role === 'EMPLOYEE';
    const canSeeEmployees = isAdmin || isManager;

    // Default tab logic - Spec: EMPLOYEE maps to Shifts (My Schedule)
    const [activeTab, setActiveTab] = useState<'employees' | 'shifts'>(
        isEmployee ? 'shifts' : 'employees'
    );

    // Selection State
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

    // Pagination states
    const [employeePage, setEmployeePage] = useState(1);
    const [shiftPage, setShiftPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [storeFilter, setStoreFilter] = useState<string>('all');

    // Shift Filters
    const [shiftDateFilter, setShiftDateFilter] = useState('');
    const [shiftUserFilter, setShiftUserFilter] = useState('all');

    // Reset page on search, filter or tab change
    useEffect(() => {
        setEmployeePage(1);
        setShiftPage(1);
    }, [searchQuery, roleFilter, statusFilter, storeFilter, activeTab, shiftDateFilter, shiftUserFilter, itemsPerPage]);

    // Details/Edit states
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [selectedShiftForEdit, setSelectedShiftForEdit] = useState<Shift | null>(null);

    // Form/Modal states
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Employee | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<Employee | null>(null);

    // Effect to handle strict redirection for EMPLOYEE
    useEffect(() => {
        if (isEmployee && activeTab === 'employees') {
            setActiveTab('shifts');
        }
    }, [isEmployee, activeTab]);

    // Employee Handlers
    const handleAddUser = () => {
        setEditingUser(null);
        setIsUserFormOpen(true);
    };

    const handleEditUser = (employee: Employee) => {
        if (!isAdmin) return; // Spec: Only Admin can edit roles/details
        setEditingUser(employee);
        setIsUserFormOpen(true);
    };

    const handleDeleteClick = (employee: Employee) => {
        if (!isAdmin) return;
        setUserToDelete(employee);
        setIsDeleteConfirmOpen(true);
    };

    const handleStatusToggle = (employee: Employee) => {
        if (!isAdmin) return; // Spec: Only Admin can activate/deactivate
        setEmployees(employees.map(e =>
            e.id === employee.id
                ? { ...e, status: e.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } as Employee
                : e
        ));
    };

    const confirmDelete = () => {
        if (userToDelete) {
            setEmployees(employees.filter(e => e.id !== userToDelete.id));
            setUserToDelete(null);
            setIsDeleteConfirmOpen(false);
        }
    };

    const handleFormSubmit = (data: Partial<Employee>) => {
        if (editingUser) {
            setEmployees(employees.map(e => e.id === editingUser.id ? { ...e, ...data } as Employee : e));
        } else {
            const newUser: Employee = {
                ...data,
                id: Math.random().toString(36).substr(2, 9),
                status: 'ACTIVE',
                lastLogin: new Date().toISOString(),
                type: data.type || 'POS_USER',
            } as Employee;
            setEmployees([...employees, newUser]);
        }
        setIsUserFormOpen(false);
    };

    // Selection Handlers
    const handleSelectRow = (id: string) => {
        setSelectedEmployeeIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (ids: string[]) => {
        setSelectedEmployeeIds(ids);
    };

    // Shift Handlers
    const handleShiftSave = (updatedShift: Shift) => {
        setShifts(shifts.map(s => s.id === updatedShift.id ? updatedShift : s));
    };

    // Data Filtering logic - Employees
    const filteredEmployees = employees.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || e.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
        const matchesStore = storeFilter === 'all' || e.stores.includes(storeFilter);
        const matchesFilters = matchesSearch && matchesRole && matchesStatus && matchesStore;

        if (isManager && store) {
            return matchesFilters && e.stores.includes(store.name);
        }
        return matchesFilters;
    });

    // Data Filtering logic - Shifts
    const filteredShifts = shifts.filter(s => {
        const matchesSearch = s.userName.toLowerCase().includes(searchQuery.toLowerCase());

        // Spec: Employee sees only own shifts
        if (isEmployee) return matchesSearch && s.userId === '3';

        const matchesDate = !shiftDateFilter || s.date.includes(shiftDateFilter);
        const matchesUser = shiftUserFilter === 'all' || s.userId === shiftUserFilter;
        const matchesStoreFilter = storeFilter === 'all' || s.storeName === storeFilter;

        const matchesFilters = matchesSearch && matchesDate && matchesUser && matchesStoreFilter;

        if (isManager && store) {
            return matchesFilters && s.storeName === store.name;
        }
        return matchesFilters;
    });

    // Pagination
    const paginatedEmployees = filteredEmployees.slice(
        (employeePage - 1) * itemsPerPage,
        employeePage * itemsPerPage
    );

    const paginatedShifts = filteredShifts.slice(
        (shiftPage - 1) * itemsPerPage,
        shiftPage * itemsPerPage
    );

    return (
        <div className="max-w-[1200px] mx-auto space-y-10 pb-20 px-4 pt-8 min-h-screen">
            {/* Top Level Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {isEmployee ? 'My Schedule' : 'Users & Operations'}
                </h1>
                <div className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                    <span>{tenant?.name}</span>
                    <span className="opacity-40">/</span>
                    <span className="text-slate-900 font-semibold">{store?.name}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                <div className="flex items-center border-b border-slate-200">
                    <EmployeesTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        showEmployeesTab={canSeeEmployees}
                    />
                </div>

                {activeTab === 'employees' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold text-slate-900">User Management</h2>
                                <p className="text-[13px] text-slate-500 max-w-2xl">
                                    Consolidated unified user model. Permissions are authoritative at the backend.
                                </p>
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={handleAddUser}
                                    className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-white bg-black hover:bg-slate-800 rounded-lg transition-all shadow-lg shadow-black/10"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add New User
                                </button>
                            )}
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                            {/* Table Filters */}
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Employee List</h3>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">{filteredEmployees.length}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="relative group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search name..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-400 transition-all font-medium"
                                            />
                                        </div>

                                        <FilterSelect
                                            value={roleFilter}
                                            onChange={setRoleFilter}
                                            options={[
                                                { value: 'all', label: 'All Roles' },
                                                { value: 'ADMIN', label: 'Admin' },
                                                { value: 'STORE_MANAGER', label: 'Manager' },
                                                { value: 'EMPLOYEE', label: 'Employee' }
                                            ]}
                                        />

                                        <FilterSelect
                                            value={statusFilter}
                                            onChange={setStatusFilter}
                                            options={[
                                                { value: 'all', label: 'Any Status' },
                                                { value: 'ACTIVE', label: 'Active' },
                                                { value: 'INACTIVE', label: 'Inactive' }
                                            ]}
                                        />

                                        {isAdmin && (
                                            <FilterSelect
                                                value={storeFilter}
                                                onChange={setStoreFilter}
                                                options={[
                                                    { value: 'all', label: 'All Stores' },
                                                    ...Array.from(new Set(employees.flatMap(e => e.stores))).map(s => ({ value: s, label: s }))
                                                ]}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <EmployeesTable
                                employees={paginatedEmployees}
                                onEdit={handleEditUser}
                                onDelete={handleDeleteClick}
                                onRowClick={setSelectedEmployee}
                                onStatusToggle={handleStatusToggle}
                                selectedIds={selectedEmployeeIds}
                                onSelectRow={handleSelectRow}
                                onSelectAll={handleSelectAll}
                                isAdmin={isAdmin}
                            />

                            <Pagination
                                currentPage={employeePage}
                                totalPages={Math.ceil(filteredEmployees.length / itemsPerPage)}
                                totalItems={filteredEmployees.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setEmployeePage}
                                onItemsPerPageChange={setItemsPerPage}
                            />

                            {filteredEmployees.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400 italic text-[13px] bg-white">
                                    No records found matching filters.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'shifts' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold text-slate-900">
                                    {isEmployee ? 'Personal Shift History' : 'Operations & Accountability'}
                                </h2>
                                <p className="text-[13px] text-slate-500 max-w-2xl">
                                    Cash reconciliation values are system-generated and match M9-T7 reports.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Shift Records</h3>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">{filteredShifts.length}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        {!isEmployee && (
                                            <>
                                                <div className="relative group">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="date"
                                                        value={shiftDateFilter}
                                                        onChange={(e) => setShiftDateFilter(e.target.value)}
                                                        className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-400 transition-all font-medium text-slate-600"
                                                    />
                                                </div>

                                                <FilterSelect
                                                    value={shiftUserFilter}
                                                    onChange={setShiftUserFilter}
                                                    options={[
                                                        { value: 'all', label: 'All Users' },
                                                        ...Array.from(new Set(shifts.map(s => JSON.stringify({ id: s.userId, name: s.userName })))).map(json => {
                                                            const u = JSON.parse(json);
                                                            return { value: u.id, label: u.name };
                                                        })
                                                    ]}
                                                />
                                            </>
                                        )}
                                        {isAdmin && (
                                            <FilterSelect
                                                value={storeFilter}
                                                onChange={setStoreFilter}
                                                options={[
                                                    { value: 'all', label: 'All Stores' },
                                                    ...Array.from(new Set(employees.flatMap(e => e.stores))).map(s => ({ value: s, label: s }))
                                                ]}
                                            />
                                        )}
                                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <ShiftsTable
                                shifts={paginatedShifts}
                                onRowClick={(s) => {
                                    if (isEmployee) setSelectedShiftForEdit(s); // View Details
                                    else setSelectedShiftForEdit(s);
                                }}
                                onEdit={(s) => setSelectedShiftForEdit(s)}
                                showStore={isAdmin || isManager}
                                canEdit={isAdmin || isManager}
                            />

                            <Pagination
                                currentPage={shiftPage}
                                totalPages={Math.ceil(filteredShifts.length / itemsPerPage)}
                                totalItems={filteredShifts.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setShiftPage}
                                onItemsPerPageChange={setItemsPerPage}
                            />

                            {filteredShifts.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400 italic text-[13px] bg-white">
                                    No shift records found for this selection.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals, Drawers & Bulk Bar */}
            <BulkSelectionBar
                selectedCount={selectedEmployeeIds.length}
                onClear={() => setSelectedEmployeeIds([])}
                onGenerateReport={() => { }} // Placeholder
            />

            <UserFormModal
                isOpen={isUserFormOpen}
                onClose={() => setIsUserFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingUser}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Permanently Delete User"
                message={`This will remove ${userToDelete?.name} and all associated access. This action matches the consolidated unified user model policy.`}
            />

            <UserDetailDrawer
                employee={selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
            />

            <ShiftEditDrawer
                shift={selectedShiftForEdit}
                isOpen={!!selectedShiftForEdit}
                onClose={() => setSelectedShiftForEdit(null)}
                onSave={handleShiftSave}
                canEdit={isAdmin || (isManager && selectedShiftForEdit?.storeName === store?.name)}
            />
        </div>
    );
};

const FilterSelect = ({ value, onChange, options }: { value: string, onChange: (v: string) => void, options: { value: string, label: string }[] }) => (
    <div className="relative">
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-400 transition-all font-medium text-slate-600 appearance-none min-w-[110px]"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
);
