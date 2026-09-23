# Definition of Done

A change is considered complete when all applicable checks below are satisfied.

## Implementation

The requested behavior is completely implemented.

The solution uses existing application architecture unless there is a justified
reason to change it.

No parallel duplicate implementation has been introduced.

## Correctness

Relevant edge cases have been considered.

Safety-sensitive behavior fails safely.

Existing data remains compatible where required.

## Tests

Existing related tests pass.

New business rules have tests.

Bug fixes have regression tests when practical.

## Type Safety

TypeScript validation passes.

No unnecessary unsafe casts or `any` values were introduced.

## Database

Schema changes use a new migration.

Existing deployed migrations remain unchanged.

RLS has been reviewed.

Existing user data has been considered.

## UI

Relevant states are handled:

- loading
- error
- empty
- success

Android interaction remains correct.

## Performance

No obvious unnecessary database calls were introduced.

Query invalidation remains appropriately scoped.

## Security

No credentials or secrets were added to client-visible code.

## Cleanup

Temporary logs removed.

Dead implementation removed.

Unused imports removed.

Commented-out implementation removed unless intentionally retained.

## Verification

Applicable verification commands completed successfully.

Final `git diff` has been reviewed.

Unrelated user changes remain untouched.
