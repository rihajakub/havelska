const placeholders = new Set(["NA", "N/A", "NONE", "UNKNOWN", "NEVIM", "XXX"]);

export const travelDocumentTypes = ["Passport", "National ID card", "Residence permit", "Other travel document"] as const;

export function normalizeTravelDocumentNumber(value: string) {
  return value.trim().toUpperCase().replace(/[\s-]+/g, "");
}

function isNumberSequence(value: string) {
  if (!/^\d+$/.test(value) || value.length < 4) return false;
  const direction = Number(value[1]) - Number(value[0]);
  if (direction !== 1 && direction !== -1) return false;
  return [...value].every((character, index) => index === 0 || Number(character) - Number(value[index - 1]) === direction);
}

export function travelDocumentNumberError(value: string) {
  const normalized = normalizeTravelDocumentNumber(value);
  if (normalized.length < 4) return "Enter at least 4 letters or numbers from the document number.";
  if (!/^[A-Z0-9]+$/.test(normalized)) return "Use letters, numbers, spaces or hyphens only.";
  if (placeholders.has(normalized)) return "Enter the actual document number, not a placeholder.";
  if (/^([A-Z0-9])\1+$/.test(normalized) || isNumberSequence(normalized)) return "Enter the actual document number, not a repeated or sequential value.";
  return undefined;
}
