# Slots Management Component

This directory contains the slots management functionality for the owner dashboard.

## Features

### Date Selection
- Date picker using `react-datepicker` library
- Formatted with `date-fns` for proper Vietnamese locale support
- Automatically updates slot data when date changes
- Shows selected date in a user-friendly format

### Slot Operations

#### View Slots
- Displays all available, locked, and booked slots for a specific field
- Shows pricing information for each slot
- Color-coded status indicators:
  - Red: Locked slots
  - Blue: Selected slots
  - White: Available slots

#### Select Slots
- Toggle selection mode with "Chế độ chọn" button
- Click on slots to select/deselect them
- Selected slots are highlighted in blue
- Selection is cleared when changing dates

#### Merge Slots
- Select 2 or more consecutive slots from the same court
- Click "Gộp khung giờ" to merge them into a single time slot
- Validation:
  - Must select at least 2 slots
  - Slots must be from the same court
  - Slots must be consecutive (no gaps)

#### Lock Slots
- Select one or more slots
- Click "Khóa" to lock the selected slots
- Locked slots cannot be booked by users
- Useful for maintenance or special events

## Usage

### Basic Implementation

```tsx
import { SlotsComponent } from "./SlotsComponent";

export default function MyPage() {
  const fieldId = 1; // Your field ID

  return <SlotsComponent fieldId={fieldId} />;
}
```

### Using the Hook Directly

If you want to build your own UI, you can use the hooks directly:

```tsx
import { useGetCourtSlotsByFieldId } from "@/queries/useField";
import { format } from "date-fns";

function MyCustomComponent({ fieldId }: { fieldId: number }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateString = format(selectedDate, "yyyy-MM-dd");

  const { data, isLoading } = useGetCourtSlotsByFieldId(
    fieldId.toString(),
    dateString
  );

  // Your custom UI here
}
```

### Using Mutation Hooks

```tsx
import {
  useMergeCourtSlotsMutation,
  useLockCourtSlotsMutation,
} from "@/queries/useField";

function MyComponent() {
  const mergeSlots = useMergeCourtSlotsMutation();
  const lockSlots = useLockCourtSlotsMutation();

  const handleMerge = (slotIds: number[]) => {
    mergeSlots.mutate(slotIds, {
      onSuccess: () => {
        // Handle success
      },
    });
  };

  const handleLock = (slotIds: number[]) => {
    lockSlots.mutate(slotIds, {
      onSuccess: () => {
        // Handle success
      },
    });
  };
}
```

## API Integration

### Get Court Slots
```typescript
GET /fields/{fieldId}/courts/slots?date=YYYY-MM-DD
```

Returns court slots for a specific field and date.

### Merge Court Slots
```typescript
POST /court-slots/merge
Body: { slotIds: number[] }
```

Merges multiple consecutive slots into one.

### Lock Court Slots
```typescript
POST /court-slots/lock
Body: { slotIds: number[] }
```

Locks slots to prevent booking.

## Types

```typescript
export type CourtSlotsByField = {
  id: number;
  name: string;
  monthLimit: number;
  minBookingMinutes: number;
  status: FieldStatus;
  openTime: string;
  closeTime: string;
  courts: CourtByField[];
};

export type CourtByField = {
  id: number;
  name: string;
  status: CourtStatus;
  slots: CourtSlots[];
};

export type CourtSlots = {
  id: number;
  startTime: string;
  endTime: string;
  status: CourtSlotStatus;
  isMerge: boolean;
  price: number;
};

export enum CourtSlotStatus {
  PAID = "PAID",
  LOCK = "LOCK",
  HOLD = "HOLD",
  AVAILABLE = "AVAILABLE",
}
```

## Dependencies

- `react-datepicker` - Date picker component
- `date-fns` - Date formatting and manipulation
- `@tanstack/react-query` - Data fetching and caching
- `lucide-react` - Icons

## Notes

- The component automatically refetches data when:
  - Date changes
  - Merge operation succeeds
  - Lock operation succeeds
- All operations show toast notifications for success/error states
- Selection is automatically cleared after successful operations
