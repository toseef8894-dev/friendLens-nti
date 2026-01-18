import { ArchetypeId } from "@/lib/nti-scoring";

export interface ArchetypeDetails {
  id: ArchetypeId;
  name: string;
  crown: string;
  bullets: string[];
  details: {
    paragraphs: string[];
    whatTheyBring: string;
    thrivesWhen: string;
    stallPattern: string;
    onePracticalMove: string;
  };
}

export const ARCHETYPE_DETAILS: Record<ArchetypeId, ArchetypeDetails> = {
  Anchor: {
    id: "Anchor",
    name: "ANCHOR",
    crown: "You stabilize the field so others can move.",
    bullets: [
      "People feel calmer around you.",
      "You reduce chaos without needing attention.",
      "You're steady under pressure.",
      "You make consistency feel natural.",
    ],
    details: {
      paragraphs: [
        "Anchors provide emotional and logistical stability in friendships.",
        "They often become the stabilizing node when groups are under stress.",
      ],
      whatTheyBring:
        "Anchors provide emotional and logistical stability in friendships. They often become the stabilizing node when groups are under stress. You bring reliability and calm to friendships, creating a sense of safety that allows others to be more expressive and take risks.",
      thrivesWhen:
        "You thrive when you're resourced and not over-carrying continuity. Your natural strengths shine when others recognize and appreciate your steady presence without taking it for granted.",
      stallPattern:
        "When this archetype's needs aren't met, friendships may feel unbalanced or disconnected. Watch for becoming the default fixer for everyone, which can lead to burnout and resentment.",
      onePracticalMove:
        "Set boundaries to avoid becoming the default fixer. Communicate your need for stability and consistency, and appreciate the energy that more dynamic types bring.",
    },
  },
  Connector: {
    id: "Connector",
    name: "CONNECTOR",
    crown: "You bring people together and create social flow.",
    bullets: [
      "You naturally link people and groups.",
      "You facilitate introductions and connections.",
      "You maintain wide social networks.",
      "You make social gatherings feel effortless.",
    ],
    details: {
      paragraphs: [
        "Connectors thrive on linking people and social flow.",
        "They maintain wide networks and facilitate introductions naturally.",
      ],
      whatTheyBring:
        "Connectors thrive on linking people and social flow. They maintain wide networks and facilitate introductions naturally. You bring people together and create social flow, making friendships feel effortless and expansive.",
      thrivesWhen:
        "You thrive when you balance your social energy with one-on-one depth. Your natural strengths shine when you can maintain both wide networks and meaningful individual connections.",
      stallPattern:
        "When this archetype's needs aren't met, friendships may feel unbalanced or disconnected. Watch for spreading yourself too thin or prioritizing quantity over quality in connections.",
      onePracticalMove:
        "Balance your social energy with one-on-one depth. Recognize when others need space, and value quality connections over quantity.",
    },
  },
  Hunter: {
    id: "Hunter",
    name: "HUNTER",
    crown: "You energize friendships through momentum and pursuit.",
    bullets: [
      "You take initiative in friendships.",
      "You bring energy and momentum.",
      "You pursue goals and activities together.",
      "You make things happen.",
    ],
    details: {
      paragraphs: [
        "Hunters energize friendships through initiative and momentum.",
        "They pursue goals and activities, making things happen in the group.",
      ],
      whatTheyBring:
        "Hunters energize friendships through initiative and momentum. They pursue goals and activities, making things happen in the group. You energize friendships through momentum and pursuit, bringing action and forward movement.",
      thrivesWhen:
        "You thrive when you can channel your energy into structured activities. Your natural strengths shine when others match your pace and appreciate your drive.",
      stallPattern:
        "When this archetype's needs aren't met, friendships may feel unbalanced or disconnected. Watch for overwhelming others with your pace or not respecting different approaches to friendship.",
      onePracticalMove:
        "Slow down to match others' pace when needed. Channel your energy into structured activities and respect different approaches to friendship.",
    },
  },
  Bonder: {
    id: "Bonder",
    name: "BONDER",
    crown: "You create closeness and emotional safety.",
    bullets: [
      "You prioritize deep, intimate connections.",
      "You create emotional safety.",
      "You value one-on-one depth.",
      "You build lasting emotional bonds.",
    ],
    details: {
      paragraphs: [
        "Bonders create closeness and emotional safety in friendships.",
        "They prioritize deep, intimate connections over wide networks.",
      ],
      whatTheyBring:
        "Bonders create closeness and emotional safety in friendships. They prioritize deep, intimate connections over wide networks. You create closeness and emotional safety, building lasting emotional bonds.",
      thrivesWhen:
        "You thrive when you can express your need for emotional depth clearly. Your natural strengths shine when others value and reciprocate the intimacy you offer.",
      stallPattern:
        "When this archetype's needs aren't met, friendships may feel unbalanced or disconnected. Watch for becoming too dependent on specific connections or not giving space for others who process differently.",
      onePracticalMove:
        "Express your need for emotional depth clearly. Give space for others who process differently, and find balance between intimacy and independence.",
    },
  },
  Sage: {
    id: "Sage",
    name: "SAGE",
    crown: "You orient friendships through insight and perspective.",
    bullets: [
      "You offer wisdom and perspective.",
      "You help others see patterns.",
      "You bring meaning to conversations.",
      "You provide thoughtful guidance.",
    ],
    details: {
      paragraphs: [
        "Sages orient friendships through insight and perspective.",
        "They help others see patterns and bring meaning to conversations.",
      ],
      whatTheyBring:
        "Sages orient friendships through insight and perspective. They help others see patterns and bring meaning to conversations. You orient friendships through insight, providing thoughtful guidance and wisdom.",
      thrivesWhen:
        "You thrive when you can share insights without overwhelming others. Your natural strengths shine when others value your perspective and you balance reflection with action.",
      stallPattern:
        "When this archetype's needs aren't met, friendships may feel unbalanced or disconnected. Watch for overthinking or becoming too detached from emotional connection.",
      onePracticalMove:
        "Share insights without overwhelming others. Balance reflection with action, and appreciate different ways of processing.",
    },
  },
  FlowMaker: {
    id: "FlowMaker",
    name: "FLOWMAKER",
    crown: "You make social time feel light and natural.",
    bullets: [
      "You create ease in social settings.",
      "You make interactions feel natural.",
      "You bring lightness and enjoyment.",
      "You facilitate smooth social flow.",
    ],
    details: {
      paragraphs: [
        "FlowMakers make social time feel light and natural.",
        "They create ease in interactions and facilitate smooth social flow.",
      ],
      whatTheyBring:
        "FlowMakers make social time feel light and natural. They create ease in interactions and facilitate smooth social flow. You make social time feel light and natural, bringing enjoyment and ease to friendships.",
      thrivesWhen:
        "You thrive when you maintain lightness while respecting deeper needs. Your natural strengths shine when you can create space for both fun and depth.",
      stallPattern:
        "When this archetype's needs aren't met, friendships may feel unbalanced or disconnected. Watch for avoiding difficult conversations or not taking things seriously enough.",
      onePracticalMove:
        "Maintain lightness while respecting deeper needs. Create space for both fun and depth, and balance spontaneity with reliability.",
    },
  },
  Builder: {
    id: "Builder",
    name: "BUILDER",
    crown: "You make friendships real through structure and action.",
    bullets: [
      "You create structure in friendships.",
      "You organize and host gatherings.",
      "You make plans and follow through.",
      "You build lasting social infrastructure.",
    ],
    details: {
      paragraphs: [
        "Builders make friendships real through structure and action.",
        "They organize, host, and create lasting social infrastructure.",
      ],
      whatTheyBring:
        "Builders make friendships real through structure and action. They organize, host, and create lasting social infrastructure. You make friendships real through structure and hosting, building lasting connections through action.",
      thrivesWhen:
        "You thrive when you balance structure with flexibility. Your natural strengths shine when others appreciate your organizational skills without feeling constrained.",
      stallPattern:
        "When this archetype's needs aren't met, friendships may feel unbalanced or disconnected. Watch for becoming too rigid or not recognizing when others need less planning.",
      onePracticalMove:
        "Balance structure with flexibility. Recognize when others need less planning, and value both process and outcomes.",
    },
  },
  Explorer: {
    id: "Explorer",
    name: "EXPLORER",
    crown: "You bring new experiences into the group.",
    bullets: [
      "You introduce novelty and adventure.",
      "You expand social horizons.",
      "You bring fresh perspectives.",
      "You create opportunities for growth.",
    ],
    details: {
      paragraphs: [
        "Explorers bring new experiences into the group.",
        "They introduce novelty, adventure, and fresh perspectives.",
      ],
      whatTheyBring:
        "Explorers bring new experiences into the group. They introduce novelty, adventure, and fresh perspectives. You bring new experiences into the group, creating opportunities for growth and expansion.",
      thrivesWhen:
        "You thrive when you balance novelty with consistency. Your natural strengths shine when others appreciate your sense of adventure while maintaining stability.",
      stallPattern:
        "When this archetype's needs aren't met, friendships may feel unbalanced or disconnected. Watch for becoming restless or not respecting others' need for stability.",
      onePracticalMove:
        "Balance novelty with consistency. Respect others' need for stability, and share new experiences without overwhelming.",
    },
  },
};

/**
 * Get archetype details by ID
 */
export function getArchetypeDetails(id: ArchetypeId): ArchetypeDetails | null {
  return ARCHETYPE_DETAILS[id] || null;
}
