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
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function getCategories(token, { page = 1, search = '', sort = 'name_asc' } = {}) {
  const params = new URLSearchParams({ page, sort });
  if (search) params.set('search', search);
  const res = await fetch(`${BASE_URL}/categories?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  const totalPages = parseLinkHeader(res.headers.get('Link'));
  return { categories: data, totalPages };
}

export async function getCategory(token, id) {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  return data;
}

export async function getCategoryTutorials(token, id, { page = 1 } = {}) {
  const params = new URLSearchParams({ page });
  const res = await fetch(`${BASE_URL}/categories/${id}/tutorials?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  const totalPages = parseLinkHeader(res.headers.get('Link'));
  return { tutorials: data, totalPages };
}

export async function createCategory(token, body) {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  return data;
}

export async function updateCategory(token, id, body) {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  return data;
}

export async function deleteCategory(token, id) {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(extractError(data));
  }
}
