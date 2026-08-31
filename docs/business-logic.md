# Business Logic

## Pre-service reminder

For the strict current-day implementation:

- campaign date must equal today's date in `Africa/Lagos`;
- reminder status must not be `Sent`;
- current time must fall inside the configured pre-service window.

## Post-service email

- campaign date must equal today's date;
- `Post-Service Ready` must equal `Ready`;
- `Post-Service Sent At` must be empty;
- current time must be at or after the service time.

## Advance reminder

The source workflow supports a tomorrow-facing advance reminder. It is intentionally disabled by default in the reusable router because the immediate requirement is to prevent future campaign days from being processed as normal current-day work.

Enable it only when that business requirement is confirmed.
