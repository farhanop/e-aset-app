// components/development/DevRoute.tsx
import React, { ReactNode } from 'react';
import { useFeatureFlag, FeatureFlagKey } from '../../contexts/FeatureFlagContext';
import { useAuth } from '../../contexts/AuthContext';
import DevAnnouncement from './DevAnnouncement';

interface DevRouteProps {
  children: ReactNode;
  feature: FeatureFlagKey;
  moduleName: string;
  releaseDate?: string;
  version?: string;
  issues?: string[];
  showToSuperAdmin?: boolean; // Tetap dipertahankan untuk konsistensi API
  hideWarningForSuperAdmin?: boolean;
}

const DevRoute: React.FC<DevRouteProps> = ({ 
  children, 
  feature, 
  moduleName, 
  releaseDate = 'Soon',
  version = '0.1.0',
  issues = [],
  showToSuperAdmin = true, // Tetap ada untuk dokumentasi
  hideWarningForSuperAdmin = false
}) => {
  const isEnabled = useFeatureFlag(feature);
  const { user } = useAuth();
  
  // Super admin selalu bisa melihat, meskipun feature flag disabled
  const isSuperAdmin = user?.role === 'super-admin';
  
  // Jika showToSuperAdmin = false, super admin tidak bisa melihat modul development
  const canSuperAdminAccess = isSuperAdmin && showToSuperAdmin;
  
  // If feature is enabled, show content without any warning
  if (isEnabled) {
    return <>{children}</>;
  }
  
  // If super admin can access and hideWarningForSuperAdmin is true, show content without warning
  if (canSuperAdminAccess && hideWarningForSuperAdmin) {
    return <>{children}</>;
  }
  
  // If super admin can access and hideWarningForSuperAdmin is false, show content with info banner
  if (canSuperAdminAccess && !hideWarningForSuperAdmin) {
    return (
      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                👑 Preview Development - {moduleName}
              </h3>
              <p className="text-blue-700 dark:text-blue-400 text-sm">
                Anda melihat modul dalam pengembangan sebagai Super Admin. 
                Modul ini belum tersedia untuk user lain.
              </p>
              {issues.length > 0 && (
                <div className="mt-3">
                  <p className="text-blue-600 dark:text-blue-500 text-sm font-medium mb-1">Catatan Development:</p>
                  <ul className="text-blue-600 dark:text-blue-500 text-sm list-disc list-inside space-y-1">
                    {issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-500">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded-full">v{version}</span>
                <span>Rilis: {releaseDate}</span>
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }
  
  // For other users or if super admin access is disabled, show warning and disabled content
  return (
    <div className="p-6">
      <DevAnnouncement 
        moduleName={moduleName}
        releaseDate={releaseDate}
        version={version}
        issues={issues}
      />
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    </div>
  );
};

export default DevRoute;