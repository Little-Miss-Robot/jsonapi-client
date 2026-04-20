export type ConfigValue = string | number | boolean;

export interface ConfigAttributes extends Record<string, ConfigValue> {
    baseUrl: string
    clientId: string
    clientSecret: string
    tokenExpirySafetyWindow?: number
    maxRetries?: number
    retryDelay?: number
}
