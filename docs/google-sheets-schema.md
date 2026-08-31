# Google Sheets Schema

## Campaign sheet

Recommended columns:

| Column | Purpose |
|---|---|
| Day | Campaign day number |
| Date | Service date |
| Service Time | Service time |
| Subject | Email subject |
| Daily Message | Optional content field |
| Advance Reminder | `Pending` / `Sent` |
| Advance Reminder Sent At | ISO timestamp |
| Pre-Service Reminder | `Pending` / `Sent` |
| Pre-Service Sent At | ISO timestamp |
| Listen Link | Recording/audio URL |
| Watch Link | Recording/video URL |
| Post-Service Ready | `Pending` / `Ready` |
| Post-Service Sent At | ISO timestamp |

## Recipients sheet

Recommended columns:

- `First Name`
- `Email`

## Operational rule

The post-service email is not eligible merely because the service time has passed. It also requires `Post-Service Ready = Ready` and an empty `Post-Service Sent At`.

That keeps recording links and post-service content under human control.
