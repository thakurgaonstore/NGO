export type SystemRole = 'owner' | 'manager' | 'field_officer' | 'staff';

export type UserRole = SystemRole | string;

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';

export interface UserProfile {
  uid: string;
  tenantId: string;
  email: string;
  mobile: string;
  displayName: {
    en: string;
    bn: string;
  };
  roleId: UserRole;
  branchId?: string; // "all" or specific branch ID
  assignedAreaIds?: string[]; // IDs of villages, unions, or samities
  status: 'active' | 'inactive' | 'must_change_password';
  avatarUrl?: string;
  createdAt: number;
  lastLoginAt?: number;
}

export interface RoleDefinition {
  id: string;
  name: {
    en: string;
    bn: string;
  };
  description: {
    en: string;
    bn: string;
  };
  permissions: string[]; // e.g., ["members:view", "members:create", "vouchers:approve"]
  isSystem: boolean;
}

export interface AuthSession {
  uid: string;
  email: string;
  tenantId: string;
  role: UserRole;
  isSuperAdmin: boolean;
  profile?: UserProfile;
  permissions: string[];
}
