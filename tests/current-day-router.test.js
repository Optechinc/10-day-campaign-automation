const assert = require('node:assert/strict');
const { routeCampaign } = require('../src/current-day-router');

const rows = [
  {
    Day: 1,
    Date: '2026-08-28',
    'Service Time': '5:30 PM',
    'Advance Reminder': 'Pending',
    'Pre-Service Reminder': 'Pending',
    'Post-Service Ready': 'Pending',
    'Post-Service Sent At': '',
  },
  {
    Day: 2,
    Date: '2026-08-29',
    'Service Time': '5:30 PM',
    'Advance Reminder': 'Pending',
    'Pre-Service Reminder': 'Pending',
    'Post-Service Ready': 'Pending',
    'Post-Service Sent At': '',
  },
];

function run(name, now, options, expectedDay, expectedType) {
  const result = routeCampaign(rows, new Date(now), options);
  assert.equal(result.length, expectedDay ? 1 : 0, name);
  if (expectedDay) {
    assert.equal(Number(result[0].Day), expectedDay, name);
    assert.equal(result[0].emailType, expectedType, name);
  }
}

// Aug 28 at 15:45 Lagos: only Day 1 pre-service should route.
// Day 2 must not be returned just because an advance reminder exists.
run(
  'strict current-day pre-service',
  '2026-08-28T14:45:00.000Z',
  { includeAdvanceReminder: false },
  1,
  'pre_service_reminder'
);

// Aug 28 at 17:45 Lagos: Day 1 post-service only.
rows[0]['Post-Service Ready'] = 'Ready';
run(
  'strict current-day post-service',
  '2026-08-28T16:45:00.000Z',
  { includeAdvanceReminder: false },
  1,
  'post_service'
);

// Before the service window: nothing.
run(
  'outside current-day window',
  '2026-08-28T10:00:00.000Z',
  { includeAdvanceReminder: false },
  null,
  null
);

// Optional advance reminder can intentionally select tomorrow.
rows[0]['Post-Service Ready'] = 'Pending';
run(
  'optional tomorrow advance reminder',
  '2026-08-28T18:00:00.000Z',
  { includeAdvanceReminder: true },
  2,
  'advance_reminder'
);

console.log('All LICC router tests passed.');
