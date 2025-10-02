# Integration Guide: Date Selection and Court Slots Management

## Overview

This guide explains how to integrate the newly added date selection and court slots management functionality into your owner dashboard.

## What Was Added

### 1. API Layer (`owner/src/apiRequests/field.ts`)

Three new API methods for court slots management:

```typescript
sGetCourtSlotsByFieldId: (fieldId: string, date?: string) => Promise<CourtSlotsByField>
sMergeCourtSlots: (slotIds: number[]) => Promise<any>
sLockCourtSlots: (slotIds: number[]) => Promise<any>
```

### 2. React Query Hooks (`owner/src/queries/useField.tsx`)

Three new hooks for data fetching and mutations:

```typescript
useGetCourtSlotsByFieldId(id: string, date?: string)
useMergeCourtSlotsMutation()
useLockCourtSlotsMutation()
```

### 3. TypeScript Types (`owner/src/types/field.ts`)

New types for court slots data structure:

```typescript
CourtSlotsByField
CourtByField
CourtSlots
CourtSlotStatus (enum)
CourtStatus (enum)
FieldStatus (enum)
```

### 4. Example Component (`owner/src/app/(manage)/slots/`)

A complete implementation showing how to use all the features:
- `SlotsComponent.tsx` - Main component with date picker and slot management
- `page.tsx` - Demo page
- `README.md` - Detailed documentation

## Key Feature: Date Selection

### How It Works

The date selection is implemented using `react-datepicker` and `date-fns`:

```tsx
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useGetCourtSlotsByFieldId } from "@/queries/useField";

function MyComponent({ fieldId }: { fieldId: number }) {
  // 1. State for selected date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 2. Format date to YYYY-MM-DD for API
  const formatDateToYMD = (date: Date): string => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const dateString = formatDateToYMD(selectedDate);

  // 3. Fetch data with date parameter
  const { data, isLoading } = useGetCourtSlotsByFieldId(
    fieldId.toString(),
    dateString
  );

  // 4. Handle date changes
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      // Optionally clear any selections
    }
  };

  // 5. Render date picker
  return (
    <div>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="dd/MM/yyyy"
        locale={vi}
        minDate={new Date()}
      />
      {/* Display slots data */}
    </div>
  );
}
```

### Important Points

1. **Date Format**: The API expects dates in `YYYY-MM-DD` format
2. **Locale Support**: Use `vi` locale from `date-fns/locale` for Vietnamese
3. **Query Key**: The hook uses `["getCourtSlotsByFieldId", id, date]` as the query key
4. **Auto-refetch**: Data automatically refetches when the date changes
5. **Clear State**: Remember to clear any selections when the date changes

## Integration Steps

### Step 1: Install Dependencies

Already done! The following packages were added to `owner/package.json`:
- `date-fns` - For date formatting and manipulation
- `react-datepicker` - For date picker UI component
- `@types/react-datepicker` - TypeScript types

### Step 2: Import Required Hooks

```tsx
import {
  useGetCourtSlotsByFieldId,
  useMergeCourtSlotsMutation,
  useLockCourtSlotsMutation,
} from "@/queries/useField";
```

### Step 3: Use in Your Component

See the example in `owner/src/app/(manage)/slots/SlotsComponent.tsx` for a complete implementation.

### Step 4: Handle Mutations

```tsx
const mergeSlots = useMergeCourtSlotsMutation();
const lockSlots = useLockCourtSlotsMutation();

// Merge slots
mergeSlots.mutate([slotId1, slotId2], {
  onSuccess: () => {
    console.log("Slots merged successfully!");
  },
});

// Lock slots
lockSlots.mutate([slotId1], {
  onSuccess: () => {
    console.log("Slot locked successfully!");
  },
});
```

## Best Practices

1. **Date Validation**: Always validate that the selected date is not in the past
2. **Error Handling**: All mutations include error handling with toast notifications
3. **Loading States**: Use `isLoading` and `isPending` flags to show loading indicators
4. **Cache Invalidation**: Mutations automatically invalidate the query cache to refetch latest data
5. **Selection State**: Clear selection when date changes to avoid confusion

## Example Usage in FieldsTab

You could integrate this into the existing `FieldsTab` component by adding a "Manage Slots" button:

```tsx
<Button
  onClick={() => {
    // Navigate to slots page or open modal
    router.push(`/slots?fieldId=${field.id}`);
  }}
>
  Quản lý khung giờ
</Button>
```

## Testing

To test the implementation:

1. Navigate to `/slots` in your owner dashboard
2. Enter a field ID
3. Select a date
4. Observe the slots table populate with data
5. Try selecting and merging slots
6. Try locking slots

## API Endpoints

The implementation expects these endpoints to be available:

```
GET  /fields/{fieldId}/courts/slots?date={YYYY-MM-DD}
POST /court-slots/merge { slotIds: number[] }
POST /court-slots/lock { slotIds: number[] }
```

## Troubleshooting

### Date not updating
- Check that `formatDateToYMD` is correctly formatting the date
- Verify the API is receiving the date parameter

### Slots not merging
- Ensure slots are from the same court
- Verify slots are consecutive
- Check that slot IDs are correct

### Type errors
- Make sure all types are imported from `@/types/field`
- Check that `CourtSlotsByField` structure matches API response

## Next Steps

Consider adding:
- Unlock functionality
- Bulk operations
- Slot filtering by status
- Export functionality
- Mobile responsive design improvements
