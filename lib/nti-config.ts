import {
    DimensionId,
    ArchetypeId,
    NTITypeConfig,
    ArchetypeConfig,
    QuestionConfig,
    DIMENSION_IDS
} from './nti-scoring';

export { DIMENSION_IDS };

export const ARCHETYPES: Record<ArchetypeId, ArchetypeConfig> = {
    Hunter: {
        id: 'Hunter',
        name: 'Hunter',
        tagline: 'Momentum and pursuit',
        description: "You're driven by goals, progress, and movement toward something meaningful. You energize plans and pull people into action. When unsupported, impatience with slow or vague dynamics can appear."
    },
    Bonder: {
        id: 'Bonder',
        name: 'Bonder',
        tagline: 'Connection and warmth',
        description: "You build closeness through care, attention, and steady presence. People feel seen and included around you. Your edge case is over-giving or lingering in one-sided connections."
    },
    Competitor: {
        id: 'Competitor',
        name: 'Competitor',
        tagline: 'Edge and excellence',
        description: "You bring intensity, standards, and a desire to level up. You raise performance and sharpen focus. In unhealthy fields, urgency can feel lonely or unreciprocated."
    },
    Sage: {
        id: 'Sage',
        name: 'Sage',
        tagline: 'Clarity and sense-making',
        description: "You're oriented toward insight, patterns, and understanding. You help people think and decide more clearly. At times, others may want comfort when you're offering clarity."
    },
    FlowMaker: {
        id: 'FlowMaker',
        name: 'FlowMaker',
        tagline: 'Ease and play',
        description: "You reduce friction and help social moments feel natural. Timing, humor, and vibe are your strengths. Because things feel easy around you, your contribution can be under-credited."
    },
    Anchor: {
        id: 'Anchor',
        name: 'Anchor',
        tagline: 'Stability and calm',
        description: "You bring steadiness and grounding to groups over time. Others feel safer with you present. Your risk is being taken for granted or staying too quiet when direction is needed."
    }
};

export const NTI_TYPES: NTITypeConfig[] = [
    {
        id: 'FL01',
        name: 'Anchor',
        short_label: 'Steady',
        description: 'Steady presence and calm continuity. Reliable and grounding. Can be overlooked or taken for granted.',
        vector: { DA: 0.2, OX: 0.4, '5HT': 0.6, ACh: 0.2, EN: 0.2, GABA: 0.9 },
        primary_archetype: 'Anchor'
    },
    {
        id: 'FL02',
        name: 'Catalyst',
        short_label: 'Starter',
        description: 'Initiates plans and creates momentum. Converts ideas into action. Can burn out if initiation isn\'t shared.',
        vector: { DA: 0.8, OX: 0.2, '5HT': 0.2, ACh: 0.4, EN: 0.7, GABA: 0.2 },
        primary_archetype: 'Hunter'
    },
    {
        id: 'FL03',
        name: 'Connector',
        short_label: 'Bridge',
        description: 'Links people and groups into networks. Expands social overlap. Risk is too much breadth, not enough depth.',
        vector: { DA: 0.6, OX: 0.6, '5HT': 0.3, ACh: 0.4, EN: 0.4, GABA: 0.2 },
        primary_archetype: 'Bonder'
    },
    {
        id: 'FL04',
        name: 'Builder',
        short_label: 'Structure',
        description: 'Creates durable structure and recurring continuity. Thinks in systems. Can feel over-responsible.',
        vector: { DA: 0.5, OX: 0.4, '5HT': 0.5, ACh: 0.5, EN: 0.4, GABA: 0.4 },
        primary_archetype: 'Hunter'
    },
    {
        id: 'FL05',
        name: 'Companion',
        short_label: 'Depth',
        description: 'One-on-one loyalty and sustained depth. Values fewer, stronger ties. Can over-invest when reciprocity fades.',
        vector: { DA: 0.3, OX: 0.9, '5HT': 0.7, ACh: 0.2, EN: 0.2, GABA: 0.4 },
        primary_archetype: 'Bonder'
    },
    {
        id: 'FL06',
        name: 'Explorer',
        short_label: 'Novelty',
        description: 'Brings discovery and new experiences. Keeps things fresh. Continuity can suffer after novelty fades.',
        vector: { DA: 0.7, OX: 0.3, '5HT': 0.2, ACh: 0.7, EN: 0.5, GABA: 0.2 },
        primary_archetype: 'Hunter'
    },
    {
        id: 'FL07',
        name: 'Steward',
        short_label: 'Guardian',
        description: 'Notices imbalance early and restores tone and fairness. Prevents fractures. Emotional labor can go unseen.',
        vector: { DA: 0.35, OX: 0.55, '5HT': 0.65, ACh: 0.46, EN: 0.3, GABA: 0.6 },
        primary_archetype: 'Anchor'
    },
    {
        id: 'FL08',
        name: 'Host',
        short_label: 'Welcome',
        description: 'Creates welcoming space and inclusion. Turns strangers into participants. Can give more than they receive.',
        vector: { DA: 0.4, OX: 0.7, '5HT': 0.4, ACh: 0.4, EN: 0.3, GABA: 0.4 },
        primary_archetype: 'Bonder'
    },
    {
        id: 'FL09',
        name: 'Spark',
        short_label: 'Lift',
        description: 'Brings humor and emotional lift. Makes groups feel alive. Risk of being valued only as entertainment.',
        vector: { DA: 0.7, OX: 0.4, '5HT': 0.3, ACh: 0.65, EN: 0.9, GABA: 0.2 },
        primary_archetype: 'FlowMaker'
    },
    {
        id: 'FL10',
        name: 'Anchorite',
        short_label: 'Autonomy',
        description: 'Independent and low-maintenance. Engages deeply but intermittently. Can be misread as distant.',
        vector: { DA: 0.3, OX: 0.2, '5HT': 0.6, ACh: 0.3, EN: 0.2, GABA: 0.8 },
        primary_archetype: 'Anchor'
    },
    {
        id: 'FL11',
        name: 'Advocate',
        short_label: 'Defender',
        description: 'Stands up for people and voices hard truths. Loyal in high-stakes moments. Can burn bridges alone.',
        vector: { DA: 0.35, OX: 0.55, '5HT': 0.3, ACh: 0.25, EN: 0.8, GABA: 0.2 },
        primary_archetype: 'Competitor'
    },
    {
        id: 'FL12',
        name: 'Mirror',
        short_label: 'Reflect',
        description: 'Creates clarity through insight and reflection. Conversations feel clean. May feel analytical to others.',
        vector: { DA: 0.2, OX: 0.4, '5HT': 0.7, ACh: 0.7, EN: 0.2, GABA: 0.4 },
        primary_archetype: 'Sage'
    },
    {
        id: 'FL13',
        name: 'Stabilizer',
        short_label: 'Balance',
        description: 'Keeps systems from tipping into volatility. Essential for long-running groups. Can slow needed change.',
        vector: { DA: 0.2, OX: 0.4, '5HT': 0.7, ACh: 0.3, EN: 0.2, GABA: 0.9 },
        primary_archetype: 'Anchor'
    },
    {
        id: 'FL14',
        name: 'Giver',
        short_label: 'Generous',
        description: 'Contributes time, help, and resources freely. Dependable and kind. Vulnerable to extraction.',
        vector: { DA: 0.3, OX: 0.7, '5HT': 0.5, ACh: 0.2, EN: 0.2, GABA: 0.4 },
        primary_archetype: 'Bonder'
    },
    {
        id: 'FL15',
        name: 'Pathfinder',
        short_label: 'Future',
        description: 'Sees future possibilities and guides evolution. Helps systems adapt. Frustration arises with resistance.',
        vector: { DA: 0.6, OX: 0.3, '5HT': 0.3, ACh: 0.7, EN: 0.5, GABA: 0.2 },
        primary_archetype: 'Sage'
    },
    {
        id: 'FL16',
        name: 'Resonator',
        short_label: 'Attuned',
        description: 'Highly attuned to group dynamics and mood. Amplifies coherence. Can absorb stress that isn\'t theirs.',
        vector: { DA: 0.3, OX: 0.6, '5HT': 0.4, ACh: 0.4, EN: 0.3, GABA: 0.5 },
        primary_archetype: 'FlowMaker'
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
