// src/scoring.ts
// FriendLens V1 — config-driven scoring engine
// Pseudocode/TypeScript-style implementation for Toseef

export type DimensionId = string;
export type QuestionId = string;
export type OptionId   = string;
export type MicrotypeId = string;
export type ArchetypeId = string;

export interface DimensionWeight {
  dimension_id: DimensionId;
  weight: number;
}

export interface OptionConfig {
  id: OptionId;
  label: string;
  dimension_weights: DimensionWeight[];
}

export interface QuestionConfig {
  question_id: QuestionId;
  text: string;
  options: OptionConfig[];
}

export interface AssessmentConfig {
  assessment_id: string;
  rank_weights: number[];          // e.g. [1.0, 0.7, 0.4, 0.2, 0.1]
  questions: QuestionConfig[];
}

export interface MicrotypeConfig {
  id: MicrotypeId;
  archetype_id: ArchetypeId;
  centroid: Record<DimensionId, number>;
  tags: string[];
}

export interface ArchetypeConfig {
  id: ArchetypeId;
  name: string;
  short_label: string;
  description: string;
}

export interface UserResponseForQuestion {
  question_id: QuestionId;
  ranked_option_ids: OptionId[];   // selected options, in order of strength
}

export interface UserAssessmentResponses {
  assessment_id: string;
  responses: UserResponseForQuestion[];
}

export interface ScoringResult {
  assessment_id: string;
  user_vector: Record<DimensionId, number>;
  microtype_id: MicrotypeId;
  archetype_id: ArchetypeId;
  microtype_tags: string[];
  microtype_distance: number;
}

function scoreAssessment(
  assessmentConfig: AssessmentConfig,
  userResponses: UserAssessmentResponses
): Record<DimensionId, number> {
  const userVector: Record<DimensionId, number> = {};
  const weightSum: Record<DimensionId, number> = {};

  const addToDim = (dimId: DimensionId, value: number) => {
    if (!(dimId in userVector)) userVector[dimId] = 0;
    if (!(dimId in weightSum))  weightSum[dimId]  = 0;
    userVector[dimId] += value;
    weightSum[dimId]  += Math.abs(value);
  };

  const questionMap = new Map<QuestionId, QuestionConfig>();
  for (const q of assessmentConfig.questions) {
    questionMap.set(q.question_id, q);
  }

  const rankWeights = assessmentConfig.rank_weights;

  for (const resp of userResponses.responses) {
    const question = questionMap.get(resp.question_id);
    if (!question) continue;

    const optionMap = new Map<OptionId, OptionConfig>();
    for (const opt of question.options) {
      optionMap.set(opt.id, opt);
    }

    resp.ranked_option_ids.forEach((optionId, rankIndex) => {
      const opt = optionMap.get(optionId);
      if (!opt) return;

      const rankWeight = rankWeights[rankIndex] ?? 0;
      for (const dw of opt.dimension_weights) {
        const contribution = rankWeight * dw.weight;
        addToDim(dw.dimension_id, contribution);
      }
    });
  }

  // normalize
  for (const dimId in userVector) {
    const sum = weightSum[dimId] || 1;
    userVector[dimId] = userVector[dimId] / sum;
  }

  return userVector;
}

function distanceSquared(
  v1: Record<DimensionId, number>,
  v2: Record<DimensionId, number>,
  dimensionIds: DimensionId[]
): number {
  let sum = 0;
  for (const dimId of dimensionIds) {
    const a = v1[dimId] ?? 0;
    const b = v2[dimId] ?? 0;
    const d = a - b;
    sum += d * d;
  }
  return sum;
}

function mapToMicrotype(
  userVector: Record<DimensionId, number>,
  microtypes: MicrotypeConfig[],
  dimensionIds: DimensionId[]
) {
  let best: {
    microtype_id: MicrotypeId;
    archetype_id: ArchetypeId;
    distance: number;
    centroid: Record<DimensionId, number>;
    tags: string[];
  } | null = null;

  for (const mt of microtypes) {
    const dist2 = distanceSquared(userVector, mt.centroid, dimensionIds);
    if (!best || dist2 < best.distance) {
      best = {
        microtype_id: mt.id,
        archetype_id: mt.archetype_id,
        distance: dist2,
        centroid: mt.centroid,
        tags: mt.tags
      };
    }
  }

  if (!best) {
    throw new Error("No microtypes configured");
  }
  return best;
}

export function runFriendLensScoring(
  assessmentConfig: AssessmentConfig,
  microtypes: MicrotypeConfig[],
  dimensionIds: DimensionId[],
  userResponses: UserAssessmentResponses
): ScoringResult {
  const userVector = scoreAssessment(assessmentConfig, userResponses);
  const mt = mapToMicrotype(userVector, microtypes, dimensionIds);

  return {
    assessment_id: assessmentConfig.assessment_id,
    user_vector: userVector,
    microtype_id: mt.microtype_id,
    archetype_id: mt.archetype_id,
    microtype_tags: mt.tags,
    microtype_distance: mt.distance
  };
}
