export function getSLAState(
    createdAt: string,
    prepTimeMinutes: number
): 'ON_TIME' | 'WARNING' | 'OVERDUE' {

    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const elapsedMinutes = (now - created) / 60000;

    const ratio = elapsedMinutes / prepTimeMinutes;

    if (ratio >= 1) return 'OVERDUE';
    if (ratio >= 0.75) return 'WARNING';
    return 'ON_TIME';
}

export function getRemainingSeconds(
    createdAt: string,
    prepTimeMinutes: number
): number {

    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const totalMs = prepTimeMinutes * 60000;
    const remaining = created + totalMs - now;

    return Math.max(0, Math.floor(remaining / 1000));
}
