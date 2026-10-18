import React from 'react';
import { useCan } from './useCan';

interface ProtectProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Protect: React.FC<ProtectProps> = ({ permission, fallback = null, children }) => {
  const { can } = useCan();

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
