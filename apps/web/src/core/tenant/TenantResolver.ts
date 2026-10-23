import { isTenantDeleted } from './tenantCleanupService';

export interface TenantResolutionResult {
  tenantId: string | null;
  clientId: string | null;
  source: 'subdomain' | 'domain' | 'path' | 'query' | 'cache' | 'default';
  isSuperAdminPortal: boolean;
  isCustomDomainOrSubdomain: boolean;
  isPublicLanding: boolean;
  isPlatformHome: boolean;
  isTenantExplicitLogin: boolean;
  isTenantDeleted?: boolean;
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
   * Resolves tenant information based on window.location
   */
  public static resolveFromLocation(): TenantResolutionResult {
    const url = new URL(window.location.href);
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname;
    const pathSegments = pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0]?.toLowerCase();
    const secondSegment = pathSegments[1]?.toLowerCase();

    // Query domain override for testing (e.g. ?domain=jagorani.org)
    const queryDomain = url.searchParams.get('domain');
    const effectiveHost = queryDomain ? this.normalizeDomain(queryDomain) : hostname;

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
        if (isTenantDeleted(potentialSubdomain)) {
          return {
            tenantId: null,
            clientId: null,
            source: 'subdomain',
            isSuperAdminPortal: false,
            isCustomDomainOrSubdomain: true,
            isPublicLanding: false,
            isPlatformHome: false,
            isTenantExplicitLogin: false,
            isTenantDeleted: true,
            activePath: pathname
          };
        }
        const tenantMatch = this.findRegisteredTenant(potentialSubdomain);
        if (tenantMatch) {
          const isLogin = pathname.startsWith('/cerp') || pathname.startsWith('/login');
          return {
            tenantId: tenantMatch.id,
            clientId: tenantMatch.clientId,
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
    }

    // 4. Query parameter (?tenant=T1001 or ?tenant=jagorani or ?clientId=jagorani)
    const tenantParam = url.searchParams.get('tenant') || url.searchParams.get('clientId');
    if (tenantParam) {
      if (isTenantDeleted(tenantParam)) {
        return {
          tenantId: null,
          clientId: null,
          source: 'query',
          isSuperAdminPortal: false,
          isCustomDomainOrSubdomain: false,
          isPublicLanding: false,
          isPlatformHome: false,
          isTenantExplicitLogin: false,
          isTenantDeleted: true,
          activePath: pathname
        };
      }
      const tenantMatch = this.findRegisteredTenant(tenantParam);
      if (tenantMatch) {
        this.cacheTenantId(tenantMatch.id);
        const isLogin = pathname.startsWith('/cerp') || pathname.startsWith('/login');
        return {
          tenantId: tenantMatch.id,
          clientId: tenantMatch.clientId,
          source: 'query',
          isSuperAdminPortal: false,
          isCustomDomainOrSubdomain: false,
          isPublicLanding: !isLogin,
          isPlatformHome: false,
          isTenantExplicitLogin: isLogin,
          activePath: pathname
        };
      }
    }

    // 5. Path-based Client routing on shared platform: domain/:clientID (e.g., /jagorani, /JAGORANI, /sheba)
    if (firstSegment && !this.RESERVED_PATHS.includes(firstSegment)) {
      if (isTenantDeleted(firstSegment)) {
        return {
          tenantId: null,
          clientId: null,
          source: 'path',
          isSuperAdminPortal: false,
          isCustomDomainOrSubdomain: false,
          isPublicLanding: false,
          isPlatformHome: false,
          isTenantExplicitLogin: false,
          isTenantDeleted: true,
          activePath: pathname
        };
      }

      const tenantMatch = this.findRegisteredTenant(firstSegment);
      if (tenantMatch) {
        this.cacheTenantId(tenantMatch.id);
        const isSubLogin = secondSegment === 'login' || secondSegment === 'cerp';
        return {
          tenantId: tenantMatch.id,
          clientId: tenantMatch.clientId,
          source: 'path',
          isSuperAdminPortal: false,
          isCustomDomainOrSubdomain: false,
          isPublicLanding: !isSubLogin,
          isPlatformHome: false,
          isTenantExplicitLogin: isSubLogin,
          activePath: pathname
        };
      }
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
    if (!slug) return null;
    const lowerSlug = slug.toLowerCase();
    if (isTenantDeleted(lowerSlug)) {
      return null;
    }

    try {
      const saved = localStorage.getItem('ngo_registered_tenants');
      if (saved !== null) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          const found = list.find(
            (t: any) =>
              t.id?.toLowerCase() === lowerSlug ||
              t.clientId?.toLowerCase() === lowerSlug ||
              t.subdomain?.toLowerCase() === lowerSlug
          );
          if (found && !isTenantDeleted(found.id) && !isTenantDeleted(found.clientId) && !isTenantDeleted(found.subdomain)) {
            return { id: found.id, clientId: found.clientId };
          }
          // If registered_tenants exists, do NOT fall back to DEFAULT_DEMO_TENANTS!
          return null;
        }
      }
    } catch {}

    // Only if never initialized at all and not deleted:
    if (!localStorage.getItem('ngo_has_seeded_initial')) {
      const fallback = DEFAULT_DEMO_TENANTS.find(
        (t) =>
          !isTenantDeleted(t.id) &&
          !isTenantDeleted(t.clientId) &&
          !isTenantDeleted(t.subdomain) &&
          (t.id.toLowerCase() === lowerSlug ||
            t.clientId.toLowerCase() === lowerSlug ||
            t.subdomain.toLowerCase() === lowerSlug)
      );
      if (fallback) {
        return { id: fallback.id, clientId: fallback.clientId };
      }
    }
    return null;
  }

  /**
   * Checks if host/domain matches any NGO's custom domain
   */
  public static findTenantByCustomDomain(hostOrDomain: string): { id: string; clientId: string } | null {
    const cleanHost = this.normalizeDomain(hostOrDomain);
    if (!cleanHost || isTenantDeleted(cleanHost)) return null;

    // 1. Check registered tenants in localStorage
    try {
      const saved = localStorage.getItem('ngo_registered_tenants');
      if (saved !== null) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          for (const t of list) {
            if (isTenantDeleted(t.id) || isTenantDeleted(t.clientId) || isTenantDeleted(t.subdomain)) continue;
            if (t.domain && this.normalizeDomain(t.domain) === cleanHost) {
              return { id: t.id, clientId: t.clientId };
            }
            if (t.customDomain && this.normalizeDomain(t.customDomain) === cleanHost) {
              return { id: t.id, clientId: t.clientId };
            }
          }
          return null;
        }
      }
    } catch {}

    // 2. Check directory cache
    try {
      const dir = this.getCachedDirectory();
      if (dir) {
        const tid = dir[cleanHost] || dir['www.' + cleanHost] || dir[hostOrDomain.toLowerCase()];
        if (tid && !isTenantDeleted(tid)) {
          const tenantMatch = this.findRegisteredTenant(tid);
          if (tenantMatch) {
            return tenantMatch;
          }
        }
      }
    } catch {}

    // 3. Fallback demo domain (only if not deleted and never seeded)
    if (!localStorage.getItem('ngo_has_seeded_initial')) {
      const fallback = DEFAULT_DEMO_TENANTS.find(
        (t) =>
          !isTenantDeleted(t.id) &&
          !isTenantDeleted(t.clientId) &&
          t.domain &&
          this.normalizeDomain(t.domain) === cleanHost
      );
      if (fallback) {
        return { id: fallback.id, clientId: fallback.clientId };
      }
    }

    return null;
  }

  public static cacheTenantId(tenantId: string): void {
    if (tenantId && !isTenantDeleted(tenantId)) {
      localStorage.setItem(this.CACHE_KEY, tenantId);
    }
  }

  public static getCachedTenantId(): string | null {
    const cached = localStorage.getItem(this.CACHE_KEY);
    if (cached && isTenantDeleted(cached)) {
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    }
    return cached;
  }

  public static clearCachedTenantId(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }

  public static getCachedDirectory(): Record<string, string> {
    try {
      const raw = localStorage.getItem(this.DIRECTORY_CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  public static updateDirectoryCache(domain: string, tenantId: string): void {
    const dir = this.getCachedDirectory();
    dir[this.normalizeDomain(domain)] = tenantId;
    localStorage.setItem(this.DIRECTORY_CACHE_KEY, JSON.stringify(dir));
  }
}
