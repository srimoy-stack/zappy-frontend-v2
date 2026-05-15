'use client';

import { useRouter } from 'next/navigation';
import AlertsPage from '@/modules/ai-call-analytics/pages/AlertsPage';

export default function Page() {
    const router = useRouter();

    return (
        <AlertsPage
            onViewCall={(callId) => router.push(`/backoffice/call-analytics/calls/${callId}`)}
        />
    );
}
