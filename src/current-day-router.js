/**
 * LICC 10-Day Campaign Router
 *
 * Purpose:
 * - Evaluate campaign rows using Africa/Lagos time.
 * - Route only one relevant campaign day at a time.
 * - Prevent already-sent reminder types from being emitted.
 *
 * Notes:
 * - The original workflow also supports an advance reminder for TOMORROW.
 * - This module defaults to strict current-day processing.
 * - Set includeAdvanceReminder=true only if tomorrow's advance reminder is required.
 */

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function partsInLagos(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  return Object.fromEntries(
    parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value])
  );
}

function dateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDate(value) {
  if (!value) return null;

  const iso = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    return { year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3]) };
  }

  const legacy = String(value).trim().match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (!legacy) return null;

  const month = MONTHS[legacy[2].toLowerCase()];
  if (!month) return null;

  return { year: Number(legacy[3]), month, day: Number(legacy[1]) };
}

function parseTime(value) {
  if (!value) return null;

  const match = String(value).trim().toUpperCase()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);

  if (match[3] === 'AM' && hour === 12) hour = 0;
  if (match[3] === 'PM' && hour !== 12) hour += 12;

  return { hour, minute };
}

function minutesFromLagosParts({ year, month, day, hour, minute }) {
  return Date.UTC(year, month - 1, day, hour, minute, 0, 0) / 60000;
}

function tomorrowKeyFrom(today) {
  const d = new Date(Date.UTC(today.year, today.month - 1, today.day));
  d.setUTCDate(d.getUTCDate() + 1);
  return dateKey(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/**
 * Returns at most one campaign row with one email type.
 *
 * emailType:
 * - pre_service_reminder
 * - post_service
 * - advance_reminder (only when includeAdvanceReminder=true)
 */
function routeCampaign(rows, now = new Date(), {
  includeAdvanceReminder = false,
  preServiceLeadMinutes = 120,
  preServiceWindowMinutes = 30,
} = {}) {
  const lagos = partsInLagos(now);

  const today = {
    year: Number(lagos.year),
    month: Number(lagos.month),
    day: Number(lagos.day),
  };

  const todayKey = dateKey(today.year, today.month, today.day);
  const tomorrowKey = tomorrowKeyFrom(today);

  const currentMinutes = minutesFromLagosParts({
    year: today.year,
    month: today.month,
    day: today.day,
    hour: Number(lagos.hour),
    minute: Number(lagos.minute),
  });

  const candidates = [];

  for (const row of rows) {
    const d = parseDate(row.Date);
    const t = parseTime(row['Service Time']);
    if (!d || !t) continue;

    const serviceDateKey = dateKey(d.year, d.month, d.day);
    const serviceMinutes = minutesFromLagosParts({
      year: d.year,
      month: d.month,
      day: d.day,
      hour: t.hour,
      minute: t.minute,
    });

    const advanceStatus = String(row['Advance Reminder'] || '').trim().toLowerCase();
    const preStatus = String(row['Pre-Service Reminder'] || '').trim().toLowerCase();
    const postReady = String(row['Post-Service Ready'] || '').trim().toLowerCase();
    const postSentAt = String(row['Post-Service Sent At'] || '').trim();

    // Strict current-day post-service.
    if (
      serviceDateKey === todayKey &&
      postReady === 'ready' &&
      postSentAt === '' &&
      currentMinutes >= serviceMinutes
    ) {
      candidates.push({ ...row, emailType: 'post_service' });
      continue;
    }

    // Strict current-day pre-service.
    const preStart = serviceMinutes - preServiceLeadMinutes;
    const preEnd = preStart + preServiceWindowMinutes;

    if (
      serviceDateKey === todayKey &&
      preStatus !== 'sent' &&
      currentMinutes >= preStart &&
      currentMinutes < preEnd
    ) {
      candidates.push({ ...row, emailType: 'pre_service_reminder' });
      continue;
    }

    // Optional advance reminder for tomorrow.
    if (
      includeAdvanceReminder &&
      serviceDateKey === tomorrowKey &&
      advanceStatus !== 'sent' &&
      currentMinutes >= serviceMinutes - 24 * 60 &&
      currentMinutes < serviceMinutes - 2 * 60
    ) {
      candidates.push({ ...row, emailType: 'advance_reminder' });
    }
  }

  // Deterministic safety: never return more than one campaign day.
  // If multiple rows somehow qualify, prefer today's row and the most specific
  // current-day state (post-service over pre-service).
  const priority = {
    post_service: 1,
    pre_service_reminder: 2,
    advance_reminder: 3,
  };

  candidates.sort((a, b) => (priority[a.emailType] || 99) - (priority[b.emailType] || 99));

  return candidates.length ? [candidates[0]] : [];
}

module.exports = {
  partsInLagos,
  dateKey,
  parseDate,
  parseTime,
  routeCampaign,
};
