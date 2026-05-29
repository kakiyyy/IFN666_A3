import { FALLBACK_TEXT, displayList, displayValue } from './displayValue';

function namesFromList(items, nestedKey) {
  return displayList(items, (item) => {
    const source = nestedKey && item?.[nestedKey] ? item[nestedKey] : item;
    return source?.name || source?.title || source;
  });
}

function categoryTutorialDetails(item) {
  const tutorials = item?.tutorials || item?.tutorialList || item?.categoryTutorials;
  if (Array.isArray(tutorials)) {
    return tutorials.length > 0 ? namesFromList(tutorials) : FALLBACK_TEXT;
  }

  const count = item?.tutorialCount ?? item?.tutorialsCount ?? item?.count;
  if (Number.isFinite(Number(count))) {
    const numericCount = Number(count);
    return numericCount > 0 ? `${numericCount} tutorial${numericCount === 1 ? '' : 's'}` : FALLBACK_TEXT;
  }

  return FALLBACK_TEXT;
}

export function buildShareMessage(type, item = {}) {
  switch (type) {
    case 'tutorial':
      return [
        'Handcraft Tutorial',
        'Tutorial',
        '',
        `Tutorial title: ${displayValue(item.title)}`,
        `Difficulty: ${displayValue(item.difficulty)}`,
        `Time: ${displayValue(item.AverageTimeSpentMinutes)}`,
        `Categories: ${namesFromList(item.categories)}`,
        `Materials: ${namesFromList(item.materials || item.material, 'material')}`,
      ].join('\n');
    case 'category':
      return [
        'Handcraft Tutorial',
        'Category',
        '',
        `Category title: ${displayValue(item.name || item.title)}`,
        `Description: ${displayValue(item.description)}`,
        `Tutorial under the category: ${categoryTutorialDetails(item)}`,
      ].join('\n');
    case 'material':
      return [
        'Handcraft Tutorial',
        'Material',
        '',
        `Material title: ${displayValue(item.name || item.title)}`,
        `Purchase source: ${displayValue(item.purchaseSource)}`,
      ].join('\n');
    default:
      return [
        'Handcraft Tutorial',
        displayValue(type),
        '',
        displayValue(item.title || item.name),
      ].join('\n');
  }
}
