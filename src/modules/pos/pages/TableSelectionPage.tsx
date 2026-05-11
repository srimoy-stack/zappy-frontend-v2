'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePOS } from '@/modules/pos/context/POSContext';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    Check,
    Users,
    ChevronRight,
    Timer,
    ArrowRightLeft,
    Combine,
    X,
    Armchair, // Better icon for seats
    UtensilsCrossed
} from 'lucide-react';
import { POSTable, TableStatus } from '../types/pos';
import { mockPOSAreas } from '../mock/posData';
import '../styles/pos-rush.css';

export const TableSelectionPage: React.FC = () => {
    const { session, setTable, tables } = usePOS();
    const router = useRouter();

    // UI State
    const [activeAreaId, setActiveAreaId] = useState<string>('AREA1');
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [mergeMode, setMergeMode] = useState(false);
    const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);
    const [previewTable, setPreviewTable] = useState<POSTable | null>(null);

    const areas = mockPOSAreas;

    // Use tables directly from context, filtered by area
    const currentTables = useMemo(() =>
        tables.filter(t => t.areaId === activeAreaId),
        [tables, activeAreaId]);

    const selectedTable = useMemo(() =>
        tables.find(t => t.id === selectedTableId),
        [tables, selectedTableId]);

    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect');
    const openModal = searchParams.get('openModal');

    // Handle initial state if a table is already active in session
    useEffect(() => {
        if (session?.activeTable) {
            setSelectedTableId(session.activeTable.id);
            setActiveAreaId(session.activeTable.areaId);
        }
    }, [session?.activeTable]);

    const handleConfirm = () => {
        if (selectedTable && selectedTable.status === 'FREE') {
            setTable(selectedTable);
        }

        if (redirectPath) {
            const finalPath = openModal ? `${redirectPath}?openModal=true` : redirectPath;
            router.push(finalPath);
        } else {
            router.push('/pos/menu');
        }
    };

    const handleTableClick = (table: POSTable) => {
        if (mergeMode) {
            // Prevent cross-zone merges for simplicity in rush mode
            if (selectedForMerge.length > 0) {
                const firstTable = tables.find(t => t.id === selectedForMerge[0]);
                if (firstTable && firstTable.areaId !== table.areaId) {
                    // Ideally show a toast here, for now just return
                    return;
                }
            }

            if (!selectedForMerge.includes(table.id)) {
                setSelectedForMerge(prev => [...prev, table.id]);
            } else {
                setSelectedForMerge(prev => prev.filter(id => id !== table.id));
            }
            return;
        }

        if (table.status === 'OCCUPIED' || table.status === 'RESERVED') {
            setPreviewTable(table);
            setSelectedTableId(table.id);
            return;
        }

        // Quick toggle behavior
        if (table.id === selectedTableId) {
            // Deselect if already selected
            setSelectedTableId(null);
            setPreviewTable(null);
        } else {
            // Select new table and clear any previous preview
            setSelectedTableId(table.id);
            setPreviewTable(null);
        }
    };

    // Auto-clear selection when switching zones to prevent confusion
    useEffect(() => {
        setSelectedTableId(null);
        setPreviewTable(null);
        // We keep merge selection to allow cross-zone if really needed, but generally it's better to clear
        // keeping it simple for rush:
        if (!mergeMode) setSelectedForMerge([]);
    }, [activeAreaId, mergeMode]);

    // Premium Color Mapping - Defined outside loop for performance
    const statusTheme: Record<TableStatus, { bg: string; border: string; glow: string }> = {
        FREE: {
            bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            border: '#059669',
            glow: 'rgba(16, 185, 129, 0.25)'
        },
        OCCUPIED: {
            bg: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
            border: '#E11D48',
            glow: 'rgba(244, 63, 94, 0.25)'
        },
        RESERVED: {
            bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            border: '#D97706',
            glow: 'rgba(245, 158, 11, 0.25)'
        },
        CLEANING: {
            bg: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
            border: '#64748B',
            glow: 'rgba(148, 163, 184, 0.25)'
        }
    };

    // Calculate dynamic info for bottom bar
    const mergeSelectionCount = selectedForMerge.length;
    const mergeTotalSeats = useMemo(() => {
        return tables
            .filter(t => selectedForMerge.includes(t.id))
            .reduce((acc, curr) => acc + curr.seats, 0);
    }, [tables, selectedForMerge]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#F8FAFC',
            color: '#1E293B',
            overflow: 'hidden'
        }}>
            {/* TOP BAR */}
            <div style={{
                height: '70px',
                background: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                justifyContent: 'space-between',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => router.push('/pos/menu')} className="hover-scale" style={{
                        height: '40px',
                        padding: '0 16px',
                        borderRadius: '10px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        color: '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '13px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                        <ArrowLeft size={18} />
                        BACK
                    </button>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <UtensilsCrossed size={20} className="text-sky-500" /> Live Table Status
                        </h1>
                        <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0', fontWeight: 500 }}>
                            Manage seating, reservations, and merges
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', background: '#F8FAFC', padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10B981' }} />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Available</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#F43F5E' }} />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Occupied</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#F59E0B' }} />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Reserved</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* ZONE SELECTOR - Left Sidebar Style */}
                <div style={{
                    width: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#FFFFFF',
                    borderRight: '1px solid #E2E8F0',
                    flexShrink: 0
                }}>
                    <div style={{ padding: '20px', fontWeight: 800, color: '#94A3B8', fontSize: '12px', letterSpacing: '1px' }}>ZONES</div>
                    {areas.map(area => {
                        const isActive = activeAreaId === area.id;
                        return (
                            <button
                                key={area.id}
                                onClick={() => setActiveAreaId(area.id)}
                                style={{
                                    width: '100%',
                                    padding: '16px 24px',
                                    border: 'none',
                                    background: isActive ? '#F0F9FF' : 'transparent',
                                    color: isActive ? '#0284C7' : '#64748B',
                                    fontSize: '15px',
                                    fontWeight: isActive ? 700 : 500,
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    borderRight: isActive ? '3px solid #0284C7' : '3px solid transparent',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                {area.name}
                                {isActive && <ChevronRight size={16} />}
                            </button>
                        );
                    })}
                </div>

                {/* FLOOR MAP CANVAS */}
                <div style={{
                    flex: 1,
                    position: 'relative',
                    background: '#F1F5F9',
                    overflow: 'auto',
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        minHeight: '600px',
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                        border: '1px solid #E2E8F0'
                    }}>
                        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '600px' }}>
                            {currentTables.length === 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
                                    <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '50%', marginBottom: '16px' }}>
                                        <Users size={48} />
                                    </div>
                                    <p style={{ fontWeight: 700, fontSize: '18px', color: '#475569' }}>No tables in this zone</p>
                                    <p style={{ fontSize: '14px' }}>Please select a different zone or configure tables.</p>
                                </div>
                            ) : (
                                currentTables.map(table => {
                                    const isSelected = selectedTableId === table.id || selectedForMerge.includes(table.id);
                                    const currentTheme = statusTheme[table.status] || statusTheme.FREE;

                                    // Dimensions
                                    const isPercent = (table.width || 0) < 50;
                                    const widthVal = isPercent ? `${table.width}%` : `${table.width || 90}px`;
                                    const heightVal = isPercent ? `${table.height}%` : `${table.height || 90}px`;


                                    return (
                                        <div
                                            key={table.id}
                                            onClick={() => handleTableClick(table)}
                                            onDoubleClick={() => {
                                                if (table.status === 'FREE') {
                                                    setTable(table);
                                                    router.push('/pos/menu');
                                                }
                                            }}
                                            style={{
                                                position: 'absolute',
                                                left: `${table.x}%`,
                                                top: `${table.y}%`,
                                                width: widthVal,
                                                height: heightVal,
                                                background: isSelected ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' : currentTheme.bg,
                                                borderRadius: table.shape === 'circle' ? '50%' : '20px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                transform: isSelected ? 'scale(1.1) translateY(-8px)' : 'scale(1)',
                                                zIndex: isSelected ? 50 : 10,
                                                boxShadow: isSelected
                                                    ? `0 25px 35px -5px rgba(2, 132, 199, 0.4), 0 0 0 4px #FFFFFF, 0 0 0 8px #0284C7`
                                                    : `0 10px 15px -3px ${currentTheme.glow}, 0 4px 6px -4px ${currentTheme.glow}`,
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                overflow: 'hidden',
                                                padding: '12px',
                                                textAlign: 'center'
                                            }}
                                            className="active-pop"
                                        >
                                            {/* Top Highlight Gloss */}
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '45%',
                                                background: 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                                                pointerEvents: 'none'
                                            }} />

                                            <span style={{
                                                fontSize: isPercent ? '1.4vw' : '17px',
                                                fontWeight: 900,
                                                color: '#FFFFFF',
                                                lineHeight: 1.1,
                                                textShadow: '0 2px 4px rgba(0,0,0,0.15)',
                                                maxWidth: '100%',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {table.name.replace('Table ', '')}
                                            </span>

                                            <span style={{
                                                fontSize: isPercent ? '0.9vw' : '11px',
                                                fontWeight: 700,
                                                color: '#FFFFFF',
                                                opacity: 0.9,
                                                marginTop: '4px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                {table.seats} PAX
                                            </span>

                                            {/* Elegant Timer Badge */}
                                            {table.status === 'OCCUPIED' && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: 'rgba(0,0,0,0.25)',
                                                    backdropFilter: 'blur(6px)',
                                                    color: '#FFFFFF',
                                                    borderRadius: '100px',
                                                    padding: '2px 8px',
                                                    fontSize: '10px',
                                                    fontWeight: 900,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    border: '1px solid rgba(255,255,255,0.2)'
                                                }}>
                                                    <Timer size={10} strokeWidth={3} />
                                                    {table.durationMinutes || 0}m
                                                </div>
                                            )}

                                            {/* Selection Checkmark Overlay */}
                                            {isSelected && mergeMode && (
                                                <div style={{
                                                    background: '#FFFFFF',
                                                    color: '#0284C7',
                                                    borderRadius: '50%',
                                                    padding: '6px',
                                                    marginTop: '8px',
                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                                }}>
                                                    <Check size={14} strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* PREVIEW PANEL - Right Sidebar */}
                {previewTable && (
                    <div style={{
                        width: '350px',
                        background: '#FFFFFF',
                        borderLeft: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                        zIndex: 40
                    }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Table Details</h2>
                            <button onClick={() => setPreviewTable(null)} style={{ background: '#F1F5F9', border: 'none', color: '#64748B', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '16px',
                                    background: '#FEF2F2', color: '#EF4444',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '24px', fontWeight: 800
                                }}>
                                    {previewTable.name.replace('Table ', 'T')}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#0F172A' }}>{previewTable.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                                        <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '14px' }}>OCCUPIED</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Duration</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                        <Timer size={18} className="text-slate-400" />
                                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{previewTable.durationMinutes || 0}m</span>
                                    </div>
                                </div>
                                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Guests</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                        <Users size={18} className="text-slate-400" />
                                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{previewTable.seats}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>Current Order</p>
                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ color: '#64748B', fontSize: '14px', fontWeight: 500 }}>Customer</span>
                                        <span style={{ color: '#0F172A', fontSize: '14px', fontWeight: 700 }}>{previewTable.customerName || 'Walk-in'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ color: '#64748B', fontSize: '14px', fontWeight: 500 }}>Items</span>
                                        <span style={{ color: '#0F172A', fontSize: '14px', fontWeight: 700 }}>{previewTable.orderCount || 0} items</span>
                                    </div>
                                    <div style={{ height: '1px', background: '#E2E8F0', margin: '12px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <span style={{ color: '#0F172A', fontSize: '16px', fontWeight: 800 }}>Total</span>
                                        <span style={{ color: '#009F4F', fontSize: '24px', fontWeight: 900 }}>${(previewTable.totalAmount || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button style={{ height: '48px', width: '100%', borderRadius: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '14px' }}>
                                    <ArrowRightLeft size={16} /> Transfer Table
                                </button>
                                <button style={{ height: '48px', width: '100%', borderRadius: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '14px' }}>
                                    <Combine size={16} /> Merge Table
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '24px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                            <button
                                onClick={() => router.push('/pos/menu')}
                                style={{
                                    height: '56px',
                                    width: '100%',
                                    borderRadius: '12px',
                                    background: '#0284C7',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.2)'
                                }}
                            >
                                View Order
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* BOTTOM BAR - Dynamic & Context Aware */}
            <div style={{
                height: '80px',
                background: '#FFFFFF',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                padding: '0 32px',
                justifyContent: 'space-between',
                flexShrink: 0,
                boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    {mergeMode ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Merging Tables</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span style={{ fontSize: '20px', fontWeight: 900, color: '#31A4A9' }}>
                                    {mergeSelectionCount} Selected
                                </span>
                                <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
                                    ({mergeTotalSeats} Total Seats)
                                </span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    background: selectedTable ? (selectedTableId ? '#0ea5e9' : '#F1F5F9') : '#F1F5F9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: selectedTable ? 'white' : '#94A3B8'
                                }}>
                                    {selectedTable ? <Check size={24} strokeWidth={3} /> : <Armchair size={24} />}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Selection</span>
                                    <span style={{ fontSize: '20px', fontWeight: 900, color: selectedTable ? '#0F172A' : '#94A3B8' }}>
                                        {selectedTable ? selectedTable.name : 'Select a table'}
                                    </span>
                                </div>
                            </div>

                            {selectedTable && (
                                <>
                                    <div style={{ width: '1px', height: '40px', background: '#E2E8F0' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Capacity</span>
                                        <span style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>{selectedTable.seats} Persons</span>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button
                        onClick={() => {
                            setMergeMode(!mergeMode);
                            setSelectedForMerge([]);
                            setSelectedTableId(null);
                        }}
                        style={{
                            height: '52px',
                            padding: '0 24px',
                            borderRadius: '10px',
                            background: mergeMode ? '#FEF2F2' : '#FFFFFF',
                            border: mergeMode ? '1px solid #FECACA' : '1px solid #E2E8F0',
                            color: mergeMode ? '#EF4444' : '#64748B',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        {mergeMode ? <X size={18} /> : <Combine size={18} />}
                        {mergeMode ? 'Cancel Merge' : 'Merge Tables'}
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={!selectedTableId || selectedTable?.status !== 'FREE'}
                        style={{
                            height: '52px',
                            padding: '0 32px',
                            borderRadius: '10px',
                            background: selectedTableId && selectedTable?.status === 'FREE' ? '#0ea5e9' : '#E2E8F0',
                            color: 'white',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: 700,
                            cursor: selectedTableId && selectedTable?.status === 'FREE' ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.2s',
                            boxShadow: selectedTableId && selectedTable?.status === 'FREE' ? '0 4px 6px -1px rgba(14, 165, 233, 0.3)' : 'none',
                            opacity: selectedTableId && selectedTable?.status === 'FREE' ? 1 : 0.7
                        }}
                    >
                        Start Order <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <style jsx>{`
                .active-pop:active {
                    transform: scale(0.96);
                }
                .hover-scale:hover {
                    transform: scale(1.05);
                }
                /* Custom Scrollbar */
                div::-webkit-scrollbar {
                    width: 6px;
                }
                div::-webkit-scrollbar-track {
                    background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                    background-color: #CBD5E1;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

export default TableSelectionPage;
