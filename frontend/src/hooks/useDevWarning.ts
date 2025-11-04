// hooks/useDevWarning.ts
import { useEnvironment } from '../contexts/EnvironmentContext';

export interface DevWarning {
  showWarning: boolean;
  devAnnouncement: {
    title: string;
    message: string;
    type: 'warning' | 'info' | 'error';
    issues?: string[];
  };
}

export const useDevWarning = (moduleName: string, issues: string[] = []): DevWarning => {
  const { isDevelopment, isStaging } = useEnvironment();
  
  const showWarning = isDevelopment || isStaging;
  
  const devAnnouncement = {
    title: `🚧 ${moduleName} - Dalam Pengembangan`,
    message: 'Fitur ini masih dalam tahap pengembangan dan belum ready untuk production.',
    type: 'warning' as const,
    issues
  };
  
  return { showWarning, devAnnouncement };
};