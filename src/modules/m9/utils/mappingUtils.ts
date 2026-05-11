/**
 * Simple Levenshtein-based string similarity
 */
export function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;

    const width = s1.length + 1;
    const height = s2.length + 1;
    const matrix = new Int32Array(width * height);

    for (let i = 0; i < width; i++) matrix[i] = i;
    for (let j = 0; j < height; j++) matrix[j * width] = j;

    for (let j = 1; j < height; j++) {
        for (let i = 1; i < width; i++) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[j * width + i] = Math.min(
                matrix[j * width + (i - 1)]! + 1,
                matrix[(j - 1) * width + i]! + 1,
                matrix[(j - 1) * width + (i - 1)]! + indicator
            );
        }
    }

    const distance = matrix[width * height - 1]!;
    const maxLen = Math.max(s1.length, s2.length);
    return (maxLen - distance) / maxLen;
}

export function getAutoSuggestion<T extends { id: string, name: string }>(
    targetName: string,
    sourceList: T[],
    threshold = 0.7
): { suggestion: T, score: number } | null {
    let bestMatch: T | null = null;
    let highestScore = 0;

    for (const item of sourceList) {
        const score = calculateSimilarity(targetName, item.name);
        if (score > highestScore) {
            highestScore = score;
            bestMatch = item;
        }
    }

    if (bestMatch && highestScore >= threshold) {
        return { suggestion: bestMatch, score: highestScore };
    }

    return null;
}
