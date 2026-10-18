/**
 * Generates Cloudinary SHA-1 upload signature for private/sensitive assets
 */
export async function generateCloudinarySignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const serialized = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&') + apiSecret;

  const msgBuffer = new TextEncoder().encode(serialized);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
