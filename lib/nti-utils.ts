import { ArchetypeId } from './nti-scoring'

// Type definitions
export type NTIPrimary =
  | "Anchor"
  | "Connector"
  | "Hunter"
  | "Bonder"
  | "Sage"
  | "FlowMaker"
  | "Builder"
  | "Explorer";

export type NTISubtype =
  | "Anchor_A" | "Anchor_B"
  | "Connector_A" | "Connector_B"
  | "Hunter_A" | "Hunter_B"
  | "Bonder_A" | "Bonder_B"
  | "Sage_A" | "Sage_B"
  | "FlowMaker_A" | "FlowMaker_B"
  | "Builder_A" | "Builder_B"
  | "Explorer_A" | "Explorer_B";

export const SUBTYPE_TO_PRIMARY: Record<NTISubtype, NTIPrimary> = {
  Anchor_A: "Anchor",
  Anchor_B: "Anchor",
  Connector_A: "Connector",
  Connector_B: "Connector",
  Hunter_A: "Hunter",
  Hunter_B: "Hunter",
  Bonder_A: "Bonder",
  Bonder_B: "Bonder",
  Sage_A: "Sage",
  Sage_B: "Sage",
  FlowMaker_A: "FlowMaker",
  FlowMaker_B: "FlowMaker",
  Builder_A: "Builder",
  Builder_B: "Builder",
  Explorer_A: "Explorer",
  Explorer_B: "Explorer",
};

export const NTI_PRIMARY_COPY: Record<NTIPrimary, {
  title: string;
  tagline: string;
  body: string;
}> = {
  Anchor: { title: "Anchor", tagline: "Stability and presence", body: "You bring reliability and calm to friendships." },
  Connector: { title: "Connector", tagline: "Bringing people together", body: "You thrive on linking people and social flow." },
  Hunter: { title: "Hunter", tagline: "Momentum and pursuit", body: "You energize friendships through initiative." },
  Bonder: { title: "Bonder", tagline: "Depth and intimacy", body: "You create closeness and emotional safety." },
  Sage: { title: "Sage", tagline: "Perspective and meaning", body: "You orient friendships through insight." },
  FlowMaker: { title: "FlowMaker", tagline: "Ease and enjoyment", body: "You make social time feel light and natural." },
  Builder: { title: "Builder", tagline: "Structure and hosting", body: "You make friendships real through action." },
  Explorer: { title: "Explorer", tagline: "Novelty and expansion", body: "You bring new experiences into the group." },
};

/**
 * Normalizes an archetype ID to one of the 8 primary archetypes.
 * Handles both primary archetype IDs and subtype IDs (e.g., "Anchor_A" -> "Anchor").
 * 
 * @param archetypeId - The archetype ID to normalize (can be primary or subtype)
 * @returns One of the 8 primary archetype IDs
 */
export function toPrimaryType(archetypeId: string): ArchetypeId {
    // List of valid primary archetype IDs
    const primaryArchetypes: ArchetypeId[] = [
        'Anchor',
        'Connector',
        'Hunter',
        'Bonder',
        'Sage',
        'FlowMaker',
        'Builder',
        'Explorer'
    ]

    if (primaryArchetypes.includes(archetypeId as ArchetypeId)) {
        return archetypeId as ArchetypeId
    }

    const primaryPart = archetypeId.split('_')[0]
    if (primaryArchetypes.includes(primaryPart as ArchetypeId)) {
        return primaryPart as ArchetypeId
    }

    const normalized = archetypeId.charAt(0).toUpperCase() + archetypeId.slice(1)
    if (primaryArchetypes.includes(normalized as ArchetypeId)) {
        return normalized as ArchetypeId
    }

    const camelCaseMatch = primaryArchetypes.find(
        archetype => archetype.toLowerCase() === archetypeId.toLowerCase()
    )
    if (camelCaseMatch) {
        return camelCaseMatch
    }

    const partialMatch = primaryArchetypes.find(
        archetype => archetypeId.toLowerCase().includes(archetype.toLowerCase())
    )
    if (partialMatch) {
        return partialMatch
    }

    console.warn(`Could not normalize archetype ID "${archetypeId}", defaulting to "Anchor"`)
    return 'Anchor'
}
