import { runNTIScoring, UserResponse } from '../lib/nti-scoring';
import { QUESTIONS, NTI_TYPES } from '../lib/nti-config';

// Mock Response: User selects options that lean toward Hunter/DA
const mockResponses: UserResponse[] = [
    { question_id: "Q1", ranked_option_ids: ["Q1_D", "Q1_C"] }, // Fully charged
    { question_id: "Q2", ranked_option_ids: ["Q2_D", "Q2_C"] }, // Exciting
    { question_id: "Q3", ranked_option_ids: ["Q3_D", "Q3_C"] }, // Address clearly
    { question_id: "Q4", ranked_option_ids: ["Q4_D", "Q4_C"] }, // Multiple times a week
    { question_id: "Q5", ranked_option_ids: ["Q5_D", "Q5_C"] }, // Healthy rupture
    { question_id: "Q6", ranked_option_ids: ["Q6_C", "Q6_B"] }, // 5-10 years
    { question_id: "Q7", ranked_option_ids: ["Q7_D", "Q7_C"] }, // Lead
    { question_id: "Q8", ranked_option_ids: ["Q8_D", "Q8_C"] }, // Large energy
    { question_id: "Q9", ranked_option_ids: ["Q9_D", "Q9_C"] }, // Seek connection
    { question_id: "Q10", ranked_option_ids: ["Q10_D", "Q10_C"] }, // Energizing
    { question_id: "Q11", ranked_option_ids: ["Q11_D", "Q11_C"] }, // 4+ close
    { question_id: "Q12", ranked_option_ids: ["Q12_D", "Q12_C"] }  // Active tracking
];

console.log("Running NTI v1 Scoring Test...");

try {
    const result = runNTIScoring(QUESTIONS, NTI_TYPES, mockResponses);

    console.log("\n--- Result ---");
    console.log("16-Type:", result.primary_type_16.name);
    console.log("16-Type Short Label:", result.primary_type_16.short_label);
    console.log("Primary Archetype:", result.primary_archetype_6);
    console.log("Secondary Archetype:", result.secondary_archetype_6);
    console.log("Confidence:", (result.confidence * 100).toFixed(1) + "%");
    console.log("\nNormalized Scores:");
    Object.entries(result.normalized_scores)
        .sort(([, a], [, b]) => b - a)
        .forEach(([k, v]) => console.log(`  ${k}: ${v}`));

    console.log("\nSUCCESS: Scoring completed.");

} catch (e) {
    console.error(e);
}
