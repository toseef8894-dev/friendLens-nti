import { runNTIScoring, UserResponse, DimensionId, DIMENSION_IDS } from '../lib/nti-scoring';
import { QUESTIONS, NTI_TYPES } from '../lib/nti-config';

const TEST_PROFILES = [
    {
        test_id: 'SYN01_ANCHOR_HEAVY',
        normalized_scores: { DA: 20, OX: 45, '5HT': 55, ACh: 25, EN: 20, GABA: 100 },
        expected_primary_archetype: 'Anchor',
        expected_secondary_archetype: 'Sage',
        expected_primary_type16: 'Anchor'
    },
    {
        test_id: 'SYN02_BONDER_COMPANION',
        normalized_scores: { DA: 25, OX: 100, '5HT': 55, ACh: 20, EN: 30, GABA: 60 },
        expected_primary_archetype: 'Bonder',
        expected_secondary_archetype: 'Anchor',
        expected_primary_type16: 'Companion'
    },
    {
        test_id: 'SYN03_HUNTER_CATALYST',
        normalized_scores: { DA: 100, OX: 25, '5HT': 25, ACh: 45, EN: 35, GABA: 20 },
        expected_primary_archetype: 'Hunter',
        expected_secondary_archetype: 'Competitor',
        expected_primary_type16: 'Catalyst'
    },
    {
        test_id: 'SYN04_SAGE_MIRROR',
        normalized_scores: { DA: 30, OX: 35, '5HT': 100, ACh: 55, EN: 35, GABA: 45 },
        expected_primary_archetype: 'Sage',
        expected_secondary_archetype: 'Competitor',
        expected_primary_type16: 'Mirror'
    },
    {
        test_id: 'SYN05_FLOWMAKER_SPARK',
        normalized_scores: { DA: 65, OX: 45, '5HT': 35, ACh: 30, EN: 100, GABA: 25 },
        expected_primary_archetype: 'FlowMaker',
        expected_secondary_archetype: 'Hunter',
        expected_primary_type16: 'Spark'
    }
];

const LABEL_TO_DIM: Record<string, DimensionId> = {
    'Drive': 'DA',
    'Connection': 'OX',
    'Wisdom': '5HT',
    'Focus': 'ACh',
    'Joy': 'EN',
    'Calm': 'GABA'
};

function testTypeMatching() {
    console.log('='.repeat(60));
    console.log('NTI Engine Validation - Type Matching Tests');
    console.log('='.repeat(60));
    console.log('');

    let passed = 0;
    let failed = 0;

    for (const profile of TEST_PROFILES) {
        console.log(`Test: ${profile.test_id}`);
        console.log('-'.repeat(40));

        const normalizedScores = profile.normalized_scores as Record<DimensionId, number>;

        let bestType = NTI_TYPES[0];
        let bestDistance = Infinity;

        for (const t of NTI_TYPES) {
            let dist = 0;
            for (const dim of DIMENSION_IDS) {
                const scaledTypeVal = (t.vector[dim] || 0) * 100;
                const d = normalizedScores[dim] - scaledTypeVal;
                dist += d * d;
            }
            dist = Math.sqrt(dist);

            if (dist < bestDistance) {
                bestDistance = dist;
                bestType = t;
            }
        }

        const sortedDims = DIMENSION_IDS
            .map(d => ({ dim: d, score: normalizedScores[d] }))
            .sort((a, b) => b.score - a.score);

        const DIMENSION_TO_ARCHETYPE: Record<DimensionId, string> = {
            'DA': 'Hunter',
            'OX': 'Bonder',
            '5HT': 'Sage',
            'ACh': 'Competitor',
            'EN': 'FlowMaker',
            'GABA': 'Anchor'
        };

        const primaryArchetype = DIMENSION_TO_ARCHETYPE[sortedDims[0].dim];
        const secondaryArchetype = DIMENSION_TO_ARCHETYPE[sortedDims[1].dim];

        const typeMatch = bestType.name === profile.expected_primary_type16;
        const primaryMatch = primaryArchetype === profile.expected_primary_archetype;
        const secondaryMatch = secondaryArchetype === profile.expected_secondary_archetype;

        console.log(`  Expected Type:      ${profile.expected_primary_type16}`);
        console.log(`  Got Type:           ${bestType.name} (distance: ${bestDistance.toFixed(2)})`);
        console.log(`  Type Match:         ${typeMatch ? '✅ PASS' : '❌ FAIL'}`);
        console.log('');
        console.log(`  Expected Primary:   ${profile.expected_primary_archetype}`);
        console.log(`  Got Primary:        ${primaryArchetype}`);
        console.log(`  Primary Match:      ${primaryMatch ? '✅ PASS' : '❌ FAIL'}`);
        console.log('');
        console.log(`  Expected Secondary: ${profile.expected_secondary_archetype}`);
        console.log(`  Got Secondary:      ${secondaryArchetype}`);
        console.log(`  Secondary Match:    ${secondaryMatch ? '✅ PASS' : '❌ FAIL'}`);
        console.log('');

        if (typeMatch && primaryMatch && secondaryMatch) {
            console.log(`  OVERALL: ✅ PASS`);
            passed++;
        } else {
            console.log(`  OVERALL: ❌ FAIL`);
            failed++;
        }
        console.log('');
    }

    console.log('='.repeat(60));
    console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${TEST_PROFILES.length} tests`);
    console.log('='.repeat(60));

    return failed === 0;
}

// Run validation
const success = testTypeMatching();
process.exit(success ? 0 : 1);
