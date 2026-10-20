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

export class TenantResolver {
  private static CACHE_KEY = 'ngo_active_tenant_v1';
  private static DIRECTORY_CACHE_KEY = 'ngo_tenant_directory_cache';
  private static RESERVED_PATHS = ['mahinerp', 'superadmin', 'cerp', 'login', 'admin', 'api', 'home'];

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

    // 2. Custom domain lookup (e.g. "www.jagoranibd.org" or "jagorani.org")
    // Runs before path checks so a custom domain gets full tenant scope!
    const cachedDirectory = this.getCachedDirectory();
    if (cachedDirectory && (cachedDirectory[hostname] || cachedDirectory[hostname.replace(/^www\./, '')])) {
      const tid = cachedDirectory[hostname] || cachedDirectory[hostname.replace(/^www\./, '')];
      const tenantMatch = this.findRegisteredTenant(tid);
      const isLogin = pathname.startsWith('/cerp') || pathname.startsWith('/login');
      return {
        tenantId: tenantMatch ? tenantMatch.id : tid.toLowerCase(),
        clientId: tenantMatch ? tenantMatch.clientId : tid.toUpperCase(),
        source: 'domain',
        isSuperAdminPortal: false,
        isCustomDomainOrSubdomain: true,
        isPublicLanding: !isLogin,
        isPlatformHome: false,
        isTenantExplicitLogin: isLogin,
        activePath: pathname
      };
    }

    // Check stored tenant website configs in localStorage for matched customDomain
    const customDomainTenant = this.findTenantByCustomDomain(hostname);
    if (customDomainTenant) {
      const tenantMatch = this.findRegisteredTenant(customDomainTenant);
      const isLogin = pathname.startsWith('/cerp') || pathname.startsWith('/login');
      return {
        tenantId: tenantMatch ? tenantMatch.id : customDomainTenant.toLowerCase(),
        clientId: tenantMatch ? tenantMatch.clientId : customDomainTenant.toUpperCase(),
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
    if ((isLocalhost && parts.length >= 2 && parts[0] !== 'localhost') || (!isLocalhost && parts.length >= 3)) {
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

    // 5. Path-based Client routing: domain/:clientID (e.g., /jagorani, /JAGORANI, /sheba)
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

    // 6. Explicit Generic Login (/cerp or /login)
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
    try {
      const saved = localStorage.getItem('ngo_registered_tenants');
      if (saved) {
        const tenants: any[] = JSON.parse(saved);
        const lowerSlug = slug.toLowerCase();
        const found = tenants.find(
          (t) =>
            t.id?.toLowerCase() === lowerSlug ||
            t.clientId?.toLowerCase() === lowerSlug ||
            t.subdomain?.toLowerCase() === lowerSlug
        );
        if (found) {
          return { id: found.id, clientId: found.clientId };
        }
      }
    } catch {}
    return null;
  }

  private static findTenantByCustomDomain(hostname: string): string | null {
    try {
      const cleanHost = hostname.replace(/^www\./, '').toLowerCase();
      if (cleanHost === 'localhost' || cleanHost === '127.0.0.1') return null;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ngo_website_config_')) {
          const configJson = localStorage.getItem(key);
          if (configJson) {
            const parsed = JSON.parse(configJson);
            if (parsed.customDomain) {
              const cleanDomain = parsed.customDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
              if (cleanDomain === cleanHost) {
                return parsed.clientId || key.replace('ngo_website_config_', '');
              }
            }
          }
        }
      }
    } catch {
      // Ignore storage errors
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
