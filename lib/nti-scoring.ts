// lib/nti-scoring.ts
// NTI v1 Scoring Engine - 6 Dimensions, Rank-based scoring

// ============ TYPES ============

export type DimensionId = 'DA' | 'OX' | '5HT' | 'ACh' | 'EN' | 'GABA';

export const DIMENSION_IDS: DimensionId[] = ['DA', 'OX', '5HT', 'ACh', 'EN', 'GABA'];

export type ArchetypeId = 'Hunter' | 'Bonder' | 'Competitor' | 'Sage' | 'FlowMaker' | 'Anchor';

// Maps each dimension to its primary archetype
export const DIMENSION_TO_ARCHETYPE: Record<DimensionId, ArchetypeId> = {
    'DA': 'Hunter',      // Dopamine → reward-seeking, goal-driven
    'OX': 'Bonder',      // Oxytocin → connection, trust
    '5HT': 'Sage',       // Serotonin → calm, wisdom, patience
    'ACh': 'Competitor', // Acetylcholine → focus, learning, competition
    'EN': 'FlowMaker',   // Endorphins → joy, flow, resilience
    'GABA': 'Anchor'     // GABA → stability, calm, grounding
};

export interface DimensionWeight {
    dimension: DimensionId;
    weight: number;
}

export interface OptionConfig {
    id: string;
    label: string;
    weights: DimensionWeight[];
}

export interface QuestionConfig {
    id: string;
    text: string;
    options: OptionConfig[];
}

export interface NTITypeConfig {
    id: string;
    name: string;
    short_label: string;
    description?: string;  // Added for client data
    vector: Record<DimensionId, number>; // 6-D template vector (0-1 scale)
    primary_archetype: ArchetypeId;
}

export interface ArchetypeConfig {
    id: ArchetypeId;
    name: string;
    tagline: string;
    description: string;
}

export interface UserResponse {
    question_id: string;
    ranked_option_ids: string[]; // rank 1 first, rank 2 second, etc.
}

export interface ScoringResult {
    // Raw scores (sum of weighted points per dimension)
    raw_scores: Record<DimensionId, number>;
    // Normalized to 0-100 scale
    normalized_scores: Record<DimensionId, number>;
    // Matched 16-type
    primary_type_16: {
        id: string;
        name: string;
        short_label: string;
        distance: number;
    };
    // Top 2 archetypes from normalized vector
    primary_archetype_6: ArchetypeId;
    secondary_archetype_6: ArchetypeId;
    // Confidence 0-1 based on relative distance
    confidence: number;
}

// ============ RANK WEIGHTS ============

// Rank 1 → 5 points, Rank 2 → 4, Rank 3 → 3, Rank 4 → 2, Rank 5+ → 1
export function getRankWeight(rank: number): number {
    if (rank <= 0) return 0;
    if (rank === 1) return 5;
    if (rank === 2) return 4;
    if (rank === 3) return 3;
    if (rank === 4) return 2;
    return 1; // rank 5+
}

// ============ SCORING FUNCTIONS ============

export function computeRawScores(
    questions: QuestionConfig[],
    responses: UserResponse[]
): Record<DimensionId, number> {
    const scores: Record<DimensionId, number> = {
        DA: 0, OX: 0, '5HT': 0, ACh: 0, EN: 0, GABA: 0
    };

    const questionMap = new Map<string, QuestionConfig>();
    for (const q of questions) {
        questionMap.set(q.id, q);
    }

    for (const response of responses) {
        const question = questionMap.get(response.question_id);
        if (!question) continue;

        const optionMap = new Map<string, OptionConfig>();
        for (const opt of question.options) {
            optionMap.set(opt.id, opt);
        }

        response.ranked_option_ids.forEach((optionId, index) => {
            const option = optionMap.get(optionId);
            if (!option) return;

            const rank = index + 1; // 0-indexed to 1-indexed
            const rankWeight = getRankWeight(rank);

            for (const dw of option.weights) {
                scores[dw.dimension] += rankWeight * dw.weight;
            }
        });
    }

    return scores;
}

export function normalizeScores(
    raw: Record<DimensionId, number>
): Record<DimensionId, number> {
    // Find max value
    const maxVal = Math.max(...DIMENSION_IDS.map(d => raw[d]), 1);

    // Normalize to 0-100
    const normalized: Record<DimensionId, number> = {
        DA: 0, OX: 0, '5HT': 0, ACh: 0, EN: 0, GABA: 0
    };

    for (const dim of DIMENSION_IDS) {
        normalized[dim] = Math.round((raw[dim] / maxVal) * 100);
    }

    return normalized;
}

export function computeDistance(
    v1: Record<DimensionId, number>,
    v2: Record<DimensionId, number>
): number {
    let sum = 0;
    for (const dim of DIMENSION_IDS) {
        const d = (v1[dim] || 0) - (v2[dim] || 0);
        sum += d * d;
    }
    return Math.sqrt(sum);
}

export function findNearestType(
    normalizedScores: Record<DimensionId, number>,
    types: NTITypeConfig[]
): { type: NTITypeConfig; distance: number } {
    let best: { type: NTITypeConfig; distance: number } | null = null;

    for (const t of types) {
        // Scale type vector from 0-1 to 0-100 for comparison
        const scaledVector: Record<DimensionId, number> = {
            DA: 0, OX: 0, '5HT': 0, ACh: 0, EN: 0, GABA: 0
        };
        for (const dim of DIMENSION_IDS) {
            scaledVector[dim] = (t.vector[dim] || 0) * 100;
        }

        const dist = computeDistance(normalizedScores, scaledVector);
        if (!best || dist < best.distance) {
            best = { type: t, distance: dist };
        }
    }

    if (!best) {
        throw new Error('No NTI types configured');
    }

    return best;
}

export function computeConfidence(
    distances: number[],
    bestDistance: number
): number {
    // Confidence = how much better is the best match vs average
    if (distances.length === 0) return 0;

    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    if (avgDistance === 0) return 1;

    // Higher confidence when best is much smaller than average
    const ratio = 1 - (bestDistance / avgDistance);
    return Math.max(0, Math.min(1, ratio + 0.5)); // Shift to 0-1 range
}

export function getTop2Archetypes(
    normalized: Record<DimensionId, number>
): { primary: ArchetypeId; secondary: ArchetypeId } {
    // Sort dimensions by score
    const sorted = DIMENSION_IDS
        .map(d => ({ dim: d, score: normalized[d] }))
        .sort((a, b) => b.score - a.score);

    const primary = DIMENSION_TO_ARCHETYPE[sorted[0].dim];
    const secondary = DIMENSION_TO_ARCHETYPE[sorted[1].dim];

    return { primary, secondary };
}

// ============ MAIN SCORING FUNCTION ============

export function runNTIScoring(
    questions: QuestionConfig[],
    types: NTITypeConfig[],
    responses: UserResponse[]
): ScoringResult {
    // 1. Compute raw scores
    const raw_scores = computeRawScores(questions, responses);

    // 2. Normalize to 0-100
    const normalized_scores = normalizeScores(raw_scores);

    // 3. Compute distances to all types
    const distances = types.map(t => computeDistance(normalized_scores, t.vector));

    // 4. Find nearest type
    const { type: nearestType, distance: bestDistance } = findNearestType(normalized_scores, types);

    // 5. Compute confidence
    const confidence = computeConfidence(distances, bestDistance);

    // 6. Get top 2 archetypes from normalized vector
    const { primary, secondary } = getTop2Archetypes(normalized_scores);

    return {
        raw_scores,
        normalized_scores,
        primary_type_16: {
            id: nearestType.id,
            name: nearestType.name,
            short_label: nearestType.short_label,
            distance: bestDistance
        },
        primary_archetype_6: primary,
        secondary_archetype_6: secondary,
        confidence
    };
}
