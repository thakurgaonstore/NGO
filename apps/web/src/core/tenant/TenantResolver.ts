export interface TenantResolutionResult {
  tenantId: string | null;
  clientId: string | null;
  source: 'subdomain' | 'domain' | 'path' | 'query' | 'cache' | 'default';
  isSuperAdminPortal: boolean;
  isCustomDomainOrSubdomain: boolean;
  isPublicLanding: boolean;
  isPlatformHome: boolean;
  isTenantExplicitLogin: boolean;
  activePath: string;
}

export const DEFAULT_DEMO_TENANTS: Array<{
  id: string;
  clientId: string;
  subdomain: string;
  domain?: string;
  name: { en: string; bn: string };
}> = [
  {
    id: 'demo-jagorani',
    clientId: 'JAGORANI',
    subdomain: 'jagorani',
    domain: 'www.jagoranibd.org',
    name: {
      en: 'Jagorani Development Foundation',
      bn: 'জাগরণী উন্নয়ন ফাউন্ডেশন'
    }
  },
  {
    id: 'sheba-manobik',
    clientId: 'SHEBA',
    subdomain: 'sheba',
    domain: 'www.sheba-bd.org',
    name: {
      en: 'Sheba Manobik Unnayan Kendra',
      bn: 'সেবা মানবিক উন্নয়ন কেন্দ্র'
    }
  }
];

export class TenantResolver {
  private static CACHE_KEY = 'ngo_active_tenant_v1';
  private static DIRECTORY_CACHE_KEY = 'ngo_tenant_directory_cache';
  private static RESERVED_PATHS = ['mahinerp', 'superadmin', 'cerp', 'login', 'admin', 'api', 'home'];

  /**
   * Normalizes a domain name by removing protocol, www prefix, path and port
   */
  public static normalizeDomain(raw?: string | null): string {
    if (!raw) return '';
    return raw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split(':')[0];
  }

  /**
   * Checks if host belongs to default shared platform hosts
   */
  public static isPlatformDomain(host: string): boolean {
    const clean = this.normalizeDomain(host);
    if (!clean) return true;
    if (clean === 'localhost' || clean === '127.0.0.1') return true;
    if (clean.endsWith('.pages.dev')) return true;
    if (clean.endsWith('.web.app')) return true;
    if (clean.endsWith('.firebaseapp.com')) return true;
    return false;
  }

  /**
   * Resolves the current tenant identifier from the browser environment
   */
  public static resolveFromLocation(): TenantResolutionResult {
    const url = new URL(window.location.href);
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0] ? segments[0].toLowerCase() : '';
    const secondSegment = segments[1] ? segments[1].toLowerCase() : '';

    // Check for domain simulation in development/testing (?domain=www.jagoranibd.org or ?custom_domain=...)
    const simDomain = url.searchParams.get('custom_domain') ||
                      url.searchParams.get('domain') ||
                      url.searchParams.get('test_domain');
    const effectiveHost = simDomain ? simDomain.toLowerCase() : hostname;

    // 1. Is this explicitly the Super Admin portal? (/mahinerp or /superadmin or admin.*)
    const isSuperAdmin = pathname.startsWith('/mahinerp') ||
                         pathname.startsWith('/superadmin') ||
                         hostname.startsWith('admin.');

    if (isSuperAdmin) {
      return {
        tenantId: null,
        clientId: null,
        source: 'default',
        isSuperAdminPortal: true,
        isCustomDomainOrSubdomain: false,
        isPublicLanding: false,
        isPlatformHome: false,
        isTenantExplicitLogin: false,
        activePath: pathname
      };
    }

    // 2. Custom Domain Resolution (e.g. "www.jagoranibd.org" or "jagorani.org")
    // When an NGO has a custom domain:
    // - Root (domain/) directly displays their NGO public landing page (NO client ID needed!)
    // - /cerp or /login displays their staff ERP login
    const customTenant = this.findTenantByCustomDomain(effectiveHost);
    if (customTenant) {
      const isLogin = pathname.startsWith('/cerp') || pathname.startsWith('/login');
      return {
        tenantId: customTenant.id,
        clientId: customTenant.clientId,
        source: 'domain',
        isSuperAdminPortal: false,
        isCustomDomainOrSubdomain: true,
        isPublicLanding: !isLogin,
        isPlatformHome: false,
        isTenantExplicitLogin: isLogin,
        activePath: pathname
      };
    }

    // 3. Subdomain detection (e.g. "jagorani.ngoerp.xyz" or "jagorani.localhost")
    const parts = hostname.split('.');
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
    const isPagesDev = hostname.endsWith('.pages.dev');
    if (((isLocalhost && parts.length >= 2 && parts[0] !== 'localhost') || (!isLocalhost && parts.length >= 3)) && !isPagesDev) {
      const potentialSubdomain = parts[0];
      if (potentialSubdomain !== 'www' && potentialSubdomain !== 'app' && potentialSubdomain !== 'admin') {
        const tenantMatch = this.findRegisteredTenant(potentialSubdomain);
        const isLogin = pathname.startsWith('/cerp') || pathname.startsWith('/login');
        return {
          tenantId: tenantMatch ? tenantMatch.id : potentialSubdomain.toLowerCase(),
          clientId: tenantMatch ? tenantMatch.clientId : potentialSubdomain.toUpperCase(),
          source: 'subdomain',
          isSuperAdminPortal: false,
          isCustomDomainOrSubdomain: true,
          isPublicLanding: !isLogin,
          isPlatformHome: false,
          isTenantExplicitLogin: isLogin,
          activePath: pathname
        };
      }
    }

    // 4. Query parameter (?tenant=T1001 or ?tenant=jagorani or ?clientId=jagorani)
    const tenantParam = url.searchParams.get('tenant') || url.searchParams.get('clientId');
    if (tenantParam) {
      const tenantMatch = this.findRegisteredTenant(tenantParam);
      const finalId = tenantMatch ? tenantMatch.id : tenantParam.toLowerCase();
      const finalCode = tenantMatch ? tenantMatch.clientId : tenantParam.toUpperCase();
      this.cacheTenantId(finalId);
      const isLogin = pathname.startsWith('/cerp') || pathname.startsWith('/login');
      return {
        tenantId: finalId,
        clientId: finalCode,
        source: 'query',
        isSuperAdminPortal: false,
        isCustomDomainOrSubdomain: false,
        isPublicLanding: !isLogin,
        isPlatformHome: false,
        isTenantExplicitLogin: isLogin,
        activePath: pathname
      };
    }

    // 5. Path-based Client routing on shared platform: domain/:clientID (e.g., /jagorani, /JAGORANI, /sheba)
    if (firstSegment && !this.RESERVED_PATHS.includes(firstSegment)) {
      const tenantMatch = this.findRegisteredTenant(firstSegment);
      const finalId = tenantMatch ? tenantMatch.id : firstSegment.toLowerCase();
      const finalCode = tenantMatch ? tenantMatch.clientId : firstSegment.toUpperCase();
      this.cacheTenantId(finalId);

      const isSubLogin = secondSegment === 'login' || secondSegment === 'cerp';
      return {
        tenantId: finalId,
        clientId: finalCode,
        source: 'path',
        isSuperAdminPortal: false,
        isCustomDomainOrSubdomain: false,
        isPublicLanding: !isSubLogin,
        isPlatformHome: false,
        isTenantExplicitLogin: isSubLogin,
        activePath: pathname
      };
    }

    // 6. Explicit Generic Login (/cerp or /login) on Main Platform
    if (pathname.startsWith('/cerp') || pathname === '/login') {
      return {
        tenantId: null,
        clientId: null,
        source: 'default',
        isSuperAdminPortal: false,
        isCustomDomainOrSubdomain: false,
        isPublicLanding: false,
        isPlatformHome: false,
        isTenantExplicitLogin: true,
        activePath: pathname
      };
    }

    // 7. Root Domain '/' or '/home' on Main Platform (Cloudflare Pages or Platform Domain)
    // SHOW THE PLATFORM PROMOTIONAL WEBSITE!
    return {
      tenantId: null,
      clientId: null,
      source: 'default',
      isSuperAdminPortal: false,
      isCustomDomainOrSubdomain: false,
      isPublicLanding: false,
      isPlatformHome: true,
      isTenantExplicitLogin: false,
      activePath: pathname
    };
  }

  /**
   * Helper to look up a tenant in registered tenants by id, clientId, or subdomain
   */
  public static findRegisteredTenant(slug: string): { id: string; clientId: string } | null {
    const lowerSlug = slug.toLowerCase();
    try {
      const saved = localStorage.getItem('ngo_registered_tenants');
      const list = saved ? JSON.parse(saved) : DEFAULT_DEMO_TENANTS;
      const found = list.find(
        (t: any) =>
          t.id?.toLowerCase() === lowerSlug ||
          t.clientId?.toLowerCase() === lowerSlug ||
          t.subdomain?.toLowerCase() === lowerSlug
      );
      if (found) {
        return { id: found.id, clientId: found.clientId };
      }
    } catch {}

    const fallback = DEFAULT_DEMO_TENANTS.find(
      (t) =>
        t.id.toLowerCase() === lowerSlug ||
        t.clientId.toLowerCase() === lowerSlug ||
        t.subdomain.toLowerCase() === lowerSlug
    );
    if (fallback) {
      return { id: fallback.id, clientId: fallback.clientId };
    }
    return null;
  }

  /**
   * Checks if host/domain matches any NGO's custom domain
   */
  public static findTenantByCustomDomain(hostOrDomain: string): { id: string; clientId: string } | null {
    const cleanHost = this.normalizeDomain(hostOrDomain);
    if (!cleanHost) return null;

    // 1. Check registered tenants in localStorage
    try {
      const saved = localStorage.getItem('ngo_registered_tenants');
      const list = saved ? JSON.parse(saved) : DEFAULT_DEMO_TENANTS;
      for (const t of list) {
        if (t.domain && this.normalizeDomain(t.domain) === cleanHost) {
          return { id: t.id, clientId: t.clientId };
        }
        if (t.customDomain && this.normalizeDomain(t.customDomain) === cleanHost) {
          return { id: t.id, clientId: t.clientId };
        }
      }
    } catch {}

    // 2. Check directory cache
    try {
      const dir = this.getCachedDirectory();
      if (dir) {
        const tid = dir[cleanHost] || dir['www.' + cleanHost] || dir[hostOrDomain.toLowerCase()];
        if (tid) {
          const tenantMatch = this.findRegisteredTenant(tid);
          return {
            id: tenantMatch ? tenantMatch.id : tid.toLowerCase(),
            clientId: tenantMatch ? tenantMatch.clientId : tid.toUpperCase()
          };
        }
      }
    } catch {}

    // 3. Check stored tenant website configs in localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ngo_website_config_')) {
          const configJson = localStorage.getItem(key);
          if (configJson) {
            const parsed = JSON.parse(configJson);
            if (parsed.customDomain && this.normalizeDomain(parsed.customDomain) === cleanHost) {
              const matchedId = key.replace('ngo_website_config_', '');
              const tenantMatch = this.findRegisteredTenant(parsed.clientId || matchedId);
              return {
                id: tenantMatch ? tenantMatch.id : matchedId,
                clientId: tenantMatch ? tenantMatch.clientId : (parsed.clientId || matchedId.toUpperCase())
              };
            }
          }
        }
      }
    } catch {}

    // 4. Check fallback DEFAULT_DEMO_TENANTS
    for (const t of DEFAULT_DEMO_TENANTS) {
      if (t.domain && this.normalizeDomain(t.domain) === cleanHost) {
        return { id: t.id, clientId: t.clientId };
      }
    }

    return null;
  }

  public static cacheTenantId(tenantId: string) {
    localStorage.setItem(this.CACHE_KEY, tenantId);
  }

  public static clearTenantCache() {
    localStorage.removeItem(this.CACHE_KEY);
  }

  public static setCachedDirectory(dir: Record<string, string>) {
    localStorage.setItem(this.DIRECTORY_CACHE_KEY, JSON.stringify(dir));
  }

  public static getCachedDirectory(): Record<string, string> | null {
    try {
      const data = localStorage.getItem(this.DIRECTORY_CACHE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
