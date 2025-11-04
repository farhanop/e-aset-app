// frontend/src/utils/devLogger.ts
export type LogLevel = 'info' | 'warning' | 'error';
export type ModuleStatus = 'development' | 'alpha' | 'beta' | 'rc';

interface LogOptions {
  level?: LogLevel;
  status?: ModuleStatus;
  details?: Record<string, unknown>;
}

export const devLogger = {
  moduleWarning: (moduleName: string, options: LogOptions = {}) => {
    const { level = 'warning', status = 'development', details } = options;
    
    if (process.env.NODE_ENV === 'development') {
      const styles = {
        info: 'color: #007ACC; font-weight: bold; font-size: 14px;',
        warning: 'color: #FFA500; font-weight: bold; font-size: 14px;',
        error: 'color: #FF4444; font-weight: bold; font-size: 14px;'
      };

      // Definisikan fungsi logging yang aman
      const logMessage = (method: 'info' | 'warn' | 'error') => {
        const message = `%c🚧 ${moduleName} - ${status.toUpperCase()}`;
        const style = styles[level];
        
        switch (method) {
          case 'info':
            console.info(message, style);
            break;
          case 'warn':
            console.warn(message, style);
            break;
          case 'error':
            console.error(message, style);
            break;
        }
      };
      
      // Map level ke metode console
      switch (level) {
        case 'info':
          logMessage('info');
          break;
        case 'warning':
          logMessage('warn');
          break;
        case 'error':
          logMessage('error');
          break;
      }
      
      if (details) {
        console.log('Details:', details);
      }
    }
  }
};