import { describe, expect, it } from 'vitest';
import {
  analyzeTextForExposures,
  analyzeCaption,
  detectPhoneNumbers,
  detectEmails,
  detectAddressClues,
  detectPinCodes,
  detectDocumentKeywords,
} from '@/lib/privacy-scanner/detect-exposures';
import { validateImageFile, ALLOWED_IMAGE_TYPES } from '@/lib/privacy-scanner/ocr';

describe('detectPhoneNumbers', () => {
  it('detects Indian mobile numbers', () => {
    const findings = detectPhoneNumbers('Call 9876543210 for details', 'ocr');
    expect(findings).toHaveLength(1);
    expect(findings[0].kind).toBe('phone');
    expect(findings[0].excerpt).toBe('9876543210');
  });

  it('detects numbers with +91 prefix', () => {
    const findings = detectPhoneNumbers('Reach me at +91 98765 43210', 'caption');
    expect(findings.length).toBeGreaterThanOrEqual(1);
  });

  it('does not flag short numbers like years', () => {
    const findings = detectPhoneNumbers('In 2025 things changed', 'ocr');
    expect(findings).toHaveLength(0);
  });

  it('deduplicates repeated numbers', () => {
    const findings = detectPhoneNumbers('9876543210 and 9876543210', 'ocr');
    expect(findings).toHaveLength(1);
  });
});

describe('detectEmails', () => {
  it('detects email addresses', () => {
    const findings = detectEmails('Contact: priya.sharma@example.com', 'ocr');
    expect(findings).toHaveLength(1);
    expect(findings[0].excerpt).toBe('priya.sharma@example.com');
  });

  it('returns empty for text without emails', () => {
    expect(detectEmails('no addresses here', 'ocr')).toHaveLength(0);
  });
});

describe('detectAddressClues', () => {
  it('detects street addresses', () => {
    const findings = detectAddressClues('Lives at 12 Park street', 'ocr');
    expect(findings).toHaveLength(1);
    expect(findings[0].kind).toBe('address-clue');
  });

  it('detects locality names (nagar/colony)', () => {
    const findings = detectAddressClues('from Salt Lake Nagar', 'ocr');
    expect(findings).toHaveLength(1);
  });
});

describe('detectPinCodes', () => {
  it('detects 6-digit PINs near postal context', () => {
    const findings = detectPinCodes('pin code 600001 near the office', 'ocr');
    expect(findings).toHaveLength(1);
    expect(findings[0].excerpt).toBe('600001');
  });

  it('ignores 6-digit numbers without postal context', () => {
    const findings = detectPinCodes('the code is 123456 for access', 'ocr');
    expect(findings).toHaveLength(0);
  });
});

describe('detectDocumentKeywords', () => {
  it('detects identity document references', () => {
    const findings = detectDocumentKeywords('scanned aadhaar card copy', 'ocr');
    expect(findings.length).toBeGreaterThanOrEqual(1);
  });

  it('detects passport and account number references', () => {
    const findings = detectDocumentKeywords('passport and account number', 'ocr');
    expect(findings.length).toBeGreaterThanOrEqual(2);
  });
});

describe('analyzeTextForExposures', () => {
  it('finds multiple exposure types in one text', () => {
    const findings = analyzeTextForExposures(
      'Priya Sharma, 12 Park street, pin 600001, phone 9876543210, priya@example.com',
      'ocr'
    );
    const kinds = findings.map((f) => f.kind);
    expect(kinds).toContain('phone');
    expect(kinds).toContain('email');
    expect(kinds).toContain('address-clue');
    expect(kinds).toContain('pin-code');
  });

  it('returns empty for clean text', () => {
    expect(analyzeTextForExposures('a photo of my cat', 'ocr')).toHaveLength(0);
  });

  it('returns empty for blank text', () => {
    expect(analyzeTextForExposures('', 'ocr')).toHaveLength(0);
  });
});

describe('analyzeCaption', () => {
  it('detects phone numbers in captions', () => {
    const findings = analyzeCaption('call me 9876543210');
    expect(findings.some((f) => f.kind === 'phone')).toBe(true);
  });

  it('detects location-identifying phrases', () => {
    const findings = analyzeCaption('Morning coffee at home in my hometown');
    expect(findings.some((f) => f.source === 'caption' && f.kind === 'address-clue')).toBe(true);
  });

  it('detects location hashtags', () => {
    const findings = analyzeCaption('sunday vibes #hometown');
    expect(findings.some((f) => f.kind === 'address-clue')).toBe(true);
  });

  it('returns empty for a safe caption', () => {
    expect(analyzeCaption('lovely sunset at the beach')).toHaveLength(0);
  });
});

describe('validateImageFile', () => {
  function fakeFile(type: string, size: number): File {
    return new File(['x'.repeat(Math.min(size, 1024))], 'test', { type });
  }

  it('accepts supported image types', () => {
    for (const type of ALLOWED_IMAGE_TYPES) {
      expect(validateImageFile(fakeFile(type, 100)).ok).toBe(true);
    }
  });

  it('rejects unsupported types', () => {
    const result = validateImageFile(fakeFile('application/pdf', 100));
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Unsupported file type/);
  });

  it('rejects files over the size limit', () => {
    const big = new File([''], 'big.png', { type: 'image/png' });
    Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 });
    const result = validateImageFile(big);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/larger than 5 MB/);
  });

  it('rejects empty files', () => {
    const empty = new File([''], 'empty.png', { type: 'image/png' });
    expect(validateImageFile(empty).ok).toBe(false);
  });
});
