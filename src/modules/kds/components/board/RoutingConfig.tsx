'use client';

import React, { useState } from 'react';
import { Radio, LayoutGrid, CheckCircle2, ChevronLeft, Settings2, PackageSearch } from 'lucide-react';
import { useKDSStore } from '../../store/kdsStore';
import { useFilterStore } from '../../store/useFilterStore';
import { useShallow } from 'zustand/react/shallow';
import { KDSPermissionGuard } from '../security/KDSPermissionGuard';

export const RoutingConfig: React.FC = () => {
    const [isEditMode, setIsEditMode] = useState(false);
    const setViewMode = useFilterStore(state => state.setViewMode);

    const {
        enable_station_routing,
        allow_item_station_override,
        kds_stations,
        selectedStationId,
        category_station_map,
        item_station_map,
        orders,
        fulfilledOrders,
        setStationRouting,
        setAllowItemOverride,
        setStations,
        updateCategoryStationMap,
        updateItemStationMap,
        setSelectedStation,
        master_screen_view_mode,
        order_ready_rule,
        setMasterViewMode,
        setOrderReadyRule,
        station_print_mode,
        setStationPrintMode
    } = useKDSStore(useShallow((state) => ({
        enable_station_routing: state.enable_station_routing,
        allow_item_station_override: state.allow_item_station_override,
        kds_stations: state.kds_stations,
        selectedStationId: state.selectedStationId,
        category_station_map: state.category_station_map,
        item_station_map: state.item_station_map,
        orders: state.orders,
        fulfilledOrders: state.fulfilledOrders,
        setStationRouting: state.setStationRouting,
        setAllowItemOverride: state.setAllowItemOverride,
        setStations: state.setStations,
        updateCategoryStationMap: state.updateCategoryStationMap,
        updateItemStationMap: state.updateItemStationMap,
        setSelectedStation: state.setSelectedStation,
        master_screen_view_mode: state.master_screen_view_mode,
        order_ready_rule: state.order_ready_rule,
        setMasterViewMode: state.setMasterViewMode,
        setOrderReadyRule: state.setOrderReadyRule,
        station_print_mode: state.station_print_mode,
        setStationPrintMode: state.setStationPrintMode
    })));

    const getAllCategories = () => {
        const categories = new Set<string>();
        Object.values(orders).forEach(order => {
            order.items.forEach(item => {
                if (item.categoryId) categories.add(item.categoryId);
            });
        });
        fulfilledOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.categoryId) categories.add(item.categoryId);
            });
        });
        Object.keys(category_station_map).forEach(catId => categories.add(catId));
        return Array.from(categories).sort();
    };

    const categories = getAllCategories();

    const getAllItems = () => {
        const itemsList = new Set<string>();
        Object.values(orders).forEach(order => {
            order.items.forEach(item => {
                itemsList.add(item.name);
            });
        });
        fulfilledOrders.forEach(order => {
            order.items.forEach(item => {
                itemsList.add(item.name);
            });
        });
        Object.keys(item_station_map).forEach(itemName => itemsList.add(itemName));
        return Array.from(itemsList).sort();
    };

    const items = getAllItems();

    return (
        <div className="flex-1 flex flex-col bg-[#F3F4F6] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="px-8 py-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setViewMode('KANBAN')}
                        className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                    >
                        <ChevronLeft size={24} className="text-gray-900" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 uppercase">Station Routing Engine</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase mt-1">Global cluster routing & filter config</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setViewMode('KANBAN')}
                        className="px-8 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
                    >
                        Save & Apply Changes
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col p-6 lg:p-8 space-y-8">
                <KDSPermissionGuard permission="KDS_STATION_MANAGEMENT">
                    {/* Mode Toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm group hover:border-black transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                    <Radio size={24} />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-bold uppercase text-[11px]">Routing Engine</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Dynamic Item Distribution</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setStationRouting(!enable_station_routing)}
                                className={`transition-colors relative inline-flex h-6 w-11 items-center rounded-full ${enable_station_routing ? 'bg-black' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enable_station_routing ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm group hover:border-black transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                    <PackageSearch size={24} />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-bold uppercase text-[11px]">Item Overrides</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Bypass Category Logic</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAllowItemOverride(!allow_item_station_override)}
                                className={`transition-colors relative inline-flex h-6 w-11 items-center rounded-full ${allow_item_station_override ? 'bg-black' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${allow_item_station_override ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`p-6 rounded-2xl border flex items-center justify-center gap-3 font-bold uppercase text-xs transition-all ${isEditMode ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-500 hover:border-black hover:text-black'
                                }`}
                        >
                            {isEditMode ? <CheckCircle2 size={18} /> : <Settings2 size={18} />}
                            {isEditMode ? 'Finish Node Setup' : 'Configure Station Nodes'}
                        </button>
                    </div>

                    {!isEditMode ? (
                        <div className="w-full space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-gray-400 font-bold text-xs uppercase">Active Monitoring Cluster</h3>
                                <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Live Updates Active</div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <button
                                    onClick={() => setSelectedStation('ALL')}
                                    className={`group p-8 rounded-3xl border-2 text-left transition-all ${selectedStationId === 'ALL'
                                        ? 'bg-black text-white border-black shadow-2xl ring-8 ring-black/5'
                                        : 'bg-white border-gray-100 hover:border-gray-200 hover:scale-[1.02]'
                                        }`}
                                >
                                    <div className="flex flex-col gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${selectedStationId === 'ALL' ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                            <LayoutGrid size={28} />
                                        </div>
                                        <div>
                                            <span className={`block font-bold uppercase text-lg ${selectedStationId === 'ALL' ? 'text-white' : 'text-gray-900'}`}>UNIVERSAL</span>
                                            <span className={`text-xs font-bold uppercase mt-1 block ${selectedStationId === 'ALL' ? 'text-white/60' : 'text-gray-400'}`}>Stream All Units</span>
                                        </div>
                                    </div>
                                </button>
                                {kds_stations.filter(s => s.active).map((station) => (
                                    <button
                                        key={station.station_id}
                                        onClick={() => setSelectedStation(station.station_id)}
                                        className={`group p-8 rounded-3xl border-2 text-left transition-all ${selectedStationId === station.station_id
                                            ? 'bg-black text-white border-black shadow-2xl ring-8 ring-black/5'
                                            : 'bg-white border-gray-100 hover:border-gray-200 hover:scale-[1.02]'
                                            }`}
                                    >
                                        <div className="flex flex-col gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl uppercase ${selectedStationId === station.station_id ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                {station.station_name.charAt(0)}
                                            </div>
                                            <div>
                                                <span className={`block font-bold uppercase text-lg ${selectedStationId === station.station_id ? 'text-white' : 'text-gray-900'}`}>{station.station_name}</span>
                                                <span className={`text-xs font-bold uppercase mt-1 block ${selectedStationId === station.station_id ? 'text-white/60' : 'text-gray-400'}`}>Node ID: {station.station_id}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Station Deck */}
                                <div className="space-y-6">
                                    <h4 className="text-gray-400 font-bold text-xs uppercase px-2">Station Deck</h4>
                                    <div className="space-y-4 lg:max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar overscroll-contain select-none">
                                        {kds_stations.map((station, idx) => (
                                            <div key={station.station_id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-200 shadow-sm flex items-center gap-6 group hover:border-black transition-all active:scale-[0.98]">
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center font-black text-sm shrink-0">{idx + 1}</div>
                                                <input
                                                    type="text"
                                                    value={station.station_name}
                                                    onChange={(e) => {
                                                        const newStations = [...kds_stations];
                                                        newStations[idx] = { ...station, station_name: e.target.value };
                                                        setStations(newStations);
                                                    }}
                                                    className="flex-1 bg-white border border-gray-200 rounded-xl px-5 py-3 text-base text-gray-900 font-black uppercase focus:ring-4 focus:ring-black/5 outline-none transition-all"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newStations = [...kds_stations];
                                                        newStations[idx] = { ...station, active: !station.active };
                                                        setStations(newStations);
                                                    }}
                                                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase border-2 shadow-sm transition-all active:scale-90 ${station.active ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-gray-400 border-gray-200'
                                                        }`}
                                                >
                                                    {station.active ? 'ACTIVE' : 'OFF'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Mapping */}
                                <div className="space-y-6 flex flex-col">
                                    <h4 className="text-gray-400 font-bold text-xs uppercase px-2 text-center">Category Routing</h4>
                                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden lg:max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar overscroll-contain select-none">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="sticky top-0 z-10">
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Source Category</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Target Node</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {categories.map((catId) => (
                                                    <tr key={catId} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-8 py-6"><span className="text-sm font-black text-gray-900 uppercase">{catId}</span></td>
                                                        <td className="px-8 py-6 text-right">
                                                            <select
                                                                value={category_station_map[catId] || 'kitchen'}
                                                                onChange={(e) => updateCategoryStationMap({ ...category_station_map, [catId]: e.target.value })}
                                                                className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-6 py-4 text-xs font-black text-gray-900 uppercase outline-none focus:ring-4 focus:ring-black/5 transition-all cursor-pointer active:scale-95"
                                                            >
                                                                {kds_stations.filter(s => s.active).map(station => (
                                                                    <option key={station.station_id} value={station.station_id}>{station.station_name}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Item Overrides */}
                                <div className="space-y-6 flex flex-col">
                                    <h4 className="text-gray-400 font-bold text-xs uppercase px-2 text-right">SKU Overrides</h4>
                                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden lg:max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar overscroll-contain select-none">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="sticky top-0 z-10">
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">SKU Name</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Override Node</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {items.map((itemName) => (
                                                    <tr key={itemName} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-8 py-6"><span className="text-sm font-black text-gray-900 uppercase truncate max-w-[150px] block">{itemName}</span></td>
                                                        <td className="px-8 py-6 text-right">
                                                            <select
                                                                value={item_station_map[itemName] || ''}
                                                                onChange={(e) => {
                                                                    const newMap = { ...item_station_map };
                                                                    if (e.target.value === '') { delete newMap[itemName]; } else { newMap[itemName] = e.target.value; }
                                                                    updateItemStationMap(newMap);
                                                                }}
                                                                className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-6 py-4 text-xs font-black text-gray-900 uppercase outline-none focus:ring-4 focus:ring-black/5 transition-all cursor-pointer active:scale-95 text-right"
                                                            >
                                                                <option value="">INHERIT (DEFAULT)</option>
                                                                {kds_stations.filter(s => s.active).map(station => (
                                                                    <option key={station.station_id} value={station.station_id}>{station.station_name}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Engine Rules */}
                            <div className="bg-white p-12 rounded-[3.5rem] border border-gray-200 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-12">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Display Logic</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-black uppercase text-gray-900 outline-none focus:ring-2 focus:ring-black"
                                        value={master_screen_view_mode}
                                        onChange={(e) => setMasterViewMode(e.target.value as any)}
                                    >
                                        <option value="FULL_ORDER">Monitor (All Items)</option>
                                        <option value="STATION_ONLY">Line (Station Relevant)</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Ready Threshold</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-black uppercase text-gray-900 outline-none focus:ring-2 focus:ring-black"
                                        value={order_ready_rule}
                                        onChange={(e) => setOrderReadyRule(e.target.value as any)}
                                    >
                                        <option value="ALL_STATIONS_COMPLETE">Auto-Ready (Balanced)</option>
                                        <option value="EXPO_CONFIRMS_READY">Expo Verify (Manual)</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Station Printing</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-black uppercase text-gray-900 outline-none focus:ring-2 focus:ring-black"
                                        value={station_print_mode}
                                        onChange={(e) => setStationPrintMode(e.target.value as any)}
                                    >
                                        <option value="PRINT_BY_STATION">Node-Only Receipt</option>
                                        <option value="PRINT_FULL_ORDER">Consolidated Header</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </KDSPermissionGuard>
            </div>
        </div>
    );
};
