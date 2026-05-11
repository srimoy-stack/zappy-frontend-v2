export function calculateETA(
    createdAt: string,
    prepTimeMinutes: number
): string {
    const created = new Date(createdAt);
    const eta = new Date(created.getTime() + prepTimeMinutes * 60000);
    return eta.toISOString();
}
