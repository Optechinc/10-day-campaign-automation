# Architecture

## System objective

Automate a 10-day email campaign from a Google Sheet using n8n, while ensuring that each campaign day is processed only when its delivery condition is due.

## Components

1. **Schedule Trigger** — runs the workflow periodically.
2. **Campaign Google Sheet** — contains one row per campaign day and status/timestamp fields.
3. **JavaScript routing layer** — evaluates Africa/Lagos date/time and determines the due email type.
4. **Recipients Google Sheet** — provides the email audience.
5. **Merge** — combines the due campaign record with recipient records.
6. **Duplicate/status guard** — blocks an email type when its status is already `Sent`.
7. **Switch** — routes to the correct email branch.
8. **Email delivery** — sends the appropriate message.
9. **Google Sheets update** — records `Sent` status and a timestamp.

## Delivery types

- `advance_reminder`
- `pre_service_reminder`
- `post_service`

## Important design decision

The campaign has an intentional advance-reminder concept. The portfolio-safe router therefore defaults to **strict current-day processing** and makes the tomorrow advance reminder an explicit configuration option.

This prevents a common failure mode where a scan of the full campaign sheet emits a future campaign day alongside the current day.

## Idempotency

A delivery should have two controls:

- a status field such as `Pending` / `Sent`;
- a sent timestamp.

The router should never emit a reminder type whose status is already `Sent`.

For production, the state update should occur immediately after a successful email send and should match on the campaign `Day` (or preferably a stable campaign-row ID).
