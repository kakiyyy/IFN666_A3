export const FALLBACK_TEXT = 'N/A';

export function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

export function displayValue(value) {
  if (value === null || value === undefined) return FALLBACK_TEXT;
  const text = String(value).trim();
  return text.length > 0 ? text : FALLBACK_TEXT;
}

export function displayList(values, formatter = (value) => value) {
  if (!Array.isArray(values) || values.length === 0) return FALLBACK_TEXT;

  const textValues = values
    .map(formatter)
    .map((value) => String(value ?? '').trim())
    .filter(Boolean);

  return textValues.length > 0 ? textValues.join(', ') : FALLBACK_TEXT;
}
