import { BASE_URL } from '../constants/api';
import { authHeaders } from './apiClient';

function extractError(data) {
  if (data?.error) return data.error;
  if (data?.errors?.length) return data.errors.map((e) => e.msg).join(', ');
  return null;
}

function parseLinkHeader(header) {
  if (!header) return 1;
  const match = header.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/);
  return match ? parseInt(match[1], 10) : 1;
}


async function parseResponseSafely(res, requestUrl) {
  const contentType = res.headers.get('content-type') || '';
  const responseText = await res.text();
  const isJson = contentType.toLowerCase().includes('application/json');

  let data = null;
  if (responseText) {
    if (isJson) {
      try {
        data = JSON.parse(responseText);
      } catch {
        // keep null and fail with response details below
      }
    }
  }

  if (!res.ok) {
    const debugSnippet = responseText.slice(0, 200).replace(/\s+/g, ' ').trim();
    console.error(
      `[Tutorial API] Request failed: ${res.status} ${requestUrl} | content-type=${contentType} | body=${debugSnippet}`
    );

    const parsedError = extractError(data);
    if (parsedError) throw new Error(parsedError);

    if (!isJson) {
      throw new Error(`Server returned ${res.status} with non-JSON response. Please verify API endpoint and backend status.`);
    }

    throw new Error(`Request failed with status ${res.status}.`);
  }

  if (!responseText) return null;

  if (!isJson || data === null) {
    const debugSnippet = responseText.slice(0, 200).replace(/\s+/g, ' ').trim();
    console.error(
      `[Tutorial API] Unexpected non-JSON success response: ${res.status} ${requestUrl} | content-type=${contentType} | body=${debugSnippet}`
    );
    throw new Error('Unexpected server response format.');
  }

  return data;
}

function buildTutorialListUrl({ page, search, sort }) {
  const params = new URLSearchParams({ page: String(page) });
  if (sort) params.set('sort', sort);
  if (search) params.set('search', search);
  return `${BASE_URL}/tutorials?${params}`;
}

function isInvalidSortError(error) {
  return typeof error?.message === 'string' && error.message.toLowerCase().includes('invalid sort');
}

export async function getTutorials({ page = 1, search = '', sort = 'title_asc' } = {}) {
  const shouldSkipSortParam = sort === 'title_asc' || sort === 'title_desc';
  const attemptedSort = shouldSkipSortParam ? '' : sort;

  let requestUrl = buildTutorialListUrl({ page, search, sort: attemptedSort });
  let res = await fetch(requestUrl);
  let data;

  try {
    data = await parseResponseSafely(res, requestUrl);
  } catch (error) {
    if (!attemptedSort || !isInvalidSortError(error)) throw error;
    requestUrl = buildTutorialListUrl({ page, search, sort: '' });
    res = await fetch(requestUrl);
    data = await parseResponseSafely(res, requestUrl);
  }

  return { tutorials: data, totalPages: parseLinkHeader(res.headers.get('Link')) };
}

export async function getTutorial(id) {
  const requestUrl = `${BASE_URL}/tutorials/${id}`;
  const res = await fetch(requestUrl);
  return parseResponseSafely(res, requestUrl);
}

export async function createTutorial(token, body) {
  const requestUrl = `${BASE_URL}/tutorials`;
  const res = await fetch(requestUrl, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parseResponseSafely(res, requestUrl);
}

export async function updateTutorial(token, id, body) {
  const requestUrl = `${BASE_URL}/tutorials/${id}`;
  const res = await fetch(requestUrl, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parseResponseSafely(res, requestUrl);
}

export async function deleteTutorial(token, id) {
  const requestUrl = `${BASE_URL}/tutorials/${id}`;
  const res = await fetch(requestUrl, { method: 'DELETE', headers: authHeaders(token) });
  await parseResponseSafely(res, requestUrl);
}
