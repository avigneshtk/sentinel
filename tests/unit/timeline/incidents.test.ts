import { describe, expect, it } from 'vitest';
import {
  buildIncidentExport,
  buildIncidentExportJson,
  createIncident,
  findRepeatedCategories,
  sortIncidents,
  validateIncidentInput,
  Incident,
  IncidentValidationError,
} from '@/lib/timeline/incidents';

function makeIncident(partial: Partial<Incident> & { description: string }): Incident {
  return createIncident(
    {
      title: partial.title ?? '',
      description: partial.description,
      category: partial.category ?? 'unwanted-contact',
      date: partial.date ?? null,
      dateUnknown: partial.dateUnknown ?? partial.date == null,
    },
    partial.id ?? `inc-${Math.random().toString(36).slice(2)}`
  );
}

describe('validateIncidentInput', () => {
  it('rejects empty descriptions', () => {
    expect(() =>
      validateIncidentInput({
        title: '',
        description: '   ',
        category: 'harassment',
        date: null,
        dateUnknown: true,
      })
    ).toThrow(IncidentValidationError);
  });

  it('rejects unknown categories', () => {
    expect(() =>
      validateIncidentInput({
        title: '',
        description: 'something happened',
        category: 'not-a-category' as Incident['category'],
        date: null,
        dateUnknown: true,
      })
    ).toThrow(IncidentValidationError);
  });

  it('rejects invalid dates', () => {
    expect(() =>
      validateIncidentInput({
        title: '',
        description: 'something happened',
        category: 'harassment',
        date: 'not-a-date',
        dateUnknown: false,
      })
    ).toThrow(IncidentValidationError);
  });

  it('rejects future dates', () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    expect(() =>
      validateIncidentInput({
        title: '',
        description: 'something happened',
        category: 'harassment',
        date: future,
        dateUnknown: false,
      })
    ).toThrow(IncidentValidationError);
  });

  it('accepts a valid incident with a date', () => {
    expect(() =>
      validateIncidentInput({
        title: 'Test',
        description: 'something happened',
        category: 'harassment',
        date: '2025-01-06',
        dateUnknown: false,
      })
    ).not.toThrow();
  });

  it('accepts an incident with unknown date', () => {
    expect(() =>
      validateIncidentInput({
        title: 'Test',
        description: 'something happened',
        category: 'harassment',
        date: null,
        dateUnknown: true,
      })
    ).not.toThrow();
  });
});

describe('sortIncidents', () => {
  it('sorts chronologically with unknown dates last', () => {
    const incidents = [
      makeIncident({ id: 'a', description: 'c', date: '2025-02-01', dateUnknown: false }),
      makeIncident({ id: 'b', description: 'd', dateUnknown: true }),
      makeIncident({ id: 'c', description: 'e', date: '2025-01-01', dateUnknown: false }),
    ];
    const sorted = sortIncidents(incidents);
    expect(sorted.map((i) => i.id)).toEqual(['c', 'a', 'b']);
  });
});

describe('findRepeatedCategories', () => {
  it('flags categories appearing 2+ times', () => {
    const incidents = [
      makeIncident({ id: 'a', description: 'x', category: 'harassment' }),
      makeIncident({ id: 'b', description: 'y', category: 'harassment' }),
      makeIncident({ id: 'c', description: 'z', category: 'impersonation' }),
    ];
    const patterns = findRepeatedCategories(incidents);
    expect(patterns).toHaveLength(1);
    expect(patterns[0].category).toBe('harassment');
    expect(patterns[0].count).toBe(2);
  });
});

describe('export', () => {
  const incidents = [
    makeIncident({
      id: 'a',
      title: 'Late-night messages',
      description: 'Repeated messages after I asked to stop.',
      category: 'unwanted-contact',
      date: '2025-01-07',
      dateUnknown: false,
    }),
    makeIncident({
      id: 'b',
      title: '',
      description: 'Someone asked for my OTP.',
      category: 'financial-scam',
      dateUnknown: true,
    }),
  ];

  it('builds a factual text export with user-reported disclaimer', () => {
    const text = buildIncidentExport(incidents);
    expect(text).toContain('user-reported');
    expect(text).toContain('Late-night messages');
    expect(text).toContain('Repeated messages after I asked to stop.');
    expect(text).toContain('Date: 2025-01-07');
    expect(text).toContain('Date: unknown');
    expect(text).not.toContain('SENTINEL found'); // no automated claims
  });

  it('builds a JSON export marked unverified', () => {
    const json = JSON.parse(buildIncidentExportJson(incidents));
    expect(json.verified).toBe(false);
    expect(json.incidents).toHaveLength(2);
    expect(json.disclaimer).toContain('Not verified');
  });
});
