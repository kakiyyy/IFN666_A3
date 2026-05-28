const FALLBACK = 'Not provided';

function valueOrFallback(value) {
  if (value === null || value === undefined) return FALLBACK;
  const text = String(value).trim();
  return text.length > 0 ? text : FALLBACK;
}

function namesFromList(items, nestedKey) {
  if (!Array.isArray(items) || items.length === 0) return FALLBACK;

  const names = items
    .map((item) => {
      const source = nestedKey && item?.[nestedKey] ? item[nestedKey] : item;
      return source?.name || source?.title || source;
    })
    .map((name) => String(name || '').trim())
    .filter(Boolean);

  return names.length > 0 ? names.join(', ') : FALLBACK;
}

function categoryTutorialDetails(item) {
  const tutorials = item?.tutorials || item?.tutorialList || item?.categoryTutorials;
  if (Array.isArray(tutorials)) {
    return tutorials.length > 0 ? namesFromList(tutorials) : '0 tutorials';
  }

  const count = item?.tutorialCount ?? item?.tutorialsCount ?? item?.count;
  if (Number.isFinite(Number(count))) {
    return `${Number(count)} tutorial${Number(count) === 1 ? '' : 's'}`;
  }

  return FALLBACK;
}

export function buildShareMessage(type, item = {}) {
  switch (type) {
    case 'tutorial':
      return [
        'Handcraft Tutorial',
        'Tutorial',
        '',
        `Tutorial title: ${valueOrFallback(item.title)}`,
        `Difficulty: ${valueOrFallback(item.difficulty)}`,
        `Time: ${valueOrFallback(item.AverageTimeSpentMinutes)}`,
        `Categories: ${namesFromList(item.categories)}`,
        `Materials: ${namesFromList(item.materials, 'material')}`,
      ].join('\n');
    case 'category':
      return [
        'Handcraft Tutorial',
        'Category',
        '',
        `Category title: ${valueOrFallback(item.name || item.title)}`,
        `Description: ${valueOrFallback(item.description)}`,
        `Tutorial under the category: ${categoryTutorialDetails(item)}`,
      ].join('\n');
    case 'material':
      return [
        'Handcraft Tutorial',
        'Material',
        '',
        `Material title: ${valueOrFallback(item.name || item.title)}`,
        `Purchase source: ${valueOrFallback(item.purchaseSource)}`,
      ].join('\n');
    default:
      return [
        'Handcraft Tutorial',
        valueOrFallback(type),
        '',
        valueOrFallback(item.title || item.name),
      ].join('\n');
  }
}
