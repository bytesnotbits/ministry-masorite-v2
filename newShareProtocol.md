>
> **Note: This document is deprecated.**
> 
> The file-based sharing protocol described below has been superseded by a new strategic direction for the project.
> 
> The plan is now to implement real-time data synchronization and sharing using **Firebase Firestore** as a backend. This approach will provide a more seamless, robust, and user-friendly collaboration experience.
> 
> For details on the new architecture, security model, and future plans, please refer to the **"Future Direction: Firebase Migration and Mobile App"** section in the main project context file: `/.claude/context.md`.

# Street Sharing Protocol Design

## Overview
Enable owners to share streets with helpers for collaborative territory work without requiring a backend. Uses JSON file exports/imports with conflict detection and merge capabilities.

## User Roles
- **Owner**: User 1 who owns the territory and initiates shares
- **Helper**: Users 2, 3, 4, etc. who work shared streets and return data to owner

## Core Requirements

### Permissions
- **Owners can:**
  - Share streets with helpers
  - Work on shared streets (own modifications tracked)
  - Merge returned work from helpers
  - Delete any records
  - Extend deadlines via re-share
  - Cancel share sessions

- **Helpers can:**
  - Add new houses, people, visits
  - Modify existing records (with warning confirmation)
  - Delete only records they created
  - Return work to owner (partial or complete)
  - View other helpers' names
  - **Cannot share streets with anyone except owner**

### Key Constraints
- Owner can work on shared streets (conflicts tracked)
- Deadline extensions require re-share (no remote update)
- File distribution uses OS native share API
- Helpers can see other helpers' names
- Owner cannot re-share while active shares exist (must merge or cancel first)
- Partial returns are allowed
- When helper returns incomplete work and wants to continue, owner must re-share updated version

## A. Database Schema Changes

### 1. Add to ALL Existing Records
Add these fields to: territories, streets, houses, people, visits, studies

```javascript
{
  uuid: "uuid-v4-string",           // Universal unique identifier
  createdAt: "2025-11-04T14:30:00Z", // ISO timestamp
  updatedAt: "2025-11-04T14:30:00Z", // ISO timestamp
  createdBy: "user-uuid",           // User identifier
  lastModifiedBy: "user-uuid"       // User identifier
}
```

### 2. New Store: userProfile
```javascript
{
  userName: "John Doe",    // Display name
  userUuid: "uuid-v4",     // Unique identifier
  createdAt: "timestamp"
}
```

### 3. Extend Street Object
```javascript
{
  // Existing fields...

  // New sharing fields:
  sharedStatus: null | "owner-shared" | "helper-working",
  ownerName: "John Doe",
  ownerUuid: "owner-uuid",
  helperNames: ["Jane Smith", "Bob Jones"],
  sharedAt: "2025-11-04T14:30:00Z",
  dueDate: "2025-11-11T23:59:59Z",
  shareVersion: 1,
  isReadOnly: false,

  shareHistory: [
    {
      shareVersion: 1,
      sharedAt: "2025-11-04T14:00:00Z",
      helpers: ["Jane", "Bob"],
      returns: [
        {
          helperUuid: "jane-uuid",
          helperName: "Jane",
          returnedAt: "2025-11-06T10:00:00Z",
          merged: true,
          mergedAt: "2025-11-06T14:00:00Z"
        }
      ],
      status: "active" | "completed" | "cancelled"
    }
  ]
}
```

## B. Export File Format

### Owner → Helper (Initial Share)
```json
{
  "exportMetadata": {
    "version": "1.0",
    "exportType": "street-share",
    "exportedAt": "2025-11-04T14:30:00Z",
    "exportedBy": "owner",
    "ownerName": "John Doe",
    "ownerUuid": "uuid-owner-123",
    "territoryNumber": "1-7",
    "streetName": "Alvin Dr",
    "streetUuid": "street-uuid-456",
    "shareVersion": 1,
    "dueDate": "2025-11-11T23:59:59Z",
    "helperNames": ["Jane Smith", "Bob Jones"]
  },
  "street": { /* street record with uuid */ },
  "houses": [ /* array of house records */ ],
  "people": [ /* array of people records */ ],
  "visits": [ /* array of visit records */ ],
  "studies": [ /* array of study records */ ]
}
```

### Helper → Owner (Return)
```json
{
  "exportMetadata": {
    "version": "1.0",
    "exportType": "street-return",
    "exportedAt": "2025-11-06T10:30:00Z",
    "exportedBy": "helper",
    "helperName": "Jane Smith",
    "helperUuid": "uuid-helper-456",
    "returnTo": "uuid-owner-123",
    "ownerName": "John Doe",
    "territoryNumber": "1-7",
    "streetName": "Alvin Dr",
    "streetUuid": "street-uuid-456",
    "shareVersion": 1,
    "summary": {
      "newHouses": 1,
      "newPeople": 2,
      "newVisits": 5,
      "modifiedHouses": 3,
      "modifiedPeople": 0
    }
  },
  "street": { /* updated street record */ },
  "houses": [ /* all houses including new and modified */ ],
  "people": [ /* all people including new and modified */ ],
  "visits": [ /* all visits including new */ ],
  "studies": [ /* all studies including new and modified */ ]
}
```

### Owner → Helper (Re-share / Update)
Same format as initial share but with incremented `shareVersion` and updated data.

## C. Workflows

### 1. Initial Setup (One-Time)
**First launch:**
- Modal: "Welcome! Please enter your name:"
- Input field for name
- System generates userUuid
- Saved to userProfile store
- Used for all createdBy/modifiedBy tracking going forward

### 2. Owner: Share Street

**UI Location:** StreetList or HouseList

**Flow:**
1. Click "Share Street" button
2. Modal opens:
   - Title: "Share Street: Alvin Dr"
   - Helper names input (multi-line textarea or comma-separated)
   - Due date picker (default: 7 days from now)
   - Optional notes field
3. Click "Generate Export"
4. System:
   - Validates all records have UUIDs (generate if missing)
   - Gathers street + all related data
   - Creates export JSON with metadata
   - Marks street in owner's DB:
     - `sharedStatus = "owner-shared"`
     - `shareVersion = 1`
     - Updates sharing fields
   - Suggests filename: `Territory_1-7_AlvinDr_Share_2025-11-04.json`
5. Share options dialog:
   - [Share via...] → Uses navigator.share() with file
   - [Download File] → Downloads JSON
   - [Copy Message] → Copies template message
6. Owner shares file with helpers (email, messenger, etc.)
7. StreetList shows indicator: "📤 Shared with Jane, Bob | Due Nov 11"

**Restrictions:**
- "Share Street" button disabled if `sharedStatus === "owner-shared"`
- Tooltip: "Merge or cancel outstanding shares before re-sharing"

### 3. Helper: Import Shared Street

**UI Location:** Settings page or hamburger menu → "Import Shared Street"

**Flow:**
1. Click "Import Shared Street"
2. File picker opens
3. Select JSON file
4. System validates:
   - Correct file format
   - exportType === "street-share"
   - Not expired (optional warning, not blocker)
5. Preview screen:
   - "Shared by: John Doe"
   - "Territory: 1-7, Street: Alvin Dr"
   - "Other helpers: Bob Jones"
   - "Due date: Nov 11, 2025"
   - "Contains: 12 houses, 3 people, 8 visits"
   - Warning if past due date
6. [Import] button
7. System:
   - Imports all records with UUIDs intact
   - Creates street in local DB with:
     - `sharedStatus = "helper-working"`
     - All sharing metadata from export
   - Adds to user's territory list
8. Success message + navigation to street
9. StreetList shows indicator: "📥 Helping John Doe | Due Nov 11"

**Update existing share (re-import):**
- If streetUuid already exists, detect version
- Show: "This is version 2. Update your copy?"
- If yes, overwrites with new data (owner's updates + merged changes)
- Preserves helper's own additions

### 4. Helper: Work the Street

**While working:**
- Can add houses, people, visits freely (normal workflow)
- All new records have:
  - `createdBy = helper's userUuid`
  - `createdAt` timestamp

**Modifying existing records (owner's or other helpers' data):**
- Show warning dialog: "This record was created by John Doe. Are you sure you want to modify it?"
- [Cancel] [Modify Anyway]
- If yes, update:
  - `lastModifiedBy = helper's userUuid`
  - `updatedAt` timestamp

**Deleting records:**
- Helper can only delete records where `createdBy === helper's userUuid`
- Delete button disabled on owner's records
- Tooltip: "Only the owner can delete this record"
- Visual cue: Owner's records have subtle indicator (e.g., small owner icon)

**UI indicators:**
- Banner at top: "📥 Helper Mode | Owner: John Doe | Due: Nov 11, 2025"
- Countdown as deadline approaches
- "Return to Owner" button always visible in header

**Export restrictions:**
- "Export Street" and "Share Street" options hidden/disabled
- Only "Return to Owner" available

### 5. Helper: Return to Owner

**UI Location:** Header button or street actions menu

**Flow:**
1. Click "Return to Owner"
2. Dialog shows summary:
   - "You added:"
     - 1 new house
     - 2 new people
     - 5 new visits
   - "You modified:"
     - 3 houses (show which ones)
3. [Generate Return File] button
4. System:
   - Creates return JSON with all data
   - Includes summary in metadata
   - Filename: `Territory_1-7_AlvinDr_RETURN_Jane_2025-11-06.json`
   - Marks local street as readonly (or prompts to)
5. Share dialog:
   - [Share with Owner] → navigator.share()
   - [Download File]
   - [Copy Message] → Template with owner's name
6. Helper sends file to owner
7. Optional: "Mark as read-only?" prompt
   - Prevents accidental edits after return

### 6. Owner: Merge Helper's Work

**UI Location:** Settings or hamburger menu → "Import Helper Work"

**Flow:**
1. Click "Import Helper Work"
2. File picker → Select return JSON
3. System validates:
   - exportType === "street-return"
   - returnTo matches owner's userUuid
   - streetUuid exists in owner's DB
   - Street is marked as shared
4. Analysis phase:
   - Compares helper's data vs owner's current data
   - Categorizes changes:
     - **New additions** (UUID not in owner's DB)
     - **Helper-only modifications** (helper modified, owner didn't)
     - **Conflicts** (both modified same record)
5. Merge preview screen:
   - Header: "Returned by Jane Smith on Nov 6, 2025"
   - **✓ New Additions (Auto-merge)**
     - 1 house: 410 Alvin Dr
     - 2 people: John Smith, Mary Jones
     - 5 visits
   - **⚠ Modifications (Review)**
     - House 402: Status changed NH → NI (expand for details)
     - Person 3: Phone number added
   - **❌ Conflicts (Must Resolve)**
     - House 505: Your version vs Jane's version (show details)
   - Buttons:
     - [Accept All] - Auto-merge everything, take helper's changes for non-conflicts
     - [Review Each] - Step through modifications
     - [Cancel Import]
6. If conflicts exist, must resolve before merging
7. After merge:
   - All new records added with their UUIDs
   - Modifications applied
   - Conflicts resolved per owner's choices
   - shareHistory updated with this return
   - Street remains in "owner-shared" status (others may still be working)
8. Success message: "Merged 5 visits, 2 people, 1 house from Jane"

**Conflict Resolution Flow:**
1. For each conflict, show side-by-side:
   ```
   House 402 Alvin Dr

   Your version (Nov 5, 3pm):     Jane's version (Nov 6, 10am):
   Status: NI                      Status: NH
   Notes: "No answer"              Notes: "Nobody home, try again"
   Modified: Nov 5 at 3:00pm       Modified: Nov 6 at 10:00am
   ```
2. Options:
   - [Keep Mine]
   - [Use Jane's]
   - [Edit Manually] → Opens edit form
3. After resolving all conflicts, proceed with merge
4. Can go back to review previous conflicts

### 7. Owner Working Shared Street

**Allowed but tracked:**
- Owner can modify anything as normal
- All changes tracked with `lastModifiedBy = owner's uuid`
- UI shows warning badge: "⚠️ Active Share - Changes may conflict with helpers"
- When modifying, tooltip: "Helper copies may become outdated"

**On merge:**
- Owner's changes compared against helper's
- Timestamp comparison determines conflicts
- Owner always wins ties in conflict resolution

### 8. Partial Returns & Re-sharing

**Scenario: Helper returns incomplete work, wants to continue**

**Flow:**
1. Jane returns work (Nov 6)
2. Owner merges (Nov 6)
3. shareHistory updated: Jane marked as returned & merged
4. Jane contacts owner: "Need to continue"
5. Owner goes to Shared Streets Manager
6. Sees: "Jane returned & merged. Bob still working."
7. Clicks "Re-share with Jane"
8. System:
   - Increments shareVersion to 2
   - Generates new export with current data (includes merged changes from all helpers)
   - Owner sends to Jane
9. Jane imports:
   - Detects existing streetUuid
   - Shows: "Updated version (v2) from John. Includes merged changes."
   - [Update] → Overwrites local copy
10. Jane continues working on v2

**Multi-helper coordination:**
- When Jane's return is merged, Bob's copy becomes outdated
- Owner sees notification: "⚠️ Bob is working on outdated version (v1)"
- Owner can:
  - Click "Send Update to Bob" → Generates v2 export for Bob
  - Wait for Bob to return, handle conflicts then
  - Close share session

### 9. Shared Streets Manager

**UI Location:** Hamburger menu → "Manage Shared Streets"

**Display for each shared street:**
```
Street: Alvin Dr (Territory 1-7)
Status: Active Share (v2)
Shared: Nov 4, 2025 | Due: Nov 11, 2025

Helpers:
✓ Jane Smith - Returned & Merged (Nov 6)
⏳ Bob Jones - Still working (not returned)

Actions:
[Send Update to Bob] - Bob's copy is outdated
[Extend Deadline] - Re-share with new date
[End Share Session]
[View Details]
```

**Actions:**
- **Send Update**: Generates new export with current data, increments version
- **Extend Deadline**: Opens re-share dialog with new date picker
- **End Share Session**:
  - Marks street as no longer shared locally
  - Warning: "Helpers' returns may conflict if they continue working"
  - Can't remotely invalidate helper copies (no backend)
- **View Details**: Shows full share history, all returns, conflicts resolved, etc.

### 10. Share Session Lifecycle

**States:**
- **Active**: Shared with helpers, not all have returned
- **Completed**: All helpers returned, all merges done, owner ended session
- **Cancelled**: Owner cancelled before completion

**Rules:**
- Cannot re-share while session is active
- Must either:
  - Merge all returns → Mark complete → Re-share fresh
  - Cancel session → Re-share fresh
- Each session tracked in shareHistory

## D. UI Components Needed

### New Components
1. **UserProfileSetup** - One-time modal for name entry
2. **ShareStreetModal** - Helper names, due date, notes
3. **ImportSharedStreetDialog** - File picker + preview
4. **ReturnToOwnerDialog** - Summary of changes + share options
5. **MergePreviewScreen** - Categorized changes with expand/collapse
6. **ConflictResolutionDialog** - Side-by-side comparison
7. **SharedStreetsManager** - List of all shared streets with status
8. **ShareStatusBadge** - Indicators on street lists
9. **HelperModeBanner** - Top banner when working shared street
10. **ModificationWarningDialog** - Confirm editing owner's records

### Modified Components
- **StreetList**: Add share indicators, disable share button when active
- **HouseList**: Add helper mode banner, "Return to Owner" button
- **HouseDetail**: Show record owner info, disable delete on owner's records
- **Settings**: Add import options, shared streets manager link

### Visual Indicators
- 📤 Owner has shared (blue)
- 📥 Helper is working (blue)
- ⚠️ Approaching deadline (yellow)
- ⏳ Still working indicator
- ✓ Returned & merged (green)
- 🔒 Read-only badge

## E. Merge Logic Rules

### Houses
1. Match by `uuid`
2. If UUID not in owner's DB → **New house** → Add it
3. If UUID exists:
   - Compare `updatedAt` timestamps
   - If only helper modified → Take helper's version (if owner approves in review)
   - If only owner modified → Keep owner's version
   - If both modified → **Conflict** → Must resolve

### People
- Same logic as houses
- Match by `uuid`
- New people: Add all
- Modifications: Timestamp comparison
- Conflicts: Owner resolves

### Visits
- **Always additive** (most important rule!)
- Match by `uuid` to prevent duplicates
- Add all visits from helper that don't exist in owner's DB
- Never overwrite visits
- Never delete visits during merge
- Sort by date after merge

### Studies
- Match by `uuid`
- New studies: Add
- Modifications: Timestamp comparison
- Conflicts: Owner resolves

### Deletions
- Helpers can only delete records where `createdBy === helper's uuid`
- These deletions only affect helper's local DB
- Owner never sees these (records never existed in owner's DB)
- Owner's deletions while street shared: Allowed, tracked
- If owner deletes what helper modified: Conflict? Or owner's deletion takes precedence?

### Conflict Resolution Priority
1. **Visits**: Always additive, no conflicts possible
2. **New additions**: Always accept, no conflicts
3. **Single-party modifications**: Accept the change (with review)
4. **Dual modifications**: Conflict → Owner decides:
   - Keep mine
   - Use theirs
   - Manual edit

## F. Validation & Safety

### Import Validations
1. ✓ File is valid JSON
2. ✓ Has required exportMetadata fields
3. ✓ exportType matches expected ("street-share" or "street-return")
4. ✓ Version compatibility
5. ✓ For returns: returnTo matches owner's uuid
6. ✓ For returns: streetUuid exists in owner's DB
7. ✓ All UUIDs are valid format
8. ⚠ Warning if past due date (not blocker)
9. ⚠ Warning if importing older version over newer

### Safety Features
1. **Auto-backup before merge**: Save complete DB state before any merge
2. **Undo last merge**: Rollback option (within session, before closing)
3. **Read-only after return**: Helper's copy locked after return
4. **Due date warnings**: Progressive notifications (3 days, 1 day, overdue)
5. **Conflict preview**: Owner sees everything before committing
6. **Version mismatch warnings**: Alert when importing outdated version
7. **Share session tracking**: Complete history of all shares and returns

### Data Integrity Checks
1. Validate all foreign key relationships after merge
2. Ensure no orphaned records
3. Verify visit counts match expectations
4. Check for duplicate UUIDs (shouldn't happen but validate)
5. Ensure timestamps are reasonable (not future, not ancient)

## G. Edge Cases & Solutions

### 1. Owner deletes street while helpers working
**Solution:** Lock deletion on shared streets
- "Delete Street" disabled if `sharedStatus === "owner-shared"`
- Must end share session first
- Prevents data loss and confusion

### 2. Owner deletes house/person while helper adds visits to it
**Problem:** Helper's visits reference deleted entity
**Solution:**
- Option A: Lock deletions on shared streets (recommended)
- Option B: On merge, if helper added data to deleted entity, show warning: "Jane added visits to house you deleted. Restore house?"

### 3. Helper loses file, needs re-export
**Solution:** Owner can regenerate from Shared Streets Manager
- "Resend to Helper" button
- Generates fresh export with current data
- May be different version than original

### 4. Multiple helpers return simultaneously
**Solution:** Owner merges sequentially
- Import one at a time
- Each merge updates the base data
- Second helper's merge compares against post-first-merge state
- May create conflicts where there weren't any originally

### 5. Helper imports wrong file (wrong street)
**Solution:** Validation catches this
- streetUuid mismatch
- Error: "This is for street X, but you're working on street Y"
- Doesn't allow import

### 6. Helper's device clock is wrong
**Problem:** Timestamps are unreliable
**Solution:**
- Warn if timestamps are way off (e.g., in future or >1 year in past)
- Owner can still merge but should be aware
- Not a blocker but logged

### 7. Helper returns multiple times
**Solution:** Allow unlimited returns
- Each return tracked in shareHistory
- Subsequent returns merge on top of previous merges
- Owner sees: "Jane's 2nd return"

### 8. Owner wants to extend deadline
**Solution:** Re-share workflow
- Generate new export with updated due date
- Increment version
- Send to helpers
- Helpers import to update

### 9. Helper continues working after return
**Solution:**
- Prompt helper to mark as read-only after return
- If they don't and keep working:
  - Can return again (second return)
  - Or wait for owner to re-share updated version

### 10. Version conflicts (helper on v1, owner already merged v2)
**Solution:**
- On import, compare shareVersion
- Warn helper: "You're importing v2 but working on v1. Your changes may conflict."
- Warn owner: "This return is based on v1 but current version is v2. Expect conflicts."
- Proceed with extra scrutiny in conflict resolution

## H. File Naming Conventions

### Owner → Helper (Share)
```
Territory_{territoryNum}_{streetName}_Share_{date}.json

Example:
Territory_1-7_AlvinDr_Share_2025-11-04.json
```

### Helper → Owner (Return)
```
Territory_{territoryNum}_{streetName}_RETURN_{helperName}_{date}.json

Example:
Territory_1-7_AlvinDr_RETURN_Jane_2025-11-06.json
```

### Owner → Helper (Re-share/Update)
```
Territory_{territoryNum}_{streetName}_Share_v{version}_{date}.json

Example:
Territory_1-7_AlvinDr_Share_v2_2025-11-07.json
```

## I. Notification Options (Without Backend)

### Primary: OS Share API
```javascript
if (navigator.share && navigator.canShare({ files: [file] })) {
  await navigator.share({
    files: [file],
    title: 'Territory Street Share',
    text: 'Shared street for ministry work'
  });
} else {
  // Fallback to download
  downloadFile(jsonBlob, filename);
}
```

**Testing needed:**
- iOS Safari
- Android Chrome
- Desktop browsers (limited support)

### Secondary: Message Template
After generating file, show copyable text:
```
Hi John,

I've finished working on Territory 1-7, Alvin Dr.

Summary of changes:
- Added 5 visits
- Added 2 new people
- Modified 3 house records

Attached is the return file: Territory_1-7_AlvinDr_RETURN_Jane_2025-11-06.json

- Jane
```

**UI:**
- [Copy Message] button
- Helper pastes into email/SMS/messenger
- Manually attaches file

### Tertiary: Email Integration (Optional)
```javascript
window.location.href = `mailto:owner@example.com?subject=${subject}&body=${body}`;
```
- Opens user's email client
- Pre-populated subject and body
- User manually attaches file
- Not ideal but works

### Future: Cloud Storage Integration
- Optional integration with Dropbox/Google Drive APIs
- Generate shareable link instead of file
- Requires API keys and more complexity
- Consider for v2

## J. Implementation Order (Suggested)

### Phase 1: Foundation
1. ✓ Add UUID generation utility
2. ✓ Add UserProfile store
3. ✓ Create UserProfileSetup component (one-time modal)
4. ✓ Add UUID, timestamps, createdBy fields to all stores
5. ✓ Update all create operations to populate new fields
6. ✓ Update all update operations to update timestamps/modifiedBy

### Phase 2: Export/Import Core
7. ✓ Create export utility (generate JSON with metadata)
8. ✓ Create import utility (parse and validate JSON)
9. ✓ Add shareStatus and sharing fields to street schema
10. ✓ Test basic export/import (one device → another device)

### Phase 3: Owner Share Flow
11. ✓ ShareStreetModal component
12. ✓ "Share Street" button in StreetList
13. ✓ Generate share export with all related data
14. ✓ Update street to "owner-shared" status
15. ✓ Share status indicators in UI
16. ✓ OS Share API integration + fallback download

### Phase 4: Helper Import & Work Flow
17. ✓ ImportSharedStreetDialog component
18. ✓ Import shared street functionality
19. ✓ Mark as "helper-working" status
20. ✓ Helper mode UI indicators (banner, badges)
21. ✓ Modification warning when editing owner's records
22. ✓ Delete restrictions on owner's records
23. ✓ Disable "Share Street" option for helpers

### Phase 5: Helper Return Flow
24. ✓ ReturnToOwnerDialog component
25. ✓ Generate return export with summary
26. ✓ Change tracking (what helper added/modified)
27. ✓ Mark helper's copy as readonly
28. ✓ "Return to Owner" button always visible in helper mode

### Phase 6: Owner Merge Flow
29. ✓ Import return file validation
30. ✓ Change analysis (new, modified, conflicts)
31. ✓ MergePreviewScreen component
32. ✓ Auto-merge non-conflicting changes
33. ✓ ConflictResolutionDialog component
34. ✓ Apply merge with conflict resolutions
35. ✓ Update shareHistory

### Phase 7: Advanced Features
36. ✓ SharedStreetsManager page
37. ✓ Share version tracking
38. ✓ Re-share functionality (extend deadline, send updates)
39. ✓ Multiple helper coordination (outdated version warnings)
40. ✓ Partial returns tracking
41. ✓ End share session functionality

### Phase 8: Polish & Safety
42. ✓ Auto-backup before merge
43. ✓ Undo merge functionality
44. ✓ Due date warnings and countdown
45. ✓ All edge case handling
46. ✓ Comprehensive validation
47. ✓ Error messages and help text
48. ✓ Testing with multiple users/devices

## K. Open Questions

### 1. Share Cancellation
**Question:** Should owner be able to "cancel" a share, or just wait until helpers return?

**Options:**
- A. Allow cancel → Marks local as unshared → Helper's return shows warning
- B. No cancel → Must wait for returns or manually end session
- C. Cancel → Generates "cancellation file" to send to helpers?

### 2. Outdated Helper Warnings
**Question:** When Bob tries to return but his version is outdated, should we warn him before he generates the file?

**Challenge:** Can't detect in helper's app that owner has newer version (no backend)

**Solutions:**
- Detect on owner's side during import → Show warning to owner
- Helper can't know until owner tells them
- Include last-modified timestamps in export so owner can see

### 3. Multiple Partial Returns Limit
**Question:** Should there be a limit on back-and-forth returns, or allow unlimited?

**Options:**
- Unlimited (current design)
- Limit to X returns per session (e.g., 5)
- No limit but warn if exceeding X

### 4. Merge Preferences
**Question:** Should we remember owner's conflict resolution preferences?

**Example:** "Always take helper's visit logs, always keep my house status changes"

**Benefit:** Speeds up merging with multiple helpers
**Challenge:** May not work for all conflicts

### 5. Share Session Naming
**Question:** Should owner be able to name share sessions for easier tracking?

**Examples:**
- "Saturday morning campaign"
- "November territory push"
- "Q4 2025 Alvin Drive"

**Benefit:** Easier to manage multiple share sessions
**Display:** Shows in Shared Streets Manager

### 6. Owner Working Shared Street
**Question:** Should we lock owner from making changes, or track conflicts?

**Current design:** Track conflicts (owner can work)

**Alternative:** Lock owner's edits with warning "This street is shared - wait for returns"

### 7. Due Date Enforcement
**Question:** What happens when due date passes?

**Options:**
- A. Helper's copy becomes read-only automatically (can't do without backend)
- B. Show prominent warnings but allow continued work
- C. Prevent return after due date (must contact owner for extension)
- D. Warning only, allow return anytime

**Current design:** Option B (warnings but not blocked)

### 8. Territory-Level Sharing
**Question:** Future feature or not needed?

**Use case:** Share entire territory with multiple helpers, each takes different streets

**Complexity:** Much more complex than street-level
**Decision:** Not in initial version, reassess later

## L. Technical Notes

### UUID Generation
Use `crypto.randomUUID()` (modern browsers) or fallback library

### Timestamp Format
ISO 8601: `new Date().toISOString()` → "2025-11-04T14:30:00.000Z"

### File Size Considerations
- Street with 100 houses + people + visits ≈ 50-200KB
- Should be fine for sharing via email/messenger
- If larger territories, may need compression or splitting

### Browser Compatibility
- Web Share API: Mobile browsers mostly, limited desktop
- Need fallback to download for universal support
- Test on: iOS Safari, Android Chrome, Desktop browsers

### IndexedDB Transactions
- Merge operations may be large (many records)
- Use transactions to ensure atomicity
- Rollback on error

### Performance
- Loading large returns may take time
- Show progress indicator during merge
- Consider worker threads for merge processing if needed

## M. Migration Strategy

### Existing Data
- Need to add UUIDs to all existing records
- One-time migration on app load after update
- Generate UUIDs for all records missing them
- Set createdBy to "unknown" or user's uuid (if single user)

### Backwards Compatibility
- Old exports won't have new fields
- Need version checking in import
- May not support sharing for old exports
- Clearly mark minimum version required

## N. Future Enhancements

1. **Cloud Storage Integration** - Auto-upload/download via Dropbox/Drive
2. **Territory-Level Sharing** - Share entire territories, not just streets
3. **Real-time Collaboration** (requires backend) - See changes live
4. **Commenting/Notes** - Helper can leave notes for owner
5. **Photo Attachments** - Include photos of houses/locations
6. **Offline Queue** - Queue returns when offline, send when online
7. **Share Templates** - Save common helper groups, due dates
8. **Statistics Dashboard** - Track productivity across shares
9. **Export History** - List of all past shares and returns
10. **Undo Multiple Steps** - Not just last merge, but several back

---

## Summary

This design enables collaborative territory work through JSON file sharing without requiring a backend. Key principles:

- **Owner controls everything** - Helpers assist but can't override
- **Conflicts are explicit** - Owner reviews and resolves
- **Visits are sacred** - Always additive, never lost
- **Version tracking** - Handles updates and partial returns
- **Safety first** - Validations, backups, warnings
- **User-friendly** - Clear indicators, helpful dialogs, smooth workflow

Next steps: Begin implementation with Phase 1 (Foundation).