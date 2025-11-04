// types/development.ts
export interface ModuleInfo {
  name: string;
  version: string;
  status: 'development' | 'alpha' | 'beta' | 'stable';
  releaseDate: string;
  knownIssues: string[];
  dependencies: string[];
}

export interface DevConfig {
  showWarnings: boolean;
  enableExperimental: boolean;
  logLevel: 'none' | 'error' | 'warn' | 'all';
}