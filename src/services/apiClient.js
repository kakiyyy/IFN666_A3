function extractTokenValue(token) {
  if (token && typeof token === 'object') {
    return token.token ?? token.accessToken ?? token.jwt ?? token.authToken ?? '';
  }
  return token;
}

export function normaliseAuthToken(token) {
  let value = extractTokenValue(token);

  if (value === null || value === undefined) return '';
  value = String(value).trim();

  if (!value) return '';

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith('{') && value.endsWith('}'))
  ) {
    try {
      const parsed = JSON.parse(value);
      value = String(extractTokenValue(parsed) ?? parsed ?? '').trim();
    } catch {
      value = value.replace(/^"|"$/g, '').trim();
    }
  }

  return value.replace(/^Bearer\s+/i, '').trim();
}

export function authHeaders(token) {
  const rawToken = normaliseAuthToken(token);
  if (!rawToken) throw new Error('Please login first.');

  return {
    Authorization: `Bearer ${rawToken}`,
    'Content-Type': 'application/json',
  };
}
