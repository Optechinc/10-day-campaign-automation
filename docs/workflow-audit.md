# Workflow Audit Notes

The supplied n8n export was used as the source for this repository. The following observations are documented rather than silently changed.

## 1. Current-day versus advance-day behavior

The source JavaScript explicitly supports three email types:

- `advance_reminder`
- `pre_service_reminder`
- `post_service`

The advance branch checks `tomorrowKey`, so a future campaign day can legitimately be selected. That is different from strict current-day-only behavior.

The reusable router therefore makes `includeAdvanceReminder` an explicit configuration option and defaults it to `false`.

## 2. Status/idempotency

The source workflow uses status and timestamp fields to avoid resending a message. The repository retains this pattern and adds regression tests around it.

## 3. Email delivery branches

The source export contains both Gmail and SMTP email nodes. The repository keeps the sanitized workflow template but removes instance-specific credentials so it can be safely shared.

## 4. Production hygiene

Before publishing or reusing the workflow:

- reconnect credentials in n8n;
- replace spreadsheet references;
- verify every update node points to the same intended campaign sheet;
- verify the recipient sheet;
- verify the sender identity;
- test each branch with a controlled test recipient;
- activate only after the status-update path is confirmed.

## 5. Privacy

The repository is a portfolio-safe representation. Production recipient records, credentials, private links, and infrastructure identifiers are excluded.
