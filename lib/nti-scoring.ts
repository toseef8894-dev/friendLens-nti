export type DimensionId = 'DA' | 'OX' | '5HT' | 'ACh' | 'EN' | 'GABA';

export const DIMENSION_IDS: DimensionId[] = ['DA', 'OX', '5HT', 'ACh', 'EN', 'GABA'];

export type ArchetypeId = 'Hunter' | 'Bonder' | 'Competitor' | 'Sage' | 'FlowMaker' | 'Anchor';

export const DIMENSION_TO_ARCHETYPE: Record<DimensionId, ArchetypeId> = {
    'DA': 'Hunter',     
    'OX': 'Bonder',     
    '5HT': 'Sage',      
    'ACh': 'Competitor',
    'EN': 'FlowMaker',  
    'GABA': 'Anchor'    
};

export interface DimensionWeight {
    dimension: DimensionId;
    weight: number;
}

export interface OptionConfig {
    id: string;
    label: string;
    weights?: DimensionWeight[];
    behavioral_rule?: string;
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
    description?: string;  
    vector: Record<DimensionId, number>; 
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
    ranked_option_ids: string[]; 
}

export interface ScoringResult {
    raw_scores: Record<DimensionId, number>;
    normalized_scores: Record<DimensionId, number>;
    primary_type_16: {
        id: string;
        name: string;
        short_label: string;
        distance: number;
    };
    primary_archetype_6: ArchetypeId;
    secondary_archetype_6: ArchetypeId;
    confidence: number;
}

export function getRankWeight(rank: number): number {
    if (rank <= 0) return 0;
    if (rank === 1) return 5;
    if (rank === 2) return 4;
    if (rank === 3) return 3;
    if (rank === 4) return 2;
    return 1; 
}

export function computeRawScores(
    questions: QuestionConfig[],
    responses: UserResponse[],
    behavioralRules?: Record<string, Record<DimensionId, number>>
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

            const rank = index + 1; 
            const rankWeight = getRankWeight(rank);

            if (option.behavioral_rule && behavioralRules && behavioralRules[option.behavioral_rule]) {
                const rule = behavioralRules[option.behavioral_rule];
                for (const [dimension, weight] of Object.entries(rule)) {
                    scores[dimension as DimensionId] += rankWeight * weight;
                }
            } else if (option.weights) {
                for (const dw of option.weights) {
                    scores[dw.dimension] += rankWeight * dw.weight;
                }
            }
        });
    }

    return scores;
}

export function normalizeScores(
    raw: Record<DimensionId, number>
): Record<DimensionId, number> {
    const maxVal = Math.max(...DIMENSION_IDS.map(d => raw[d]), 1);

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
    if (distances.length === 0) return 0;
    if (distances.length === 1) return 0.5;

    const sortedDistances = [...distances].sort((a, b) => a - b);
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    
    if (avgDistance === 0) return 0.5;
    
    const gap = sortedDistances[1] - sortedDistances[0];
    const gapRatio = gap / (avgDistance || 1);
    
    const baseConfidence = Math.min(0.9, 0.5 + (gapRatio * 0.3));
    
    return Math.max(0.3, Math.min(0.9, baseConfidence));
}

export function getTop2Archetypes(
    normalized: Record<DimensionId, number>
): { primary: ArchetypeId; secondary: ArchetypeId } {
    const sorted = DIMENSION_IDS
        .map(d => ({ dim: d, score: normalized[d] }))
        .sort((a, b) => {
            if (Math.abs(b.score - a.score) > 0.1) {
                return b.score - a.score;
            }
            return DIMENSION_IDS.indexOf(a.dim) - DIMENSION_IDS.indexOf(b.dim);
        });

    const primary = DIMENSION_TO_ARCHETYPE[sorted[0].dim];
    const secondary = sorted[1].dim !== sorted[0].dim 
        ? DIMENSION_TO_ARCHETYPE[sorted[1].dim]
        : DIMENSION_TO_ARCHETYPE[sorted[2]?.dim || sorted[0].dim];

    return { primary, secondary };
}

export function runNTIScoring(
    questions: QuestionConfig[],
    types: NTITypeConfig[],
    responses: UserResponse[],
    behavioralRules?: Record<string, Record<DimensionId, number>>
): ScoringResult {
    const raw_scores = computeRawScores(questions, responses, behavioralRules);
    const normalized_scores = normalizeScores(raw_scores);

    const distances = types.map(t => {
        const scaledVector: Record<DimensionId, number> = {
            DA: 0, OX: 0, '5HT': 0, ACh: 0, EN: 0, GABA: 0
        };
        for (const dim of DIMENSION_IDS) {
            scaledVector[dim] = (t.vector[dim] || 0) * 100;
        }
        return computeDistance(normalized_scores, scaledVector);
    });
    const { type: nearestType, distance: bestDistance } = findNearestType(normalized_scores, types);

    const confidence = computeConfidence(distances, bestDistance);

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
