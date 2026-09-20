/** Offline review tooling: never called by the Expo app or recipe discovery. */
import { ALLERGENS } from "../domain/preferences/dietary";

export type IngredientProposal = { entityType: "ingredient"; entityId: string; modelIdentifier: string; promptVersion: string; dietary: Record<string, boolean | null>; allergens: { code: string; status: "present" | "unknown" }[]; ambiguities: string[] };
export function validateIngredientProposal(value: unknown, canonicalIds: Set<string>): IngredientProposal {
  if (!value || typeof value !== "object") throw new Error("Proposal must be an object.");
  const candidate = value as Partial<IngredientProposal>;
  if (candidate.entityType !== "ingredient" || typeof candidate.entityId !== "string" || !canonicalIds.has(candidate.entityId)) throw new Error("Proposal has an invalid canonical ingredient ID.");
  if (!candidate.modelIdentifier || !candidate.promptVersion || !candidate.dietary || !Array.isArray(candidate.allergens) || !Array.isArray(candidate.ambiguities)) throw new Error("Proposal is missing required fields.");
  const seen = new Set<string>();
  for (const allergen of candidate.allergens) { if (!(ALLERGENS as readonly string[]).includes(allergen.code) || (allergen.status !== "present" && allergen.status !== "unknown") || seen.has(allergen.code)) throw new Error("Proposal has invalid or duplicate allergen data."); seen.add(allergen.code); }
  return candidate as IngredientProposal;
}
/** Reviewer import is intentionally narrow: proposed output cannot overwrite verified rows. */
export function buildApprovedImport(proposal: IngredientProposal, evidence: string) {
  if (!evidence.trim()) throw new Error("Evidence provenance is required for approval.");
  return { ingredient_id: proposal.entityId, verification_status: "verified", provenance: evidence.trim(), values: proposal.dietary, allergens: proposal.allergens.filter((a) => a.status === "present") };
}
