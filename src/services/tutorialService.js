import { BASE_URL } from '../constants/api';

function extractError(data) {
  if (data?.error) return data.error;
  if (data?.errors?.length) return data.errors.map((e) => e.msg).join(', ');
  return 'Unknown error';
}

function parseLinkHeader(header) {
  if (!header) return 1;
  const match = header.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/);
  return match ? parseInt(match[1], 10) : 1;
}

function authHeaders(token) {
  if (!token) throw new Error('Please login first.');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function getTutorials({ page = 1, search = '', sort = 'name_asc' } = {}) {
  const params = new URLSearchParams({ page: String(page), sort });
  if (search) params.set('search', search);
  const res = await fetch(`${BASE_URL}/tutorials?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  return { tutorials: data, totalPages: parseLinkHeader(res.headers.get('Link')) };
}

export async function getTutorial(id) {
  const res = await fetch(`${BASE_URL}/tutorials/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  return data;
}

export async function createTutorial(token, body) {
  const res = await fetch(`${BASE_URL}/tutorials`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  return data;
}

export async function updateTutorial(token, id, body) {
  const res = await fetch(`${BASE_URL}/tutorials/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  return data;
}

export async function deleteTutorial(token, id) {
  const res = await fetch(`${BASE_URL}/tutorials/${id}`, { method: 'DELETE', headers: authHeaders(token) });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(extractError(data));
  }
}
