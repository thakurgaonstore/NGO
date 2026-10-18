import { provisionFirebaseUser } from './auth-provisioner';
import { proxySmsRequest, SendSmsRequest } from './sms-proxy';
import { generateCloudinarySignature } from './media-signer';

export interface Env {
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  CLOUDINARY_API_SECRET?: string;
  ENVIRONMENT: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    try {
      // 1. Health check
      if (url.pathname === '/api/health') {
        return Response.json(
          { status: 'healthy', timestamp: Date.now(), env: env.ENVIRONMENT },
          { headers: CORS_HEADERS }
        );
      }

      // 2. User Provisioning Endpoint (Identity Toolkit REST)
      if (url.pathname === '/api/auth/provision-user' && request.method === 'POST') {
        if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
          return Response.json(
            { error: 'FIREBASE_SERVICE_ACCOUNT_JSON secret is not configured' },
            { status: 500, headers: CORS_HEADERS }
          );
        }

        const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
        const body = await request.json() as {
          email: string;
          password?: string;
          displayName: string;
          tenantId: string;
          role: string;
          permissions?: string[];
        };

        const result = await provisionFirebaseUser({
          serviceAccount: sa,
          ...body
        });

        return Response.json({ success: true, user: result }, { headers: CORS_HEADERS });
      }

      // 3. SMS Proxy
      if (url.pathname === '/api/sms/send' && request.method === 'POST') {
        const body = await request.json() as SendSmsRequest;
        const result = await proxySmsRequest(body);
        return Response.json(result, { headers: CORS_HEADERS });
      }

      // 4. Cloudinary Signed Upload
      if (url.pathname === '/api/media/sign-upload' && request.method === 'POST') {
        const body = await request.json() as { params: Record<string, string> };
        const secret = env.CLOUDINARY_API_SECRET || 'dev_secret';
        const signature = await generateCloudinarySignature(body.params, secret);
        return Response.json({ signature }, { headers: CORS_HEADERS });
      }

      return Response.json({ error: 'Endpoint not found' }, { status: 404, headers: CORS_HEADERS });
    } catch (err: any) {
      return Response.json(
        { error: err.message || 'Internal Server Error' },
        { status: 500, headers: CORS_HEADERS }
      );
    }
  }
};
