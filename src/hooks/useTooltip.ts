import { translate } from "../data/translations";

/**
 * Hook that provides jargon translation lookup.
 * Returns a function that takes a term and returns its plain-English explanation.
 */
export function useTooltip() {
  return {
    /** Get plain-English explanation for a jargon term. Returns undefined if not found. */
    explain: (term: string): string | undefined => translate(term),
  };
}
