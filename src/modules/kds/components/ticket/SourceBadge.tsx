import { OrderSource } from '../../types/kds';

interface Props {
    source: OrderSource;
}

const sourceColors: Record<OrderSource, string> = {
    POS: 'bg-blue-600',
    CALL_CENTER: 'bg-purple-600',
    ONLINE: 'bg-green-600',
    UBER_DIRECT: 'bg-black',
    KIOSK: 'bg-orange-600',
    API: 'bg-gray-600',
};

export function SourceBadge({ source }: Props) {
    const isUber = source === 'UBER_DIRECT';

    return (
        <span
            className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-black text-white rounded uppercase tracking-tighter shadow-sm ${sourceColors[source]}`}
        >
            {isUber && (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
            {source === 'UBER_DIRECT' ? 'Uber Direct' : source.replace('_', ' ')}
        </span>
    );
}
