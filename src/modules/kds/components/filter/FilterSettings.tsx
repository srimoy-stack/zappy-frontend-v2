'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Filter, Check, X } from 'lucide-react';
import { useFilterStore, FulfillmentFilter, SourceFilter } from '../../store/useFilterStore';
import { useKDSStore } from '../../store/kdsStore';

export const FilterSettings: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { fulfillment, source, setFulfillment, setSource, resetFilters } = useFilterStore();
    const {
        enable_station_routing,
        kds_stations,
        selectedStationId,
        setStationRouting,
        setSelectedStation
    } = useKDSStore();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fulfillmentOptions: { label: string; value: FulfillmentFilter }[] = [
        { label: 'All Types', value: 'ALL' },
        { label: 'Pickup', value: 'PICKUP' },
        { label: 'Store Delivery', value: 'STORE_DELIVERY' },
        { label: 'Uber Delivery', value: 'UBER_DIRECT_DELIVERY' },
    ];

    const sourceOptions: { label: string; value: SourceFilter }[] = [
        { label: 'All Sources', value: 'ALL' },
        { label: 'POS', value: 'POS' },
        { label: 'Call Center', value: 'CALL_CENTER' },
        { label: 'Online', value: 'ONLINE' },
        { label: 'Uber Direct', value: 'UBER_DIRECT' },
        { label: 'Kiosk', value: 'KIOSK' },
        { label: 'External API', value: 'API' },
    ];

    const stationOptions = [
        { label: 'Master View', value: 'ALL' },
        ...kds_stations.filter(s => s.active).map(s => ({
            label: s.station_name,
            value: s.station_id
        }))
    ];

    const activeFilterCount = (fulfillment !== 'ALL' ? 1 : 0) + (source !== 'ALL' ? 1 : 0) + (selectedStationId !== 'ALL' ? 1 : 0);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className={`kds-header-btn relative ${isOpen || activeFilterCount > 0 ? 'bg-slate-700' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Filter size={28} />
                <span>FILTERS</span>
                {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-700 rounded-none shadow-2xl p-6 z-[100] animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">KDS Configuration</h3>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={resetFilters}
                                className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-tighter flex items-center gap-1"
                            >
                                <X size={12} /> Clear
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Station Routing Toggle */}
                        <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/50">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Enable Station Routing</span>
                                <span className="text-[8px] text-slate-500 font-bold">Route items to specific screens</span>
                            </div>
                            <button
                                onClick={() => setStationRouting(!enable_station_routing)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${enable_station_routing ? 'bg-green-500' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enable_station_routing ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* Station Filter (CRITICAL) */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Station Screen</label>
                            <div className="grid grid-cols-1 gap-1">
                                {stationOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSelectedStation(opt.value)}
                                        className={`flex items-center justify-between px-3 py-3 rounded-none text-xs font-black transition-none ${selectedStationId === opt.value
                                            ? 'bg-amber-500 text-black'
                                            : 'text-slate-400 bg-slate-800/50 hover:bg-slate-800 hover:text-slate-200'
                                            }`}
                                    >
                                        {opt.label}
                                        {selectedStationId === opt.value && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Fulfillment Filter */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fulfillment Type</label>
                            <div className="grid grid-cols-2 gap-1">
                                {fulfillmentOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setFulfillment(opt.value)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-none text-[10px] font-bold transition-none ${fulfillment === opt.value
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-400 bg-slate-800/50 hover:bg-slate-800 hover:text-slate-200'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Source Filter */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Order Source</label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {sourceOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSource(opt.value)}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-none text-[9px] font-black transition-none uppercase ${source === opt.value
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-400 bg-slate-800/50 hover:bg-slate-800 hover:text-slate-200'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800">
                        <p className="text-[9px] text-slate-500 font-bold text-center leading-relaxed">
                            FILTERS APPLY TO THE CURRENT BOARD VIEW AND EXPO SCREEN
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
