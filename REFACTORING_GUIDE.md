
# Number Formatting Refactoring Guide

This guide outlines the systematic approach to ensure all numerical values in the application use the `formatNumber` utility for consistency.

## Files Updated

### Core Utilities
- ✅ `src/utils/numberFormatter.js` - Main formatting functions
- ✅ `src/utils/updateNumberFormatting.js` - Helper patterns and formatters

### PDF Generation
- ✅ `src/utils/pdfGenerator.js` - Import added
- ✅ `src/utils/pdfFinishedProduct.js` - Import added

### Components
- ✅ `src/pages/admin/delivery/components/DeliveryStats.jsx` - Statistics formatted
- ✅ `src/components/landing/ContactSection.jsx` - Import added
- ✅ `src/pages/inventory/FinishedProducts.jsx` - Import added

## Remaining Files to Update

### High Priority (Display Numbers)
1. `src/components/dashboard/SummaryCard.jsx`
2. `src/components/delivery/DeliveryTable.jsx`
3. `src/components/inventory/reports/ReportSummary.jsx`
4. `src/pages/inventory/PackagingManagement.jsx`
5. `src/pages/inventory/RawMaterials.jsx`
6. `src/components/production/ProductionMetrics.jsx`

### Medium Priority (Form Values)
1. `src/components/inventory/forms/FinishedProductForm.jsx`
2. `src/components/delivery/DeliveryForm.jsx`
3. `src/components/sales/orders/OrderForm.jsx`

### Low Priority (Data Display)
1. All table components in `src/components/`
2. All dashboard pages in `src/pages/`
3. All report components

## Usage Patterns

### For Quantities (with units)
```javascript
import { formatNumber } from '../../utils/numberFormatter.js';

// Before: "1000 kg"
// After: `${formatNumber(1000)} kg`
```

### For Currency
```javascript
import { formatCurrency } from '../../utils/numberFormatter.js';

// Before: "₹1500.50"
// After: formatCurrency(1500.50)
```

### For Display Values
```javascript
import { formatNumber } from '../../utils/numberFormatter.js';

// Before: value={product.quantity}
// After: value={formatNumber(product.quantity)}
```

## Search Patterns

Use these patterns to find numbers that need formatting:
- `/\d+\.\d+/g` - Decimal numbers
- `/\d{3,}/g` - Large integers (3+ digits)
- `/₹\s*\d+/g` - Currency values
- `/\d+\s*(kg|g|pieces)/gi` - Quantities with units

## Next Steps

1. Run through each component file
2. Look for hardcoded numbers or unformatted values
3. Import formatNumber/formatCurrency as needed
4. Replace raw values with formatted ones
5. Test display consistency across the application
