import { BASE_URL } from '../constants/api';

function extractError(data) {
  if (data?.error) return data.error;
  if (data?.errors?.length) return data.errors.map((e) => e.msg).join(', ');
  return 'Unknown error';
}

export async function register(username, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  return data;
}

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  return data.token;
}
