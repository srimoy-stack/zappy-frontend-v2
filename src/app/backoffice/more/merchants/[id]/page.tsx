'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    Plus,
    Save,
    Loader2,
    Building2,
    Phone,
    Mail,
    User,
    Hash,
    Globe,
    Receipt,
    Clock,
    Power,
    Trash2,
    Edit2,
    X,
    Search,
    Filter,
    MapPin,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { merchantService } from '@/modules/m9/services/merchantService';
import { Merchant, MerchantLocation, CreateLocationPayload } from '@/modules/m9/types/merchant';

const TIMEZONES = [
    'America/Edmonton',
    'America/Vancouver',
    'America/Toronto',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'UTC',
    'Europe/London',
    'Asia/Dubai',
    'Asia/Kolkata'
];

const DAYS: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'> = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];

const PRICE_GROUPS = ['Ontario Tax', 'Alberta Tax', 'BC Tax', 'No Tax'];
const INVOICE_SCHEMES = ['Invoice', 'Receipt', 'Bill'];
const INVOICE_LAYOUTS = ['Invoice', 'Thermal', 'A4'];

export default function MerchantLocationsPage() {
    const router = useRouter();
    const params = useParams();
    const merchantId = params.id as string;

    const [merchant, setMerchant] = useState<Merchant | null>(null);
    const [locations, setLocations] = useState<MerchantLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingLocation, setEditingLocation] = useState<MerchantLocation | null>(null);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [nameFilter, setNameFilter] = useState('All');
    const [cityFilter, setCityFilter] = useState('All');
    const [stateFilter, setStateFilter] = useState('All');
    const [countryFilter, setCountryFilter] = useState('All');
    const [timezoneFilter, setTimezoneFilter] = useState('All');
    const [priceGroupFilter, setPriceGroupFilter] = useState('All');

    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Get unique values for filters
    const uniqueNames = React.useMemo(() => ['All', ...Array.from(new Set(locations.map(l => l.name)))], [locations]);
    const uniqueCities = React.useMemo(() => ['All', ...Array.from(new Set(locations.map(l => l.city)))], [locations]);
    const uniqueStates = React.useMemo(() => ['All', ...Array.from(new Set(locations.map(l => l.state)))], [locations]);
    const uniqueCountries = React.useMemo(() => ['All', ...Array.from(new Set(locations.map(l => l.country)))], [locations]);
    const uniqueTimezones = React.useMemo(() => ['All', ...Array.from(new Set(locations.map(l => l.timezone)))], [locations]);
    const uniquePriceGroups = React.useMemo(() => ['All', ...Array.from(new Set(locations.map(l => l.priceGroup)))], [locations]);

    useEffect(() => {
        loadData();
    }, [merchantId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [merchantData, locationsData] = await Promise.all([
                merchantService.getMerchantById(merchantId),
                merchantService.getLocationsByMerchant(merchantId)
            ]);
            setMerchant(merchantData);
            setLocations(locationsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLocation = async (payload: CreateLocationPayload) => {
        setSaving(true);
        try {
            await merchantService.createLocation(merchantId, payload);
            await loadData();
            setShowAddModal(false);
        } catch (error) {
            console.error('Failed to create location:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEditLocation = async (payload: Partial<MerchantLocation>) => {
        if (!editingLocation) return;

        setSaving(true);
        try {
            await merchantService.updateLocation(merchantId, editingLocation.id, payload);
            await loadData();
            setEditingLocation(null);
        } catch (error) {
            console.error('Failed to update location:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLocation = async (locationId: string) => {
        if (!confirm('Are you sure you want to delete this location?')) return;

        try {
            await merchantService.deleteLocation(merchantId, locationId);
            await loadData();
        } catch (error) {
            console.error('Failed to delete location:', error);
        }
    };

    // Filter locations
    const filteredLocations = locations.filter(location => {
        const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            location.locationId.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'All' || location.status === statusFilter;
        const matchesName = nameFilter === 'All' || location.name === nameFilter;
        const matchesCity = cityFilter === 'All' || location.city === cityFilter;
        const matchesState = stateFilter === 'All' || location.state === stateFilter;
        const matchesCountry = countryFilter === 'All' || location.country === countryFilter;
        const matchesTimezone = timezoneFilter === 'All' || location.timezone === timezoneFilter;
        const matchesPriceGroup = priceGroupFilter === 'All' || location.priceGroup === priceGroupFilter;

        return matchesSearch && matchesStatus && matchesName && matchesCity && matchesState && matchesCountry && matchesTimezone && matchesPriceGroup;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLocations = filteredLocations.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, itemsPerPage, nameFilter, cityFilter, stateFilter, countryFilter, timezoneFilter, priceGroupFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    if (!merchant) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
                <Building2 className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-xl font-black text-slate-900 mb-2">Merchant not found</h2>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto pb-24 space-y-6 animate-in fade-in duration-500 p-6">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4 border-b border-slate-200 -mx-6 px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Locations</h1>
                        <p className="text-sm text-slate-500 font-medium">Manage all your business locations</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    Add
                </button>
            </div>

            {/* Filters Section */}
            {/* Filters Section */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                {/* Top Row: Search & Status */}
                <div className="flex flex-col md:flex-row gap-5 justify-between items-center">
                    {/* Search */}
                    <div className="relative w-full max-w-sm group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search locations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-all"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        {/* Reset Filters Button */}
                        {(searchQuery || statusFilter !== 'All' || nameFilter !== 'All' || cityFilter !== 'All' || stateFilter !== 'All' || countryFilter !== 'All' || timezoneFilter !== 'All' || priceGroupFilter !== 'All') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('All');
                                    setNameFilter('All');
                                    setCityFilter('All');
                                    setStateFilter('All');
                                    setCountryFilter('All');
                                    setTimezoneFilter('All');
                                    setPriceGroupFilter('All');
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-bold transition-all whitespace-nowrap"
                            >
                                <X size={16} />
                                Clear Filters
                            </button>
                        )}

                        {/* Status Filter */}
                        <div className="flex bg-slate-50 border border-slate-200 rounded-2xl p-1.5 shrink-0">
                            {(['All', 'Active', 'Inactive'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${statusFilter === status
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Detailed Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-1 border-t border-slate-100">
                    <FilterDropdown label="Location Name" value={nameFilter} onChange={setNameFilter} options={uniqueNames} />
                    <FilterDropdown label="City" value={cityFilter} onChange={setCityFilter} options={uniqueCities} />
                    <FilterDropdown label="State" value={stateFilter} onChange={setStateFilter} options={uniqueStates} />
                    <FilterDropdown label="Country" value={countryFilter} onChange={setCountryFilter} options={uniqueCountries} />
                    <FilterDropdown label="Timezone" value={timezoneFilter} onChange={setTimezoneFilter} options={uniqueTimezones} />
                    <FilterDropdown label="Price Group" value={priceGroupFilter} onChange={setPriceGroupFilter} options={uniquePriceGroups} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Location ID</th>
                                <th className="px-4 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Landmark</th>
                                <th className="px-4 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">City</th>
                                <th className="px-4 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Zip Code</th>
                                <th className="px-4 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">State</th>
                                <th className="px-4 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Country</th>
                                <th className="px-4 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Price Group</th>
                                <th className="px-4 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Invoice Scheme</th>
                                <th className="px-4 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Invoice Layout for POS</th>
                                <th className="px-4 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Invoice Layout for Sale</th>
                                <th className="px-4 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedLocations.map((location) => (
                                <React.Fragment key={location.id}>
                                    <tr
                                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => setExpandedRow(expandedRow === location.id ? null : location.id)}
                                    >
                                        <td className="px-4 py-4 text-sm font-bold text-slate-900">
                                            <div className="flex items-center gap-2">
                                                {expandedRow === location.id ? (
                                                    <ChevronUp size={16} className="text-slate-400" />
                                                ) : (
                                                    <ChevronDown size={16} className="text-slate-400" />
                                                )}
                                                {location.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-medium text-slate-600">
                                            <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-black">{location.locationId}</span>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-medium text-slate-600">{location.landmark}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-slate-600">{location.city}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-slate-600">{location.zipCode}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-slate-600">{location.state}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-slate-600">{location.country}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-slate-600">{location.priceGroup}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-slate-600">{location.invoiceScheme}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-slate-600">{location.invoiceLayoutPOS}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-slate-600">{location.invoiceLayoutSale}</td>
                                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditingLocation(location)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteLocation(location.id)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Expanded Details Row */}
                                    {expandedRow === location.id && (
                                        <tr>
                                            <td colSpan={12} className="px-4 py-6 bg-slate-50">
                                                <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                                                    {/* Contact Information */}
                                                    <div>
                                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                            <User size={14} />
                                                            Contact Information
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                            <InfoField icon={User} label="Contact Person" value={location.contact} />
                                                            <InfoField icon={Phone} label="Phone" value={location.phone} />
                                                            <InfoField icon={Mail} label="Email" value={location.email} />
                                                            <InfoField icon={Receipt} label="Tax ID" value={location.tax} />
                                                        </div>
                                                    </div>

                                                    {/* Location Details */}
                                                    <div>
                                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                            <MapPin size={14} />
                                                            Location Details
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <InfoField icon={MapPin} label="Address" value={location.address} />
                                                            <InfoField icon={Globe} label="Timezone" value={location.timezone} />
                                                            <InfoField icon={Hash} label="Location ID" value={location.locationId} />
                                                        </div>
                                                    </div>

                                                    {/* Business Hours */}
                                                    <div>
                                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                            <Clock size={14} />
                                                            Business Hours
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {location.timings.map((timing) => (
                                                                <div
                                                                    key={timing.day}
                                                                    className={`p-3 rounded-xl border ${timing.isOpen
                                                                        ? 'bg-emerald-50 border-emerald-100'
                                                                        : 'bg-white border-slate-100 opacity-60'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-xs font-black text-slate-900">{timing.day}</span>
                                                                        <Power
                                                                            size={12}
                                                                            className={timing.isOpen ? 'text-emerald-600' : 'text-slate-300'}
                                                                        />
                                                                    </div>
                                                                    {timing.isOpen ? (
                                                                        <p className="text-[11px] font-bold text-slate-600">
                                                                            {timing.openTime} - {timing.closeTime}
                                                                        </p>
                                                                    ) : (
                                                                        <p className="text-[11px] font-bold text-slate-400">Closed</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLocations.length === 0 && locations.length > 0 && (
                    <div className="text-center py-16">
                        <Filter className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-slate-900 mb-2">No locations match your filters</h3>
                        <p className="text-sm text-slate-500 font-medium">
                            Try adjusting your search or filter criteria
                        </p>
                    </div>
                )}

                {locations.length === 0 && (
                    <div className="text-center py-16">
                        <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-slate-900 mb-2">No locations yet</h3>
                        <p className="text-sm text-slate-500 font-medium mb-6">
                            Add your first location to get started
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all"
                        >
                            <Plus size={18} />
                            Add Location
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {filteredLocations.length > 0 && (
                    <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
                        <div className="text-sm font-medium text-slate-500 mb-4 md:mb-0">
                            Showing <span className="font-bold text-slate-900">{startIndex + 1}</span> to <span className="font-bold text-slate-900">{Math.min(endIndex, filteredLocations.length)}</span> of <span className="font-bold text-slate-900">{filteredLocations.length}</span> items
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-500">Rows per page:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 py-1 pl-2 pr-6 focus:border-emerald-500 outline-none cursor-pointer"
                                >
                                    {[10, 25, 50, 100].map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:none transition-all"
                                >
                                    <ChevronLeft size={20} className="text-slate-600" />
                                </button>
                                <span className="text-sm font-bold text-slate-700 min-w-[3rem] text-center">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:none transition-all"
                                >
                                    <ChevronRight size={20} className="text-slate-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Location Modal */}
            {showAddModal && (
                <LocationModal
                    mode="add"
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddLocation}
                    saving={saving}
                />
            )}

            {/* Edit Location Modal */}
            {editingLocation && (
                <LocationModal
                    mode="edit"
                    location={editingLocation}
                    onClose={() => setEditingLocation(null)}
                    onSave={handleEditLocation}
                    saving={saving}
                />
            )}
        </div>
    );
}

// Info Field Component
function InfoField({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="p-3 bg-white rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
                <Icon size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-sm font-bold text-slate-900">{value}</p>
        </div>
    );
}

// Location Modal Component (Add/Edit)
function LocationModal({
    mode,
    location,
    onClose,
    onSave,
    saving
}: {
    mode: 'add' | 'edit';
    location?: MerchantLocation;
    onClose: () => void;
    onSave: (payload: any) => void;
    saving: boolean;
}) {
    const [formData, setFormData] = useState<CreateLocationPayload>({
        name: location?.name || '',
        landmark: location?.landmark || '',
        address: location?.address || '',
        city: location?.city || '',
        zipCode: location?.zipCode || '',
        state: location?.state || '',
        country: location?.country || '',
        contact: location?.contact || '',
        phone: location?.phone || '',
        email: location?.email || '',
        tax: location?.tax || '',
        timezone: location?.timezone || 'America/Edmonton',
        priceGroup: location?.priceGroup || 'Ontario Tax',
        invoiceScheme: location?.invoiceScheme || 'Invoice',
        invoiceLayoutPOS: location?.invoiceLayoutPOS || 'Invoice',
        invoiceLayoutSale: location?.invoiceLayoutSale || 'Invoice',
        timings: location?.timings || DAYS.map((day) => ({
            day,
            openTime: '09:00',
            closeTime: '21:00',
            isOpen: true
        }))
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const updateTiming = (day: string, field: string, value: any) => {
        setFormData({
            ...formData,
            timings: formData.timings.map((t) =>
                t.day === day ? { ...t, [field]: value } : t
            )
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">{mode === 'add' ? 'Add New Location' : 'Edit Location'}</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            {mode === 'add' ? 'Fill in the details for the new location' : 'Update the location details'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Building2 size={14} />
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InputField
                                label="Location Name"
                                icon={Building2}
                                value={formData.name}
                                onChange={(v) => setFormData({ ...formData, name: v })}
                                required
                                placeholder="e.g., Downtown Branch"
                            />
                            <InputField
                                label="Landmark"
                                icon={MapPin}
                                value={formData.landmark}
                                onChange={(v) => setFormData({ ...formData, landmark: v })}
                                required
                                placeholder="e.g., Near City Center"
                            />
                            <InputField
                                label="Address"
                                icon={MapPin}
                                value={formData.address}
                                onChange={(v) => setFormData({ ...formData, address: v })}
                                required
                                placeholder="Street address"
                            />
                            <InputField
                                label="City"
                                icon={Building2}
                                value={formData.city}
                                onChange={(v) => setFormData({ ...formData, city: v })}
                                required
                                placeholder="City"
                            />
                            <InputField
                                label="Zip Code"
                                icon={Hash}
                                value={formData.zipCode}
                                onChange={(v) => setFormData({ ...formData, zipCode: v })}
                                required
                                placeholder="Postal code"
                            />
                            <InputField
                                label="State"
                                icon={MapPin}
                                value={formData.state}
                                onChange={(v) => setFormData({ ...formData, state: v })}
                                required
                                placeholder="State/Province"
                            />
                            <InputField
                                label="Country"
                                icon={Globe}
                                value={formData.country}
                                onChange={(v) => setFormData({ ...formData, country: v })}
                                required
                                placeholder="Country"
                            />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <User size={14} />
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InputField
                                label="Contact Person"
                                icon={User}
                                value={formData.contact}
                                onChange={(v) => setFormData({ ...formData, contact: v })}
                                required
                                placeholder="Manager name"
                            />
                            <InputField
                                label="Phone"
                                icon={Phone}
                                type="tel"
                                value={formData.phone}
                                onChange={(v) => setFormData({ ...formData, phone: v })}
                                required
                                placeholder="+1 (555) 123-4567"
                            />
                            <InputField
                                label="Email"
                                icon={Mail}
                                type="email"
                                value={formData.email}
                                onChange={(v) => setFormData({ ...formData, email: v })}
                                required
                                placeholder="location@example.com"
                            />
                        </div>
                    </div>

                    {/* Location Settings */}
                    <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Globe size={14} />
                            Location Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InputField
                                label="Tax ID"
                                icon={Receipt}
                                value={formData.tax}
                                onChange={(v) => setFormData({ ...formData, tax: v })}
                                required
                                placeholder="TAX-XXX-XX"
                            />
                            <SelectField
                                label="Timezone"
                                icon={Globe}
                                value={formData.timezone}
                                options={TIMEZONES}
                                onChange={(v) => setFormData({ ...formData, timezone: v })}
                            />
                            <SelectField
                                label="Price Group"
                                icon={Receipt}
                                value={formData.priceGroup}
                                options={PRICE_GROUPS}
                                onChange={(v) => setFormData({ ...formData, priceGroup: v })}
                            />
                            <SelectField
                                label="Invoice Scheme"
                                icon={Receipt}
                                value={formData.invoiceScheme}
                                options={INVOICE_SCHEMES}
                                onChange={(v) => setFormData({ ...formData, invoiceScheme: v })}
                            />
                            <SelectField
                                label="Invoice Layout for POS"
                                icon={Receipt}
                                value={formData.invoiceLayoutPOS}
                                options={INVOICE_LAYOUTS}
                                onChange={(v) => setFormData({ ...formData, invoiceLayoutPOS: v })}
                            />
                            <SelectField
                                label="Invoice Layout for Sale"
                                icon={Receipt}
                                value={formData.invoiceLayoutSale}
                                options={INVOICE_LAYOUTS}
                                onChange={(v) => setFormData({ ...formData, invoiceLayoutSale: v })}
                            />
                        </div>
                    </div>

                    {/* Business Hours */}
                    <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock size={14} />
                            Business Hours
                        </h3>
                        <div className="space-y-3">
                            {formData.timings.map((timing) => (
                                <div
                                    key={timing.day}
                                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
                                >
                                    <span className="text-sm font-black text-slate-900 w-24">{timing.day}</span>
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            type="time"
                                            disabled={!timing.isOpen}
                                            value={timing.openTime}
                                            onChange={(e) => updateTiming(timing.day, 'openTime', e.target.value)}
                                            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:border-emerald-500 outline-none disabled:opacity-30 disabled:bg-slate-100 transition-all"
                                        />
                                        <span className="text-slate-300">-</span>
                                        <input
                                            type="time"
                                            disabled={!timing.isOpen}
                                            value={timing.closeTime}
                                            onChange={(e) => updateTiming(timing.day, 'closeTime', e.target.value)}
                                            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:border-emerald-500 outline-none disabled:opacity-30 disabled:bg-slate-100 transition-all"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateTiming(timing.day, 'isOpen', !timing.isOpen)}
                                        className={`px-4 py-2 rounded-xl border transition-all font-bold text-xs ${timing.isOpen
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                            : 'bg-slate-100 border-slate-200 text-slate-400'
                                            }`}
                                    >
                                        {timing.isOpen ? 'Open' : 'Closed'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {mode === 'add' ? 'Add Location' : 'Save Changes'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Input Field Component
function InputField({
    label,
    icon: Icon,
    value,
    onChange,
    type = 'text',
    required = false,
    placeholder = ''
}: {
    label: string;
    icon: any;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    placeholder?: string;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Icon size={12} />
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none transition-all"
            />
        </div>
    );
}

function FilterDropdown({
    label,
    value,
    onChange,
    options
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
}) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                >
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
        </div>
    );
}

// Select Field Component
function SelectField({
    label,
    icon: Icon,
    value,
    options,
    onChange
}: {
    label: string;
    icon: any;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Icon size={12} />
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none transition-all"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}
