import {
    DimensionId,
    ArchetypeId,
    NTITypeConfig,
    ArchetypeConfig,
    QuestionConfig,
    DIMENSION_IDS
} from './nti-scoring';
import { NTI_PRIMARY_COPY, toPrimaryType, NTIPrimary } from './nti-utils';

export { DIMENSION_IDS };

export function getNTITypeById(archetypeId: string): NTITypeConfig | null {
    const primaryId = toPrimaryType(archetypeId as any) as NTIPrimary;
    return NTI_TYPES.find(t => t.id === primaryId) || null
}

export const ARCHETYPES: Record<ArchetypeId, ArchetypeConfig> = {
    Anchor: {
        id: 'Anchor',
        name: 'Anchor',
        tagline: NTI_PRIMARY_COPY.Anchor.tagline,
        description: NTI_PRIMARY_COPY.Anchor.body
    },
    Connector: {
        id: 'Connector',
        name: 'Connector',
        tagline: NTI_PRIMARY_COPY.Connector.tagline,
        description: NTI_PRIMARY_COPY.Connector.body
    },
    Hunter: {
        id: 'Hunter',
        name: 'Hunter',
        tagline: NTI_PRIMARY_COPY.Hunter.tagline,
        description: NTI_PRIMARY_COPY.Hunter.body
    },
    Bonder: {
        id: 'Bonder',
        name: 'Bonder',
        tagline: NTI_PRIMARY_COPY.Bonder.tagline,
        description: NTI_PRIMARY_COPY.Bonder.body
    },
    Sage: {
        id: 'Sage',
        name: 'Sage',
        tagline: NTI_PRIMARY_COPY.Sage.tagline,
        description: NTI_PRIMARY_COPY.Sage.body
    },
    FlowMaker: {
        id: 'FlowMaker',
        name: 'FlowMaker',
        tagline: NTI_PRIMARY_COPY.FlowMaker.tagline,
        description: NTI_PRIMARY_COPY.FlowMaker.body
    },
    Builder: {
        id: 'Builder',
        name: 'Builder',
        tagline: NTI_PRIMARY_COPY.Builder.tagline,
        description: NTI_PRIMARY_COPY.Builder.body
    },
    Explorer: {
        id: 'Explorer',
        name: 'Explorer',
        tagline: NTI_PRIMARY_COPY.Explorer.tagline,
        description: NTI_PRIMARY_COPY.Explorer.body
    }
};

export const NTI_TYPES: NTITypeConfig[] = [
    {
        id: 'Anchor',
        name: NTI_PRIMARY_COPY.Anchor.title,
        short_label: NTI_PRIMARY_COPY.Anchor.tagline,
        description: NTI_PRIMARY_COPY.Anchor.body,
        vector: { DA: 0.275, OX: 0.475, '5HT': 0.625, ACh: 0.33, EN: 0.25, GABA: 0.75 },
        primary_archetype: 'Anchor'
    },
    {
        id: 'Connector',
        name: NTI_PRIMARY_COPY.Connector.title,
        short_label: NTI_PRIMARY_COPY.Connector.tagline,
        description: NTI_PRIMARY_COPY.Connector.body,
        vector: { DA: 0.5, OX: 0.65, '5HT': 0.35, ACh: 0.4, EN: 0.35, GABA: 0.3 },
        primary_archetype: 'Connector'
    },
    {
        id: 'Hunter',
        name: NTI_PRIMARY_COPY.Hunter.title,
        short_label: NTI_PRIMARY_COPY.Hunter.tagline,
        description: NTI_PRIMARY_COPY.Hunter.body,
        vector: { DA: 0.75, OX: 0.25, '5HT': 0.2, ACh: 0.45, EN: 0.65, GABA: 0.2 },
        primary_archetype: 'Hunter'
    },
    {
        id: 'Bonder',
        name: NTI_PRIMARY_COPY.Bonder.title,
        short_label: NTI_PRIMARY_COPY.Bonder.tagline,
        description: NTI_PRIMARY_COPY.Bonder.body,
        vector: { DA: 0.3, OX: 0.8, '5HT': 0.6, ACh: 0.2, EN: 0.2, GABA: 0.4 },
        primary_archetype: 'Bonder'
    },
    {
        id: 'Sage',
        name: NTI_PRIMARY_COPY.Sage.title,
        short_label: NTI_PRIMARY_COPY.Sage.tagline,
        description: NTI_PRIMARY_COPY.Sage.body,
        vector: { DA: 0.4, OX: 0.35, '5HT': 0.5, ACh: 0.7, EN: 0.35, GABA: 0.3 },
        primary_archetype: 'Sage'
    },
    {
        id: 'FlowMaker',
        name: NTI_PRIMARY_COPY.FlowMaker.title,
        short_label: NTI_PRIMARY_COPY.FlowMaker.tagline,
        description: NTI_PRIMARY_COPY.FlowMaker.body,
        vector: { DA: 0.5, OX: 0.5, '5HT': 0.35, ACh: 0.525, EN: 0.6, GABA: 0.35 },
        primary_archetype: 'FlowMaker'
    },
    {
        id: 'Builder',
        name: NTI_PRIMARY_COPY.Builder.title,
        short_label: NTI_PRIMARY_COPY.Builder.tagline,
        description: NTI_PRIMARY_COPY.Builder.body,
        vector: { DA: 0.45, OX: 0.45, '5HT': 0.55, ACh: 0.5, EN: 0.35, GABA: 0.4 },
        primary_archetype: 'Builder'
    },
    {
        id: 'Explorer',
        name: NTI_PRIMARY_COPY.Explorer.title,
        short_label: NTI_PRIMARY_COPY.Explorer.tagline,
        description: NTI_PRIMARY_COPY.Explorer.body,
        vector: { DA: 0.65, OX: 0.35, '5HT': 0.2, ACh: 0.75, EN: 0.45, GABA: 0.2 },
        primary_archetype: 'Explorer'
    }
];

export const BEHAVIORAL_RULES: Record<string, Record<DimensionId, number>> = {
    INITIATE: { DA: 0.6, EN: 0.4, OX: 0, '5HT': 0, ACh: 0, GABA: 0 },
    COMPETE: { EN: 0.7, DA: 0.3, OX: 0, '5HT': 0, ACh: 0, GABA: 0 },
    CARE: { OX: 0.7, '5HT': 0.3, DA: 0, EN: 0, ACh: 0, GABA: 0 },
    REFLECT: { ACh: 0.8, '5HT': 0.2, DA: 0, EN: 0, OX: 0, GABA: 0 },
    PLAY: { ACh: 0.6, DA: 0.4, EN: 0, OX: 0, '5HT': 0, GABA: 0 },
    CALM: { GABA: 0.8, '5HT': 0.2, DA: 0, EN: 0, OX: 0, ACh: 0 },
    TRADITION: { '5HT': 0.7, GABA: 0.3, DA: 0, EN: 0, OX: 0, ACh: 0 },
    EXPLORE: { ACh: 0.6, DA: 0.4, EN: 0, OX: 0, '5HT': 0, GABA: 0 }
};

export const QUESTIONS: QuestionConfig[] = [
    {
        id: 'Q1',
        text: 'After spending time with people, I feel:',
        options: [
            {
                id: 'Q1_A', label: 'Drained', behavioral_rule: 'CALM'
            },
            {
                id: 'Q1_B', label: 'Neutral', behavioral_rule: 'CALM'
            },
            {
                id: 'Q1_C', label: 'Gently energized', behavioral_rule: 'CARE'
            },
            {
                id: 'Q1_D', label: 'Fully charged', behavioral_rule: 'INITIATE'
            }
        ]
    },
    {
        id: 'Q2',
        text: 'When a friend messages unexpectedly:',
        options: [
            {
                id: 'Q2_A', label: 'I tense up / hesitate', behavioral_rule: 'CALM'
            },
            {
                id: 'Q2_B', label: "It's fine but unplanned", behavioral_rule: 'CALM'
            },
            {
                id: 'Q2_C', label: 'Nice surprise', behavioral_rule: 'CARE'
            },
            {
                id: 'Q2_D', label: 'Exciting — I love spontaneous connection', behavioral_rule: 'INITIATE'
            }
        ]
    },
    {
        id: 'Q3',
        text: 'If a friendship feels uneven, I usually:',
        options: [
            {
                id: 'Q3_A', label: 'Stay silent', behavioral_rule: 'CALM'
            },
            {
                id: 'Q3_B', label: 'Pull back slowly', behavioral_rule: 'TRADITION'
            },
            {
                id: 'Q3_C', label: 'Name it gently', behavioral_rule: 'CARE'
            },
            {
                id: 'Q3_D', label: 'Address it early and clearly', behavioral_rule: 'INITIATE'
            }
        ]
    },
    {
        id: 'Q4',
        text: 'My ideal social rhythm is:',
        options: [
            {
                id: 'Q4_A', label: 'Monthly', behavioral_rule: 'CALM'
            },
            {
                id: 'Q4_B', label: 'A few times a month', behavioral_rule: 'TRADITION'
            },
            {
                id: 'Q4_C', label: 'Weekly', behavioral_rule: 'TRADITION'
            },
            {
                id: 'Q4_D', label: 'Multiple times a week', weights: [
                    { dimension: 'DA', weight: 0.6 },
                    { dimension: 'EN', weight: 0.4 }
                ]
            }
        ]
    },
    {
        id: 'Q5',
        text: 'Conflict with a friend feels:',
        options: [
            {
                id: 'Q5_A', label: 'Threatening — I withdraw', behavioral_rule: 'CALM'
            },
            {
                id: 'Q5_B', label: 'Unpleasant but survivable', behavioral_rule: 'TRADITION'
            },
            {
                id: 'Q5_C', label: 'Repairable', behavioral_rule: 'CARE'
            },
            {
                id: 'Q5_D', label: 'Healthy — rupture grows trust', behavioral_rule: 'COMPETE'
            }
        ]
    },
    {
        id: 'Q6',
        text: 'My closest friendships typically last:',
        options: [
            {
                id: 'Q6_A', label: 'Under 2 years', behavioral_rule: 'EXPLORE'
            },
            {
                id: 'Q6_B', label: '2–4 years', behavioral_rule: 'EXPLORE'
            },
            {
                id: 'Q6_C', label: '5–10 years', behavioral_rule: 'TRADITION'
            },
            {
                id: 'Q6_D', label: '10+ years', behavioral_rule: 'TRADITION'
            }
        ]
    },
    {
        id: 'Q7',
        text: 'In groups (4–8 people), I tend to:',
        options: [
            {
                id: 'Q7_A', label: 'Observe quietly', behavioral_rule: 'CALM'
            },
            {
                id: 'Q7_B', label: 'Speak when invited', behavioral_rule: 'TRADITION'
            },
            {
                id: 'Q7_C', label: 'Engage naturally', behavioral_rule: 'CARE'
            },
            {
                id: 'Q7_D', label: 'Lead / host / guide', behavioral_rule: 'INITIATE'
            }
        ]
    },
    {
        id: 'Q8',
        text: 'My ideal connection format is:',
        options: [
            {
                id: 'Q8_A', label: 'One-on-one depth', behavioral_rule: 'CARE'
            },
            {
                id: 'Q8_B', label: 'Solo + one light touch', behavioral_rule: 'CALM'
            },
            {
                id: 'Q8_C', label: 'Small group flow', behavioral_rule: 'PLAY'
            },
            {
                id: 'Q8_D', label: 'Large energy / activity', behavioral_rule: 'INITIATE'
            }
        ]
    },
    {
        id: 'Q9',
        text: 'When I feel low, I mostly:',
        options: [
            {
                id: 'Q9_A', label: 'Isolate', behavioral_rule: 'CALM'
            },
            {
                id: 'Q9_B', label: 'Distract alone', behavioral_rule: 'EXPLORE'
            },
            {
                id: 'Q9_C', label: 'Reach out selectively', behavioral_rule: 'CARE'
            },
            {
                id: 'Q9_D', label: 'Seek connection for regulation', behavioral_rule: 'CARE'
            }
        ]
    },
    {
        id: 'Q10',
        text: 'New people feel:',
        options: [
            {
                id: 'Q10_A', label: 'Overwhelming', behavioral_rule: 'CALM'
            },
            { id: 'Q10_B', label: 'Neutral', weights: [] },
            {
                id: 'Q10_C', label: 'Interesting', behavioral_rule: 'REFLECT'
            },
            {
                id: 'Q10_D', label: 'Energizing', behavioral_rule: 'INITIATE'
            }
        ]
    },
    {
        id: 'Q11',
        text: 'My current friendship circle is:',
        options: [
            {
                id: 'Q11_A', label: '0–1 close / 1–3 regulars', behavioral_rule: 'CALM'
            },
            {
                id: 'Q11_B', label: '1–2 close / 3–6 regulars', behavioral_rule: 'CARE'
            },
            {
                id: 'Q11_C', label: '2–4 close / 6–10 regulars', behavioral_rule: 'CARE'
            },
            {
                id: 'Q11_D', label: '4+ close / 10–20+ regulars', behavioral_rule: 'INITIATE'
            }
        ]
    },
    {
        id: 'Q12',
        text: 'My give–receive pattern is:',
        options: [
            {
                id: 'Q12_A', label: 'I over-give silently', behavioral_rule: 'CARE'
            },
            {
                id: 'Q12_B', label: 'Varies', behavioral_rule: 'TRADITION'
            },
            {
                id: 'Q12_C', label: 'Balanced overall', behavioral_rule: 'REFLECT'
            },
            {
                id: 'Q12_D', label: 'Active reciprocity tracking', behavioral_rule: 'COMPETE'
            }
        ]
    }
];
