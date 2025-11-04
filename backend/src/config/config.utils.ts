// backend/src/config/config.utils.ts
export const getEnvVar = (key: string, defaultValue: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value;
};

export const getEnvVarNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    return defaultValue;
  }
  return parsed;
};