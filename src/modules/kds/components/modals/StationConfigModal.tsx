'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Radio, LayoutGrid, CheckCircle2, Settings2, PackageSearch } from 'lucide-react';
import { useKDSStore } from '../../store/kdsStore';
import { useShallow } from 'zustand/react/shallow';

interface StationConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StationConfigModal: React.FC<StationConfigModalProps> = ({ isOpen, onClose }) => {
    const [mounted, setMounted] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
        sound_scope,
        setSoundScope
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
        sound_scope: state.sound_scope,
        setSoundScope: state.setSoundScope
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

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-6xl bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Station Routing Engine</h2>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-none">Global cluster routing & filter config</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                    {/* Top Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Radio size={18} className={enable_station_routing ? 'text-emerald-500' : 'text-gray-400'} />
                                <h3 className="text-gray-900 font-black uppercase text-[10px] tracking-wide">Routing Engine</h3>
                            </div>
                            <button
                                onClick={() => setStationRouting(!enable_station_routing)}
                                className={`transition-colors relative inline-flex h-5 w-9 items-center rounded-full ${enable_station_routing ? 'bg-black' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${enable_station_routing ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <PackageSearch size={18} className={allow_item_station_override ? 'text-blue-500' : 'text-gray-400'} />
                                <h3 className="text-gray-900 font-black uppercase text-[10px] tracking-wide">Item Overrides</h3>
                            </div>
                            <button
                                onClick={() => setAllowItemOverride(!allow_item_station_override)}
                                className={`transition-colors relative inline-flex h-5 w-9 items-center rounded-full ${allow_item_station_override ? 'bg-black' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${allow_item_station_override ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`p-4 rounded-lg border flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all ${isEditMode ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-900'}`}
                        >
                            {isEditMode ? <CheckCircle2 size={14} /> : <Settings2 size={14} />}
                            {isEditMode ? 'Finish Setup' : 'Configure Stations'}
                        </button>
                    </div>

                    {!isEditMode ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Active Monitoring Node</h3>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <button
                                    onClick={() => setSelectedStation('ALL')}
                                    className={`group p-6 rounded-xl border-2 text-left transition-all ${selectedStationId === 'ALL' ? 'bg-black text-white border-black shadow-xl ring-4 ring-black/5' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedStationId === 'ALL' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <LayoutGrid size={20} />
                                        </div>
                                        <div>
                                            <span className={`block font-black uppercase text-sm tracking-tight ${selectedStationId === 'ALL' ? 'text-white' : 'text-gray-900'}`}>UNIVERSAL</span>
                                            <span className={`text-[9px] font-bold uppercase mt-1 block ${selectedStationId === 'ALL' ? 'text-white/60' : 'text-gray-400'}`}>Full Cluster Stream</span>
                                        </div>
                                    </div>
                                </button>
                                {kds_stations.filter(s => s.active).map((station) => (
                                    <button
                                        key={station.station_id}
                                        onClick={() => setSelectedStation(station.station_id)}
                                        className={`group p-6 rounded-xl border-2 text-left transition-all ${selectedStationId === station.station_id ? 'bg-black text-white border-black shadow-xl ring-4 ring-black/5' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className="flex flex-col gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm uppercase ${selectedStationId === station.station_id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                {station.station_name.charAt(0)}
                                            </div>
                                            <div>
                                                <span className={`block font-black uppercase text-sm tracking-tight ${selectedStationId === station.station_id ? 'text-white' : 'text-gray-900'}`}>{station.station_name}</span>
                                                <span className={`text-[9px] font-bold uppercase mt-1 block ${selectedStationId === station.station_id ? 'text-white/60' : 'text-gray-400'}`}>Node ID: {station.station_id}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Station List */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-2">
                                        <h4 className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Station Deck</h4>
                                    </div>
                                    <div className="space-y-3">
                                        {kds_stations.map((station, idx) => (
                                            <div key={station.station_id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        value={station.station_name}
                                                        onChange={(e) => {
                                                            const newStations = [...kds_stations];
                                                            newStations[idx] = { ...station, station_name: e.target.value };
                                                            setStations(newStations);
                                                        }}
                                                        className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-[11px] text-gray-900 font-black uppercase focus:ring-1 focus:ring-black outline-none"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newStations = [...kds_stations];
                                                            newStations[idx] = { ...station, active: !station.active };
                                                            setStations(newStations);
                                                        }}
                                                        className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest border transition-all ${station.active ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-gray-400 border-gray-200'}`}
                                                    >
                                                        {station.active ? 'ON' : 'OFF'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Mapping */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-2">
                                        <h4 className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Category Routing</h4>
                                    </div>
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="px-4 py-3 text-[9px] font-black uppercase text-gray-400 tracking-wider">Source</th>
                                                    <th className="px-4 py-3 text-[9px] font-black uppercase text-gray-400 tracking-wider">Target</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {categories.map((catId) => (
                                                    <tr key={catId} className="hover:bg-gray-50/50">
                                                        <td className="px-4 py-2.5"><span className="text-[10px] font-black text-gray-900 uppercase">{catId}</span></td>
                                                        <td className="px-4 py-2.5">
                                                            <select
                                                                value={category_station_map[catId] || 'kitchen'}
                                                                onChange={(e) => updateCategoryStationMap({ ...category_station_map, [catId]: e.target.value })}
                                                                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-[10px] font-black text-gray-900 uppercase focus:ring-1 focus:ring-black outline-none"
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

                                {/* Item Mapping */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-2">
                                        <h4 className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Item Overrides</h4>
                                    </div>
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-h-[300px] overflow-y-auto scrollbar-hide">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="px-4 py-3 text-[9px] font-black uppercase text-gray-400 tracking-wider">SKU</th>
                                                    <th className="px-4 py-3 text-[9px] font-black uppercase text-gray-400 tracking-wider">Target</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {items.map((itemName) => (
                                                    <tr key={itemName} className="hover:bg-gray-50/50">
                                                        <td className="px-4 py-2.5"><span className="text-[10px] font-black text-gray-900 uppercase truncate max-w-[100px] block">{itemName}</span></td>
                                                        <td className="px-4 py-2.5">
                                                            <select
                                                                value={item_station_map[itemName] || ''}
                                                                onChange={(e) => {
                                                                    const newMap = { ...item_station_map };
                                                                    if (e.target.value === '') { delete newMap[itemName]; } else { newMap[itemName] = e.target.value; }
                                                                    updateItemStationMap(newMap);
                                                                }}
                                                                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-[10px] font-black text-gray-900 uppercase focus:ring-1 focus:ring-black outline-none"
                                                            >
                                                                <option value="">DEFAULT</option>
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
                        </div>
                    )}

                    {/* Advanced Rules */}
                    <div className="bg-black text-white p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Display Mode', value: master_screen_view_mode, options: [['FULL_ORDER', 'Monitor Mode (All Items)'], ['STATION_ONLY', 'Line Mode (Station Only)']], onChange: setMasterViewMode },
                            { label: 'Completion Rule', value: order_ready_rule, options: [['ALL_STATIONS_COMPLETE', 'Auto-Ready (All Done)'], ['EXPO_CONFIRMS_READY', 'Expo Gate (Manual)']], onChange: setOrderReadyRule },
                            { label: 'Alert Scope', value: sound_scope, options: [['STATION_ONLY', 'Filtered Alerts'], ['ALL_DEVICES', 'Global Alerts']], onChange: setSoundScope },
                        ].map((rule, idx) => (
                            <div key={idx} className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-white/40 tracking-widest">{rule.label}</label>
                                <select
                                    className="w-full bg-white/10 border border-white/10 rounded px-4 py-2 text-[10px] font-black uppercase text-white outline-none"
                                    value={rule.value}
                                    onChange={(e) => (rule.onChange as (val: any) => void)(e.target.value)}
                                >
                                    {rule.options.map(([val, lbl]) => (
                                        <option key={val} value={val} className="text-black">{lbl}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-200 text-gray-900 font-black uppercase text-[10px] tracking-widest rounded hover:bg-gray-50 transition-colors">
                        Close
                    </button>
                    <button onClick={onClose} className="px-8 py-2 bg-black text-white font-black uppercase text-[10px] tracking-widest rounded hover:bg-gray-800 transition-all shadow-xl active:scale-95">
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
