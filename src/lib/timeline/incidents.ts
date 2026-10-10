/**
 * Incident Timeline — typed model, validation, ordering,
 * pattern detection, and export. Pure logic, unit-testable.
 */

export type IncidentCategory =
  | 'unwanted-contact'
  | 'harassment'
  | 'threats-intimidation'
  | 'impersonation'
  | 'financial-scam'
  | 'image-based-abuse'
  | 'privacy-exposure'
  | 'location-tracking'
  | 'other';

export const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  'unwanted-contact': 'Unwanted contact',
  harassment: 'Harassment / abusive messages',
  'threats-intimidation': 'Threats or intimidation',
  impersonation: 'Impersonation / fake profile',
  'financial-scam': 'Financial scam / fraud',
  'image-based-abuse': 'Image-based abuse',
  'privacy-exposure': 'Privacy exposure / doxxing',
  'location-tracking': 'Location tracking',
  other: 'Other',
};

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  /** ISO date string (yyyy-mm-dd) or null when unknown. */
  date: string | null;
  dateUnknown: boolean;
  createdAt: string;
}

export class IncidentValidationError extends Error {}

const DESCRIPTION_MAX = 5000;
const TITLE_MAX = 120;

export function validateIncidentInput(input: {
  title: string;
  description: string;
  category: IncidentCategory;
  date: string | null;
  dateUnknown: boolean;
}): void {
  if (!input.description.trim()) {
    throw new IncidentValidationError(
      'Please describe the incident. A short factual description is enough.'
    );
  }
  if (input.description.length > DESCRIPTION_MAX) {
    throw new IncidentValidationError(
      `The description is longer than ${DESCRIPTION_MAX.toLocaleString()} characters. Please shorten it.`
    );
  }
  if (!input.category || !(input.category in CATEGORY_LABELS)) {
    throw new IncidentValidationError('Please choose a category.');
  }
  if (!input.dateUnknown) {
    if (!input.date) {
      throw new IncidentValidationError(
        'Enter the date, or tick "date unknown".'
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
      throw new IncidentValidationError('Please enter the date as YYYY-MM-DD.');
    }
    const parsed = new Date(`${input.date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      throw new IncidentValidationError('That date does not look valid.');
    }
    if (parsed.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
      throw new IncidentValidationError('The date cannot be in the future.');
    }
  }
  if (input.title.trim().length > TITLE_MAX) {
    throw new IncidentValidationError(
      `The title is longer than ${TITLE_MAX} characters.`
    );
  }
}

export function createIncident(
  input: {
    title: string;
    description: string;
    category: IncidentCategory;
    date: string | null;
    dateUnknown: boolean;
  },
  id: string
): Incident {
  validateIncidentInput(input);
  return {
    id,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    date: input.dateUnknown ? null : input.date,
    dateUnknown: input.dateUnknown,
    createdAt: new Date().toISOString(),
  };
}

/** Chronological order; unknown dates grouped at the end (stable). */
export function sortIncidents(incidents: Incident[]): Incident[] {
  const dated = incidents
    .filter((i) => i.date !== null)
    .sort((a, b) => a.date!.localeCompare(b.date!));
  const unknown = incidents.filter((i) => i.date === null);
  return [...dated, ...unknown];
}

export interface CategoryPattern {
  category: IncidentCategory;
  count: number;
  incidentIds: string[];
}

/** Categories that appear 2+ times may indicate a repeated pattern. */
export function findRepeatedCategories(
  incidents: Incident[]
): CategoryPattern[] {
  const counts = new Map<IncidentCategory, string[]>();
  for (const incident of incidents) {
    const list = counts.get(incident.category) ?? [];
    list.push(incident.id);
    counts.set(incident.category, list);
  }
  return [...counts.entries()]
    .filter(([, ids]) => ids.length >= 2)
    .map(([category, ids]) => ({ category, count: ids.length, incidentIds: ids }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Build a neutral, factual export summary.
 * User-reported content is clearly marked; SENTINEL adds
 * no automated claims to the export.
 */
export function buildIncidentExport(incidents: Incident[]): string {
  const sorted = sortIncidents(incidents);
  const lines: string[] = [
    'SENTINEL — Incident summary (user-reported record)',
    `Generated: ${new Date().toISOString()}`,
    '',
    'These incidents were recorded by the user. They are user-reported',
    'information and have not been verified, investigated, or authenticated',
    'by SENTINEL. Browser storage is not a secure evidence vault.',
    '',
    `Total incidents: ${sorted.length}`,
    '',
    '------------------------------------------------------------',
  ];

  for (const incident of sorted) {
    const when = incident.dateUnknown
      ? 'Date: unknown'
      : `Date: ${incident.date}`;
    lines.push(
      `Incident: ${incident.title || '(untitled)'}`,
      `Category: ${CATEGORY_LABELS[incident.category]}`,
      when,
      '',
      incident.description,
      '',
      '------------------------------------------------------------'
    );
  }

  return lines.join('\n');
}

export function buildIncidentExportJson(incidents: Incident[]): string {
  return JSON.stringify(
    {
      tool: 'SENTINEL — user-reported incident record',
      generatedAt: new Date().toISOString(),
      verified: false,
      disclaimer:
        'User-reported information. Not verified, not authenticated. Browser storage is not a secure evidence vault.',
      incidents: sortIncidents(incidents),
    },
    null,
    2
  );
}

export function generateIncidentId(): string {
  // Timestamp + random suffix; adequate for local, non-security IDs.
  return `inc-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
