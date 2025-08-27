
/**
 * Utility to help identify and update number formatting across the application
 * This script can be used to scan for hardcoded numbers that should use formatNumber
 */

import { formatNumber, formatCurrency, formatPercentage } from './numberFormatter.js';

// Common patterns for numbers that should be formatted
export const numberPatterns = {
  // Quantity displays
  quantity: /(\d+(\.\d+)?)\s*(kg|g|pieces?|pcs?|units?)/gi,
  
  // Currency displays  
  currency: /₹?\s*(\d+(\.\d+)?)/gi,
  
  // Percentage displays
  percentage: /(\d+(\.\d+)?)\s*%/gi,
  
  // Weight displays
  weight: /(\d+(\.\d+)?)\s*(kg|grams?)/gi,
  
  // Decimal numbers in tables/displays
  decimals: /\b\d+\.\d+\b/g,
  
  // Integer counts
  counts: /\b\d{3,}\b/g // Numbers with 3+ digits likely need formatting
};

// Helper functions for common formatting scenarios
export const formatters = {
  weight: (value, unit = 'kg') => `${formatNumber(value)} ${unit}`,
  quantity: (value, unit = 'pieces') => `${formatNumber(value)} ${unit}`,
  currency: (value) => formatCurrency(value),
  percentage: (value) => formatPercentage(value)
};

export default { numberPatterns, formatters };
