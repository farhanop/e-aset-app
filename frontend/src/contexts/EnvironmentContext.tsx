// contexts/EnvironmentContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';

interface EnvironmentContextType {
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  environment: 'development' | 'staging' | 'production';
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

interface EnvironmentProviderProps {
  children: ReactNode;
}

export const EnvironmentProvider: React.FC<EnvironmentProviderProps> = ({ children }) => {
  // Periksa apakah NODE_ENV adalah 'development', 'staging', atau 'production'
  // Jika tidak ada, default ke 'development'
  const nodeEnv = process.env.NODE_ENV || 'development';
  const environment = nodeEnv as 'development' | 'staging' | 'production';
  
  const value: EnvironmentContextType = {
    isDevelopment: environment === 'development',
    isStaging: environment === 'staging',
    isProduction: environment === 'production',
    environment,
  };

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = (): EnvironmentContextType => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};