import { ArchetypeId } from './nti-scoring'

export interface InteractionData {
    strong: ArchetypeId[]
    friction: ArchetypeId[]
    tips: string[]
}

export const INTERACTIONS: Record<ArchetypeId, InteractionData> = {
    Anchor: {
        strong: ['Connector', 'Sage', 'Builder'],
        friction: ['Hunter', 'Explorer'],
        tips: [
            'Communicate your need for stability and consistency',
            'Set boundaries to avoid becoming the default fixer',
            'Appreciate the energy that more dynamic types bring'
        ]
    },
    Connector: {
        strong: ['Anchor', 'FlowMaker', 'Bonder'],
        friction: ['Hunter', 'Sage'],
        tips: [
            'Balance your social energy with one-on-one depth',
            'Recognize when others need space',
            'Value quality connections over quantity'
        ]
    },
    Hunter: {
        strong: ['FlowMaker', 'Explorer', 'Builder'],
        friction: ['Anchor', 'Bonder'],
        tips: [
            'Slow down to match others\' pace when needed',
            'Channel your energy into structured activities',
            'Respect different approaches to friendship'
        ]
    },
    Bonder: {
        strong: ['Anchor', 'Sage', 'Connector'],
        friction: ['Hunter', 'Explorer'],
        tips: [
            'Express your need for emotional depth clearly',
            'Give space for others who process differently',
            'Find balance between intimacy and independence'
        ]
    },
    Sage: {
        strong: ['Anchor', 'Bonder', 'Builder'],
        friction: ['Hunter', 'FlowMaker'],
        tips: [
            'Share insights without overwhelming others',
            'Balance reflection with action',
            'Appreciate different ways of processing'
        ]
    },
    FlowMaker: {
        strong: ['Connector', 'Hunter', 'Explorer'],
        friction: ['Anchor', 'Sage'],
        tips: [
            'Maintain lightness while respecting deeper needs',
            'Create space for both fun and depth',
            'Balance spontaneity with reliability'
        ]
    },
    Builder: {
        strong: ['Anchor', 'Sage', 'Connector'],
        friction: ['Explorer', 'FlowMaker'],
        tips: [
            'Balance structure with flexibility',
            'Recognize when others need less planning',
            'Value both process and outcomes'
        ]
    },
    Explorer: {
        strong: ['Hunter', 'FlowMaker', 'Connector'],
        friction: ['Anchor', 'Builder'],
        tips: [
            'Balance novelty with consistency',
            'Respect others\' need for stability',
            'Share new experiences without overwhelming'
        ]
    }
}
