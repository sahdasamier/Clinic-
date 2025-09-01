# Lab Workflow Integration

This document explains how to integrate the Lab workflow with the existing Patient page.

## Integration Function

The Lab feature provides a single integration function that the Patient page can call:

```typescript
createAndOpenLabOrder(orderDraft: OrderDraft): void
```

## Usage

1. Import the function in your Patient page component:
```typescript
import { createAndOpenLabOrder } from '@features/lab/labIntegration';
```

2. When the user clicks "Send to Lab", create an OrderDraft object and call the function:
```typescript
const handleSendToLab = () => {
  const orderDraft = {
    patient: {
      id: patient.id, // optional
      name: patient.name,
      age: patient.age,
      phone: patient.phone
    },
    items: [
      {
        description: "Complete Blood Count",
        modality: "lab",
        priority: "routine"
      },
      {
        description: "Chest X-ray",
        modality: "radiology",
        priority: "urgent"
      }
    ]
  };
  
  createAndOpenLabOrder(orderDraft);
};
```

## Data Flow

1. The Patient page calls `createAndOpenLabOrder` with an `OrderDraft`
2. The function normalizes the data to the internal `Order` format
3. The order is persisted to localStorage via the Orders store
4. The user is navigated to `/lab/:orderId` to view and manage the order

## Data Shapes

### OrderDraft (from Patient page)
```typescript
{
  patient: { 
    id?: string, 
    name: string, 
    age: number, 
    phone: string 
  },
  items: Array<{ 
    description: string, 
    modality: 'lab'|'radiology', 
    priority?: 'routine'|'urgent' 
  }>
}
```

### Order (internal)
```typescript
{
  id: string,
  patient: { 
    id: string, 
    name: string, 
    age: number, 
    phone: string 
  },
  items: Array<{ 
    id: string, 
    description: string, 
    modality: 'lab'|'radiology', 
    priority?: 'routine'|'urgent', 
    done?: boolean 
  }>,
  status: 'draft'|'sentToLab'|'inProgress'|'completed',
  createdAt: string // ISO
}
```