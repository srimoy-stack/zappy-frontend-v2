'use client';

import React, { useState } from 'react';
import {
    ReportLayout,
    ReportFilters,
    ReportTable,
    ReportExportActions
} from '../../components/Reports';
import { ReportFilterState, ReportTableColumn } from '../../types/reports';
import { formatCurrency } from '@/utils';

// Mock Data
const MOCK_DATA = [
    { store: 'Flagship Store', date: '2023-11-20', orders: 154, grossSales: 4520.50, netSales: 4210.00, tax: 310.50 },
    { store: 'Flagship Store', date: '2023-11-19', orders: 142, grossSales: 4100.25, netSales: 3850.00, tax: 250.25 },
    { store: 'Flagship Store', date: '2023-11-18', orders: 165, grossSales: 4890.00, netSales: 4500.00, tax: 390.00 },
    { store: 'Warehouse Ops', date: '2023-11-20', orders: 45, grossSales: 1200.00, netSales: 1100.00, tax: 100.00 },
    { store: 'Warehouse Ops', date: '2023-11-19', orders: 38, grossSales: 980.50, netSales: 900.00, tax: 80.50 },
];

const COLUMNS: ReportTableColumn[] = [
    { key: 'date', label: 'Date' },
    { key: 'store', label: 'Store Location' },
    { key: 'orders', label: 'Total Orders', align: 'center' },
    { key: 'grossSales', label: 'Gross Sales', align: 'right', format: (v) => formatCurrency(v) },
    { key: 'tax', label: 'Tax Collected', align: 'right', format: (v) => formatCurrency(v) },
    { key: 'netSales', label: 'Net Revenue', align: 'right', format: (v) => formatCurrency(v) },
];

export const DailySalesPage: React.FC = () => {
    const [filters, setFilters] = useState<ReportFilterState>({
        startDate: '',
        endDate: '',
        storeId: '',
    });

    // Mock filtering logic
    const filteredData = MOCK_DATA.filter(row => {
        if (filters.storeId && filters.storeId === 'store-02' && row.store !== 'Warehouse Ops') return false;
        if (filters.storeId && filters.storeId === 'store-01' && row.store !== 'Flagship Store') return false;
        return true;
    });

    const totals = {
        orders: filteredData.reduce((acc, curr) => acc + curr.orders, 0),
        grossSales: filteredData.reduce((acc, curr) => acc + curr.grossSales, 0),
        tax: filteredData.reduce((acc, curr) => acc + curr.tax, 0),
        netSales: filteredData.reduce((acc, curr) => acc + curr.netSales, 0),
    };

    return (
        <ReportLayout
            title="Daily Sales Report"
            subtitle="Aggregated sales performance by day"
            dateRangeDisplay={`${filters.startDate} - ${filters.endDate}`}
        >
            <ReportFilters
                filters={filters}
                onFilterChange={setFilters}
                showStoreFilter={true}
                showChannelFilter={false}
            />

            <ReportExportActions onExport={(format) => console.log('Exporting', format)} />

            <ReportTable
                columns={COLUMNS}
                data={filteredData}
                isLoading={false}
                totals={totals}
            />
        </ReportLayout>
    );
};
