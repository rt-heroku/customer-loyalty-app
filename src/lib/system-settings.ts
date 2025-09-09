import { query } from '@/lib/db';

/**
 * Global system settings utility functions
 * These functions provide easy access to system settings from anywhere in the application
 */

export interface SystemSettingOptions {
  description?: string;
  category?: 'general' | 'pos' | 'loyalty' | 'inventory' | 'email' | 'integration' | 'chat';
  user?: string;
}

/**
 * Get a system setting value by key
 * @param key - The setting key to retrieve
 * @returns The setting value or null if not found
 */
export async function getSystemSetting(key: string): Promise<string | null> {
  try {
    const result = await query(
      'SELECT get_system_setting($1) as value',
      [key]
    );
    
    return result.rows[0]?.value || null;
  } catch (error) {
    console.error(`Error getting system setting '${key}':`, error);
    return null;
  }
}

/**
 * Get a system setting value with a default fallback
 * @param key - The setting key to retrieve
 * @param defaultValue - Default value if setting is not found
 * @returns The setting value or the default value
 */
export async function getSystemSettingWithDefault(
  key: string, 
  defaultValue: string
): Promise<string> {
  try {
    const result = await query(
      'SELECT get_system_setting_or_default($1, $2) as value',
      [key, defaultValue]
    );
    
    return result.rows[0]?.value || defaultValue;
  } catch (error) {
    console.error(`Error getting system setting '${key}' with default:`, error);
    return defaultValue;
  }
}

/**
 * Set a system setting value
 * @param key - The setting key to set
 * @param value - The value to set
 * @param options - Additional options for the setting
 * @returns True if successful, false otherwise
 */
export async function setSystemSetting(
  key: string, 
  value: string, 
  options: SystemSettingOptions = {}
): Promise<boolean> {
  try {
    const {
      description = null,
      category = 'general',
      user = 'system'
    } = options;

    const result = await query(
      'SELECT set_system_setting($1, $2, $3, $4, $5) as success',
      [key, value, description, category, user]
    );
    
    return result.rows[0]?.success || false;
  } catch (error) {
    console.error(`Error setting system setting '${key}':`, error);
    return false;
  }
}

/**
 * Get multiple system settings by category
 * @param category - The category to filter by
 * @returns Array of settings in the category
 */
export async function getSystemSettingsByCategory(
  category: string
): Promise<Array<{ key: string; value: string; description?: string }>> {
  try {
    const result = await query(
      `SELECT setting_key as key, setting_value as value, description
       FROM system_settings 
       WHERE category = $1 AND is_active = true
       ORDER BY setting_key`,
      [category]
    );
    
    return result.rows;
  } catch (error) {
    console.error(`Error getting system settings for category '${category}':`, error);
    return [];
  }
}

/**
 * Get all system settings
 * @returns Array of all active settings
 */
export async function getAllSystemSettings(): Promise<Array<{
  key: string;
  value: string;
  description?: string;
  category: string;
  type: string;
}>> {
  try {
    const result = await query(
      `SELECT setting_key as key, setting_value as value, description, category, setting_type as type
       FROM system_settings 
       WHERE is_active = true
       ORDER BY category, setting_key`
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error getting all system settings:', error);
    return [];
  }
}

/**
 * Delete a system setting
 * @param key - The setting key to delete
 * @returns True if successful, false otherwise
 */
export async function deleteSystemSetting(key: string): Promise<boolean> {
  try {
    const result = await query(
      'UPDATE system_settings SET is_active = false WHERE setting_key = $1',
      [key]
    );
    
    return result.rowCount > 0;
  } catch (error) {
    console.error(`Error deleting system setting '${key}':`, error);
    return false;
  }
}

/**
 * Check if a system setting exists
 * @param key - The setting key to check
 * @returns True if the setting exists and is active
 */
export async function systemSettingExists(key: string): Promise<boolean> {
  try {
    const result = await query(
      'SELECT 1 FROM system_settings WHERE setting_key = $1 AND is_active = true LIMIT 1',
      [key]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error checking if system setting '${key}' exists:`, error);
    return false;
  }
}

/**
 * Get system setting as a specific type
 * @param key - The setting key to retrieve
 * @param type - The expected type ('string', 'number', 'boolean', 'json')
 * @param defaultValue - Default value if setting is not found or invalid
 * @returns The setting value converted to the specified type
 */
export async function getSystemSettingAsType<T>(
  key: string,
  type: 'string' | 'number' | 'boolean' | 'json',
  defaultValue: T
): Promise<T> {
  try {
    const value = await getSystemSetting(key);
    
    if (value === null) {
      return defaultValue;
    }
    
    switch (type) {
      case 'string':
        return value as T;
      
      case 'number':
        const numValue = parseFloat(value);
        return (isNaN(numValue) ? defaultValue : numValue) as T;
      
      case 'boolean':
        return (value.toLowerCase() === 'true') as T;
      
      case 'json':
        try {
          return JSON.parse(value) as T;
        } catch {
          return defaultValue;
        }
      
      default:
        return defaultValue;
    }
  } catch (error) {
    console.error(`Error getting system setting '${key}' as type '${type}':`, error);
    return defaultValue;
  }
}

/**
 * Set system setting with type validation
 * @param key - The setting key to set
 * @param value - The value to set
 * @param type - The type of the value
 * @param options - Additional options for the setting
 * @returns True if successful, false otherwise
 */
export async function setSystemSettingWithType(
  key: string,
  value: any,
  type: 'string' | 'number' | 'boolean' | 'json',
  options: SystemSettingOptions = {}
): Promise<boolean> {
  try {
    let stringValue: string;
    
    switch (type) {
      case 'string':
        stringValue = String(value);
        break;
      
      case 'number':
        stringValue = String(Number(value));
        break;
      
      case 'boolean':
        stringValue = String(Boolean(value));
        break;
      
      case 'json':
        stringValue = JSON.stringify(value);
        break;
      
      default:
        stringValue = String(value);
    }
    
    return await setSystemSetting(key, stringValue, {
      ...options,
      description: options.description || `Setting of type ${type}`
    });
  } catch (error) {
    console.error(`Error setting system setting '${key}' with type '${type}':`, error);
    return false;
  }
}

// Common system setting keys for type safety
export const SYSTEM_SETTING_KEYS = {
  // General
  COMPANY_NAME: 'company_name',
  CURRENCY_SYMBOL: 'currency_symbol',
  CURRENCY_CODE: 'currency_code',
  DATE_FORMAT: 'date_format',
  TIME_FORMAT: 'time_format',
  
  // POS
  TAX_INCLUSIVE: 'tax_inclusive',
  DEFAULT_TAX_RATE: 'default_tax_rate',
  
  // Loyalty
  POINTS_PER_DOLLAR: 'points_per_dollar',
  POINTS_REDEMPTION_RATE: 'points_redemption_rate',
  
  // Inventory
  LOW_STOCK_THRESHOLD: 'low_stock_threshold',
  
  // Chat
  CHAT_ENABLED: 'chat_enabled',
  CHAT_API_URL: 'chat_api_url',
  CHAT_FLOATING_BUTTON: 'chat_floating_button',
  CHAT_MAX_FILE_SIZE: 'chat_max_file_size',
  CHAT_ALLOWED_FILE_TYPES: 'chat_allowed_file_types',
  CHAT_TYPING_INDICATOR_DELAY: 'chat_typing_indicator_delay',
  CHAT_MESSAGE_RETRY_ATTEMPTS: 'chat_message_retry_attempts',
  CHAT_SESSION_TIMEOUT: 'chat_session_timeout',
} as const;

// Type for system setting keys
export type SystemSettingKey = typeof SYSTEM_SETTING_KEYS[keyof typeof SYSTEM_SETTING_KEYS];

/**
 * Initialize default system settings if they don't exist
 * This should be called during application startup
 */
export async function initializeDefaultSettings(): Promise<void> {
  const defaultSettings = [
    // General settings
    { key: SYSTEM_SETTING_KEYS.COMPANY_NAME, value: 'Customer Loyalty App', category: 'general' },
    { key: SYSTEM_SETTING_KEYS.CURRENCY_SYMBOL, value: '$', category: 'general' },
    { key: SYSTEM_SETTING_KEYS.CURRENCY_CODE, value: 'USD', category: 'general' },
    { key: SYSTEM_SETTING_KEYS.DATE_FORMAT, value: 'MM/DD/YYYY', category: 'general' },
    { key: SYSTEM_SETTING_KEYS.TIME_FORMAT, value: '12h', category: 'general' },
    
    // POS settings
    { key: SYSTEM_SETTING_KEYS.TAX_INCLUSIVE, value: 'false', category: 'pos' },
    { key: SYSTEM_SETTING_KEYS.DEFAULT_TAX_RATE, value: '0.08', category: 'pos' },
    
    // Loyalty settings
    { key: SYSTEM_SETTING_KEYS.POINTS_PER_DOLLAR, value: '1', category: 'loyalty' },
    { key: SYSTEM_SETTING_KEYS.POINTS_REDEMPTION_RATE, value: '100', category: 'loyalty' },
    
    // Inventory settings
    { key: SYSTEM_SETTING_KEYS.LOW_STOCK_THRESHOLD, value: '5', category: 'inventory' },
    
    // Chat settings
    { key: SYSTEM_SETTING_KEYS.CHAT_ENABLED, value: 'true', category: 'chat' },
    { key: SYSTEM_SETTING_KEYS.CHAT_API_URL, value: 'https://your-mulesoft-api.com/chat/v1/messages', category: 'chat' },
    { key: SYSTEM_SETTING_KEYS.CHAT_FLOATING_BUTTON, value: 'true', category: 'chat' },
    { key: SYSTEM_SETTING_KEYS.CHAT_MAX_FILE_SIZE, value: '10485760', category: 'chat' },
    { key: SYSTEM_SETTING_KEYS.CHAT_ALLOWED_FILE_TYPES, value: 'image/jpeg,image/png,image/gif,application/pdf,text/plain', category: 'chat' },
    { key: SYSTEM_SETTING_KEYS.CHAT_TYPING_INDICATOR_DELAY, value: '1000', category: 'chat' },
    { key: SYSTEM_SETTING_KEYS.CHAT_MESSAGE_RETRY_ATTEMPTS, value: '3', category: 'chat' },
    { key: SYSTEM_SETTING_KEYS.CHAT_SESSION_TIMEOUT, value: '3600000', category: 'chat' },
  ];
  
  for (const setting of defaultSettings) {
    const exists = await systemSettingExists(setting.key);
    if (!exists) {
      await setSystemSetting(setting.key, setting.value, {
        category: setting.category as any,
        description: `Default ${setting.category} setting`
      });
    }
  }
}
