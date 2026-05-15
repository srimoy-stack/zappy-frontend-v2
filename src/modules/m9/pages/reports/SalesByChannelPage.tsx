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
    { channel: 'POS (In-Store)', orders: 450, sales: 15200.50, percentage: '68%' },
    { channel: 'Online Store', orders: 120, sales: 4800.00, percentage: '22%' },
    { channel: 'Uber Eats', orders: 45, sales: 1850.25, percentage: '8%' },
    { channel: 'Phone Orders', orders: 12, sales: 450.00, percentage: '2%' }
];

const COLUMNS: ReportTableColumn[] = [
    { key: 'channel', label: 'Sales Channel' },
    { key: 'orders', label: 'Order Count', align: 'center' },
    { key: 'sales', label: 'Total Revenue', align: 'right', format: (v) => formatCurrency(v) },
    { key: 'percentage', label: '% of Total', align: 'right' },
];

export const SalesByChannelPage: React.FC = () => {
    const [filters, setFilters] = useState<ReportFilterState>({
        startDate: '',
        endDate: '',
        storeId: '',
    });

    const totals = {
        orders: MOCK_DATA.reduce((acc, curr) => acc + curr.orders, 0),
        sales: MOCK_DATA.reduce((acc, curr) => acc + curr.sales, 0),
        percentage: '100%'
    };

    return (
        <ReportLayout
            title="Sales by Channel"
            subtitle="Performance breakdown by order source"
            dateRangeDisplay={`${filters.startDate} - ${filters.endDate}`}
        >
            <ReportFilters
                filters={filters}
                onFilterChange={setFilters}
                showStoreFilter={true}
                showChannelFilter={false} // Filter by channel logic is filtering the rows themselves, but filter props usually narrow scope. Here we show all channels.
            />

            <ReportExportActions onExport={(format) => console.log('Exporting', format)} />

            <ReportTable
                columns={COLUMNS}
                data={MOCK_DATA}
                isLoading={false}
                totals={totals}
            />
        </ReportLayout>
    );
};
