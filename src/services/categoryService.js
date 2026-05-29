import { BASE_URL } from '../constants/api';
import { authHeaders } from './apiClient';

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


export async function getCategories({ page = 1, search = '', sort = 'name_asc' } = {}) {
  const params = new URLSearchParams({ page: String(page), sort });
  if (search) params.set('search', search);
  const res = await fetch(`${BASE_URL}/categories?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  return { categories: data, totalPages: parseLinkHeader(res.headers.get('Link')) };
}

export async function getCategory(id) {
  const res = await fetch(`${BASE_URL}/categories/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  return data;
}

export async function getCategoryTutorials(id, { page = 1, sort = 'name_asc' } = {}) {
  const params = new URLSearchParams({ page: String(page), sort });
  const res = await fetch(`${BASE_URL}/categories/${id}/tutorials?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  return { tutorials: data, totalPages: parseLinkHeader(res.headers.get('Link')) };
}

export async function createCategory(token, body) { const res = await fetch(`${BASE_URL}/categories`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(body) }); const data = await res.json(); if (!res.ok) throw new Error(extractError(data)); return data; }
export async function updateCategory(token, id, body) { const res = await fetch(`${BASE_URL}/categories/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(body) }); const data = await res.json(); if (!res.ok) throw new Error(extractError(data)); return data; }
export async function deleteCategory(token, id) { const res = await fetch(`${BASE_URL}/categories/${id}`, { method: 'DELETE', headers: authHeaders(token) }); if (!res.ok) { const data = await res.json(); throw new Error(extractError(data)); } }
