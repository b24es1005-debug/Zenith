type RequiredEnvKey = "DATABASE_URL" | "OPENWEATHER_API_KEY";

const googleAuthEnvKeys = ["AUTH_SECRET", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"] as const;

type AuthEnvKey =
  | "AUTH_SECRET"
  | "AUTH_GOOGLE_ID"
  | "AUTH_GOOGLE_SECRET"
  | "AUTH_GITHUB_ID"
  | "AUTH_GITHUB_SECRET";

function readRequiredEnv(key: RequiredEnvKey) {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const env = {
  DATABASE_URL: readRequiredEnv("DATABASE_URL"),
  OPENWEATHER_API_KEY: readRequiredEnv("OPENWEATHER_API_KEY"),
};

function readAuthEnv(key: AuthEnvKey) {
  return process.env[key]?.trim() ?? "";
}

export const authEnv = {
  AUTH_SECRET: readAuthEnv("AUTH_SECRET"),
  AUTH_GOOGLE_ID: readAuthEnv("AUTH_GOOGLE_ID"),
  AUTH_GOOGLE_SECRET: readAuthEnv("AUTH_GOOGLE_SECRET"),
  AUTH_GITHUB_ID: readAuthEnv("AUTH_GITHUB_ID"),
  AUTH_GITHUB_SECRET: readAuthEnv("AUTH_GITHUB_SECRET"),
};

export function validateAuthEnvironment() {
  for (const key of googleAuthEnvKeys) {
    if (!authEnv[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

export function hasGitHubAuthEnvironment() {
  return Boolean(authEnv.AUTH_GITHUB_ID && authEnv.AUTH_GITHUB_SECRET);
}