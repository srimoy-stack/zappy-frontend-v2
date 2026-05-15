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

const MOCK_DATA = [
    { item: 'Medium Veg Pizza', category: 'Pizza', quantity: 86, revenue: 2580.00, percentage: '12%' },
    { item: 'Garlic Bread', category: 'Sides', quantity: 145, revenue: 870.00, percentage: '4%' },
    { item: 'Coke 500ml', category: 'Beverages', quantity: 200, revenue: 600.00, percentage: '3%' },
    { item: 'Large Pepperoni', category: 'Pizza', quantity: 54, revenue: 1890.00, percentage: '9%' },
    { item: 'Chicken Wings (6pc)', category: 'Sides', quantity: 42, revenue: 546.00, percentage: '2.5%' },
];

const COLUMNS: ReportTableColumn[] = [
    { key: 'item', label: 'Item Name' },
    { key: 'category', label: 'Category' },
    { key: 'quantity', label: 'Qty Sold', align: 'center' },
    { key: 'revenue', label: 'Sales Amount', align: 'right', format: (v) => formatCurrency(v) },
    { key: 'percentage', label: '% of Sales', align: 'right' },
];

export const TopSellingItemsPage: React.FC = () => {
    const [filters, setFilters] = useState<ReportFilterState>({
        startDate: '',
        endDate: '',
        storeId: '',
    });

    return (
        <ReportLayout
            title="Top Selling Items"
            subtitle="Best performing products by revenue"
            dateRangeDisplay={`${filters.startDate} - ${filters.endDate}`}
        >
            <ReportFilters
                filters={filters}
                onFilterChange={setFilters}
                showStoreFilter={true}
                showChannelFilter={true}
            />

            <ReportExportActions onExport={(format) => console.log('Exporting', format)} />

            <ReportTable
                columns={COLUMNS}
                data={MOCK_DATA}
                isLoading={false}
            // Totals usually don't make sense for "Top X" lists unless it's a complete list
            />
        </ReportLayout>
    );
};
