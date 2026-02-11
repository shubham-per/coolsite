/**
 * Environment Variable Validation
 * This file validates required environment variables at build/runtime
 * Import this at the top of your application entry point
 */

const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
] as const;

const optionalEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'GITHUB_TOKEN',
    'GITHUB_OWNER',
    'GITHUB_REPO',
] as const;

type RequiredEnvVar = typeof requiredEnvVars[number];
type OptionalEnvVar = typeof optionalEnvVars[number];

interface EnvValidationResult {
    valid: boolean;
    missing: string[];
    warnings: string[];
}

export function validateEnv(): EnvValidationResult {
    const missing: string[] = [];
    const warnings: string[] = [];

    // Check required env vars
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }

    // Check optional env vars and warn if missing
    for (const envVar of optionalEnvVars) {
        if (!process.env[envVar]) {
            warnings.push(`Optional: ${envVar} is not set`);
        }
    }

    return {
        valid: missing.length === 0,
        missing,
        warnings,
    };
}

/**
 * Call this function to validate environment variables
 * Throws an error if required variables are missing
 */
export function ensureEnv(): void {
    const result = validateEnv();

    if (!result.valid) {
        const errorMessage = `Missing required environment variables:\n${result.missing.map(v => `  - ${v}`).join('\n')}\n\nPlease check your .env.local file or environment configuration.`;
        throw new Error(errorMessage);
    }

    // Log warnings in development
    if (process.env.NODE_ENV === 'development' && result.warnings.length > 0) {
        console.warn('Environment warnings:', result.warnings);
    }
}

// Type-safe environment variable access
export function getEnv(key: RequiredEnvVar): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
}

export function getOptionalEnv(key: OptionalEnvVar): string | undefined {
    return process.env[key];
}
