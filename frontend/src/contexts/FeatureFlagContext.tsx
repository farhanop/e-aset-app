// contexts/FeatureFlagContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type FeatureFlagKey = 
  | 'assetLifecycleManager'
  | 'locationReports'
  | 'userManagement'
  | 'systemSettings'
  | 'qrCodeManagement'
  | 'qrGenerator'
  | 'reportsDashboard';

export interface FeatureFlags {
  assetLifecycleManager: boolean;
  locationReports: boolean;
  userManagement: boolean;
  systemSettings: boolean;
  qrCodeManagement: boolean;
  qrGenerator: boolean;
  reportsDashboard: boolean;
}

// Default flags - assetLifecycleManager di-set ke false agar defaultnya dalam mode development
const defaultFeatureFlags: FeatureFlags = {
  assetLifecycleManager: false, // Default false untuk menampilkan development warning
  locationReports: process.env.NODE_ENV === 'development',
  userManagement: process.env.NODE_ENV === 'development',
  systemSettings: process.env.NODE_ENV === 'development',
  qrCodeManagement: process.env.NODE_ENV === 'development',
  qrGenerator: process.env.NODE_ENV === 'development',
  reportsDashboard: process.env.NODE_ENV === 'development',
};

const FeatureFlagContext = createContext<FeatureFlags>(defaultFeatureFlags);

interface FeatureFlagProviderProps {
  children: ReactNode;
  flags?: Partial<FeatureFlags>;
}

// Custom hook untuk feature flags dengan auth logic
export const useFeatureFlags = () => {
  const { user } = useAuth();
  const defaultFlags = useContext(FeatureFlagContext);
  
  // Super admin bisa melihat semua modul development
  const isSuperAdmin = user?.role === 'super-admin';
  
  const featureFlags: FeatureFlags = {
    assetLifecycleManager: defaultFlags.assetLifecycleManager || isSuperAdmin,
    locationReports: defaultFlags.locationReports || isSuperAdmin,
    userManagement: defaultFlags.userManagement || isSuperAdmin,
    systemSettings: defaultFlags.systemSettings || isSuperAdmin,
    qrCodeManagement: defaultFlags.qrCodeManagement || isSuperAdmin,
    qrGenerator: defaultFlags.qrGenerator || isSuperAdmin,
    reportsDashboard: defaultFlags.reportsDashboard || isSuperAdmin,
  };
  
  return featureFlags;
};

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ 
  children, 
  flags = {} 
}) => {
  const featureFlags: FeatureFlags = {
    assetLifecycleManager: flags.assetLifecycleManager ?? defaultFeatureFlags.assetLifecycleManager,
    locationReports: flags.locationReports ?? defaultFeatureFlags.locationReports,
    userManagement: flags.userManagement ?? defaultFeatureFlags.userManagement,
    systemSettings: flags.systemSettings ?? defaultFeatureFlags.systemSettings,
    qrCodeManagement: flags.qrCodeManagement ?? defaultFeatureFlags.qrCodeManagement,
    qrGenerator: flags.qrGenerator ?? defaultFeatureFlags.qrGenerator,
    reportsDashboard: flags.reportsDashboard ?? defaultFeatureFlags.reportsDashboard,
  };

  return (
    <FeatureFlagContext.Provider value={featureFlags}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Update hook untuk include auth logic
export const useFeatureFlag = (feature: FeatureFlagKey): boolean => {
  const featureFlags = useFeatureFlags();
  return featureFlags[feature];
};