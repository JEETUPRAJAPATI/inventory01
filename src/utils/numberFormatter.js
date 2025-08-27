/**
 * Utility functions for consistent number formatting
 */

export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return "0";
  }

  // Check if the number has a decimal part
  if (Number.isInteger(numValue)) {
    return numValue.toString(); // no decimals
  }

  return numValue.toFixed(decimals); // show decimals
};

export const formatCurrency = (value, currency = "₹", decimals = 2) => {
  const formattedNumber = formatNumber(value, decimals);
  return `${currency}${formattedNumber}`;
};

export const formatPercentage = (value, decimals = 2) => {
  const formattedNumber = formatNumber(value, decimals);
  return `${formattedNumber}%`;
};

export const parseAndFormat = (value, decimals = 2) => {
  return formatNumber(value, decimals);
};
