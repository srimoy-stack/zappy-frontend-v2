'use client';

import { useRouter } from 'next/navigation';
import CallsPage from '@/modules/ai-call-analytics/pages/CallsPage';

export default function Page() {
    const router = useRouter();

    return (
        <CallsPage
            onViewDetail={(id) => router.push(`/backoffice/call-analytics/calls/${id}`)}
        />
    );
}
