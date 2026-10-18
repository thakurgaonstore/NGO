/**
 * Provisions a new Firebase Auth user without Cloud Functions
 * Uses Google Identity Toolkit REST API with Google Service Account OAuth2 token
 */

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  project_id: string;
}

// Helper to base64url-encode ArrayBuffer
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Converts PEM private key to CryptoKey
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const cleanPem = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/[\r\n\s]/g, '');

  const binaryDerString = atob(cleanPem);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  return crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );
}

// Generates Google OAuth2 Access Token using Web Crypto API
async function getGoogleAccessToken(sa: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/firebase',
    aud: 'https://oauth2.googleapis.com/token',
    exp,
    iat: now
  };

  const encHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const encClaim = btoa(JSON.stringify(claimSet)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unsignedToken = `${encHeader}.${encClaim}`;

  const cryptoKey = await importPrivateKey(sa.private_key);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signedJwt = `${unsignedToken}.${arrayBufferToBase64Url(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${signedJwt}`
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to obtain Google access token: ${errorText}`);
  }

  const tokenData = await res.json() as { access_token: string };
  return tokenData.access_token;
}

export async function provisionFirebaseUser(params: {
  serviceAccount: ServiceAccountKey;
  email: string;
  password?: string;
  displayName: string;
  tenantId: string;
  role: string;
  permissions?: string[];
}) {
  const accessToken = await getGoogleAccessToken(params.serviceAccount);
  const projectId = params.serviceAccount.project_id;

  // 1. Create or lookup the Firebase Auth user via Identity Toolkit REST
  const signUpRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        email: params.email,
        password: params.password || Math.random().toString(36).slice(-10) + 'A1!',
        displayName: params.displayName,
        emailVerified: true
      })
    }
  );

  const userData = await signUpRes.json() as { localId?: string; error?: { message: string } };
  if (!signUpRes.ok || !userData.localId) {
    throw new Error(userData.error?.message || 'Failed to create user account');
  }

  const uid = userData.localId;

  // 2. Set Custom Claims: { tenantId, role, permissions }
  const claims = {
    tenantId: params.tenantId,
    role: params.role,
    permissions: params.permissions || []
  };

  const claimsRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:setCustomUserClaims`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        localId: uid,
        customAttributes: JSON.stringify(claims)
      })
    }
  );

  if (!claimsRes.ok) {
    const errorText = await claimsRes.text();
    throw new Error(`Failed to set user custom claims: ${errorText}`);
  }

  return { uid, email: params.email, tenantId: params.tenantId, role: params.role };
}
