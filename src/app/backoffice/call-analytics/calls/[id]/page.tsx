'use client';

import { useParams, useRouter } from 'next/navigation';
import CallDetailPage from '@/modules/ai-call-analytics/pages/CallDetailPage';

export default function Page() {
    const params = useParams();
    const router = useRouter();
    const callId = params.id as string;

    return (
        <CallDetailPage
            callId={callId}
            onBack={() => router.push('/backoffice/call-analytics/calls')}
        />
    );
}
