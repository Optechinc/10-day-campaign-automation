# 10-Day Campaign Automation — n8n + Google Sheets

A production-oriented email campaign automation pattern built with **n8n, Google Sheets, JavaScript, and email delivery**.

The project was built around a 10-day campaign with scheduled service reminders, post-service replay emails, recipient management, and status-based idempotency.

> **Privacy:** This repository is intentionally sanitized. No real recipient data, credentials, private spreadsheet IDs, or production links should be committed.

## Problem

A campaign spreadsheet contains multiple future days. A workflow that simply scans the entire sheet every few minutes can accidentally process more than the intended campaign day.

The key control is therefore:

> **Determine the relevant campaign date first, then evaluate delivery conditions.**

The router uses `Africa/Lagos` time and returns at most one due campaign record.

## Workflow

```text
Schedule Trigger
      │
      ├── Campaign Sheet ──> JavaScript Router ──┐
      │                                          │
      └── Recipients Sheet ──────────────────────┤
                                                 ▼
                                              Merge
                                                 │
                                           Status Guard
                                                 │
                                              Switch
                              ┌──────────────────┼──────────────────┐
                              ▼                  ▼                  ▼
                         Advance            Pre-Service         Post-Service
                              │                  │                  │
                              ▼                  ▼                  ▼
                           Email              Email              Email
                              │                  │                  │
                              ▼                  ▼                  ▼
                       Update status      Update status      Update status
```

## Repository structure

```text
10-day-campaign-automation/
├── README.md
├── LICENSE
├── .gitignore
├── package.json
├── workflow/
│   └── shiloh-campaign-template.json
├── src/
│   └── current-day-router.js
├── tests/
│   └── current-day-router.test.js
├── docs/
│   ├── architecture.md
│   ├── business-logic.md
│   └── google-sheets-schema.md
└── sample-data/
    ├── campaign-data.csv
    └── recipients.csv
```

## Quick start

### 1. Test the routing logic

Requires Node.js 18+.

```bash
npm test
```

### 2. Import the n8n template

In n8n:

1. Open **Workflows**.
2. Choose **Import from File**.
3. Select `workflow/shiloh-campaign-template.json`.
4. Reconnect the Google Sheets, Gmail, and SMTP credentials.
5. Replace the placeholder Google Sheet IDs/sheet references.
6. Confirm the workflow timezone is `Africa/Lagos`.
7. Keep the workflow inactive until it passes test-mode validation.

### 3. Configure Google Sheets

Create:

- a campaign sheet using `docs/google-sheets-schema.md`;
- a recipients sheet containing only approved recipients.

Do not commit production recipient data to GitHub.

### 4. Validate the critical scenario

For a campaign where today is Day 1:

- Day 1 pre-service → Day 1 only.
- Day 1 post-service → Day 1 only, when `Post-Service Ready = Ready`.
- Day 2 must not appear in normal current-day output.
- A sent reminder must not be emitted again on the next five-minute execution.

## Security

Never commit:

- OAuth credentials;
- SMTP passwords;
- API keys;
- recipient email lists;
- private Google Sheet URLs/IDs;
- private recording links;
- n8n instance secrets;
- production webhook URLs.

Use environment variables or n8n credentials for secrets.

## Engineering highlights

- Timezone-aware routing.
- Deterministic campaign-day selection.
- Status-based idempotency.
- Human-controlled post-service readiness.
- Separation of campaign data and recipient data.
- Reusable JavaScript routing logic.
- Sanitized n8n workflow template.
- Automated regression tests for the Day 1/Day 2 duplication scenario.

## Portfolio positioning

This project demonstrates:

- workflow automation;
- n8n;
- Google Sheets integration;
- JavaScript;
- email automation;
- state management;
- idempotency;
- timezone-aware scheduling;
- operational safeguards;
- debugging and regression testing.

## Important source-workflow note

The original implementation contains an advance-reminder branch that intentionally targets tomorrow's service. The reusable router in this repository defaults to strict current-day behavior. This distinction is documented so the business rule is explicit rather than hidden in code.
