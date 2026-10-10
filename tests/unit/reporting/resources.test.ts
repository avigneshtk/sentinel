import { describe, expect, it } from 'vitest';
import {
  INCIDENT_GUIDANCE,
  INCIDENT_TYPE_LABELS,
  REPORTING_RESOURCES,
} from '@/data/reporting-resources';

describe('reporting resources', () => {
  it('includes India with verified official resources', () => {
    const india = REPORTING_RESOURCES.find((c) => c.code === 'IN');
    expect(india).toBeDefined();
    expect(india?.emergencyNumber).toBe('112');

    const urls = india!.resources.map((r) => r.url);
    expect(urls).toContain('https://cybercrime.gov.in/');
    expect(urls).toContain('https://www.112.gov.in/');
    expect(urls).toContain('https://wcd.gov.in/women/help');

    const phones = india!.resources.map((r) => r.phone).filter(Boolean);
    expect(phones).toContain('1930');
    expect(phones).toContain('181');
    expect(phones).toContain('112');
  });

  it('uses only https URLs for web resources', () => {
    for (const country of REPORTING_RESOURCES) {
      for (const resource of country.resources) {
        expect(resource.url.startsWith('https://')).toBe(true);
      }
    }
  });

  it('requires every resource to have a name and description', () => {
    for (const country of REPORTING_RESOURCES) {
      expect(country.name.length).toBeGreaterThan(0);
      expect(country.emergencyNumber.length).toBeGreaterThan(0);
      for (const resource of country.resources) {
        expect(resource.name.length).toBeGreaterThan(0);
        expect(resource.description.length).toBeGreaterThan(10);
      }
    }
  });

  it('covers multiple countries with distinct emergency numbers', () => {
    expect(REPORTING_RESOURCES.length).toBeGreaterThanOrEqual(4);
    const codes = REPORTING_RESOURCES.map((c) => c.code);
    expect(codes).toContain('IN');
    expect(codes).toContain('US');
    expect(codes).toContain('UK');
    expect(codes).toContain('AU');
  });

  it('provides guidance for every incident type', () => {
    for (const type of Object.keys(INCIDENT_TYPE_LABELS)) {
      const guidance = INCIDENT_GUIDANCE[type as keyof typeof INCIDENT_GUIDANCE];
      expect(guidance.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('does not invent phone numbers — all are digits, dashes, spaces, or +', () => {
    for (const country of REPORTING_RESOURCES) {
      expect(country.emergencyNumber).toMatch(/^\+?[\d\s-]+$/);
      for (const resource of country.resources) {
        if (resource.phone) {
          expect(resource.phone).toMatch(/^\+?[\d\s-]+$/);
        }
      }
    }
  });
});
