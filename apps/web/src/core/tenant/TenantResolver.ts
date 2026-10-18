export interface TenantResolutionResult {
  tenantId: string | null;
  clientId: string | null;
  source: 'subdomain' | 'domain' | 'path' | 'query' | 'cache' | 'default';
  isSuperAdminPortal: boolean;
  isCustomDomainOrSubdomain: boolean;
  isPublicLanding: boolean;
  activePath: string;
}

export class TenantResolver {
  private static CACHE_KEY = 'ngo_active_tenant_v1';
  private static DIRECTORY_CACHE_KEY = 'ngo_tenant_directory_cache';
  private static RESERVED_PATHS = ['mahinerp', 'superadmin', 'cerp', 'login', 'admin', 'api'];

  /**
   * Resolves the current tenant identifier from the browser environment
   */
  public static resolveFromLocation(): TenantResolutionResult {
    const url = new URL(window.location.href);
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0] ? segments[0].toLowerCase() : '';

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
        activePath: pathname
      };
    }

    // 2. Query parameter (?tenant=T1001 or ?tenant=jagorani or ?clientId=jagorani)
    const tenantParam = url.searchParams.get('tenant') || url.searchParams.get('clientId');
    if (tenantParam) {
      this.cacheTenantId(tenantParam);
      return {
        tenantId: tenantParam.toLowerCase(),
        clientId: tenantParam.toUpperCase(),
        source: 'query',
        isSuperAdminPortal: false,
        isCustomDomainOrSubdomain: false,
        isPublicLanding: pathname === '/' || !this.RESERVED_PATHS.includes(firstSegment),
        activePath: pathname
      };
    }

    // 3. Path-based Client routing: domain/:clientID (e.g., /jagorani, /DEMO-JAGORANI, /sheba)
    if (firstSegment && !this.RESERVED_PATHS.includes(firstSegment)) {
      this.cacheTenantId(firstSegment);
      return {
        tenantId: firstSegment.toLowerCase(),
        clientId: firstSegment.toUpperCase(),
        source: 'path',
        isSuperAdminPortal: false,
        isCustomDomainOrSubdomain: false,
        isPublicLanding: true,
        activePath: pathname
      };
    }

    // 4. Custom domain lookup (e.g. "www.jagoranibd.org" or "jagorani.org")
    // Check directory cache
    const cachedDirectory = this.getCachedDirectory();
    if (cachedDirectory && (cachedDirectory[hostname] || cachedDirectory[hostname.replace(/^www\./, '')])) {
      const tid = cachedDirectory[hostname] || cachedDirectory[hostname.replace(/^www\./, '')];
      return {
        tenantId: tid.toLowerCase(),
        clientId: tid.toUpperCase(),
        source: 'domain',
        isSuperAdminPortal: false,
        isCustomDomainOrSubdomain: true,
        isPublicLanding: !pathname.startsWith('/cerp') && !pathname.startsWith('/login'),
        activePath: pathname
      };
    }

    // Check stored tenant website configs in localStorage for matched customDomain
    const customDomainTenant = this.findTenantByCustomDomain(hostname);
    if (customDomainTenant) {
      return {
        tenantId: customDomainTenant.toLowerCase(),
        clientId: customDomainTenant.toUpperCase(),
        source: 'domain',
        isSuperAdminPortal: false,
        isCustomDomainOrSubdomain: true,
        isPublicLanding: !pathname.startsWith('/cerp') && !pathname.startsWith('/login'),
        activePath: pathname
      };
    }

    // 5. Subdomain detection (e.g. "jagorani.ngoerp.xyz" or "jagorani.localhost")
    const parts = hostname.split('.');
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
    if ((isLocalhost && parts.length >= 2 && parts[0] !== 'localhost') || (!isLocalhost && parts.length >= 3)) {
      const potentialSubdomain = parts[0];
      if (potentialSubdomain !== 'www' && potentialSubdomain !== 'app' && potentialSubdomain !== 'admin') {
        return {
          tenantId: potentialSubdomain.toLowerCase(),
          clientId: potentialSubdomain.toUpperCase(),
          source: 'subdomain',
          isSuperAdminPortal: false,
          isCustomDomainOrSubdomain: true,
          isPublicLanding: !pathname.startsWith('/cerp') && !pathname.startsWith('/login'),
          activePath: pathname
        };
      }
    }

    // 6. LocalStorage cached tenant
    const cachedTenantId = localStorage.getItem(this.CACHE_KEY);
    const fallbackId = cachedTenantId || 'demo-jagorani';

    // If accessing root '/' and not explicitly /cerp or /login
    const isExplicitLogin = pathname.startsWith('/cerp') || pathname.startsWith('/login');

    return {
      tenantId: fallbackId.toLowerCase(),
      clientId: fallbackId.toUpperCase(),
      source: cachedTenantId ? 'cache' : 'default',
      isSuperAdminPortal: false,
      isCustomDomainOrSubdomain: false,
      isPublicLanding: !isExplicitLogin,
      activePath: pathname
    };
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
