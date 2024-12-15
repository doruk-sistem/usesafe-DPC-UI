# Product Status Management

## Status Definitions

### DRAFT
- Initial state for new products
- Incomplete product information allowed
- Can transition to: NEW, DELETED

### NEW
- Active state for complete products
- All required fields must be present
- Can transition to: ARCHIVED, DELETED

### DELETED
- Terminal state for removed products
- Can transition to: NEW (with authorization)
- Records preserved for audit purposes

### ARCHIVED
- Terminal state for inactive products
- Read-only access
- No further transitions allowed

## Business Rules

1. Status Transitions
   - Products must start in DRAFT status
   - Only valid transitions are enforced
   - Each transition is logged with timestamp and user
   - Invalid transitions are rejected

2. Data Requirements
   - DRAFT: Minimal validation
   - NEW: Complete product information required
   - DELETED/ARCHIVED: Data preserved unchanged

3. Access Controls
   - Only authorized users can change status
   - ARCHIVED products are read-only
   - Status history is maintained

## Technical Implementation

1. Database Layer
   - Status stored as enumerated type
   - Transition validation via triggers
   - Status history stored as JSONB

2. Application Layer
   - Status validation in service layer
   - Transition logging and tracking
   - Access control enforcement

3. User Interface
   - Clear status indicators
   - Appropriate action availability
   - Status change confirmation

## Status Transition Matrix

```
From/To | DRAFT | NEW   | DELETED | ARCHIVED
--------|--------|-------|----------|----------
DRAFT   | -      | Yes   | Yes      | No
NEW     | No     | -     | Yes      | Yes
DELETED | No     | Yes   | -        | No
ARCHIVED| No     | No    | No       | -
```