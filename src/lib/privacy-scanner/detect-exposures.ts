/**
 * TRACELESS — exposure detection for OCR text and captions.
 *
 * Pure functions, fully unit-testable. They detect a
 * deliberately limited set of exposures:
 *   - phone-number-like strings
 *   - email addresses
 *   - address-like clues
 *   - PIN/postal codes near address words
 *   - sensitive-document keywords (Aadhaar, passport, ...)
 *
 * Detection is heuristic. A match is a CLUE to review,
 * never a confirmed exposure. OCR text is noisy, so
 * confidence is reported honestly.
 */

export type ExposureKind =
  | 'phone'
  | 'email'
  | 'address-clue'
  | 'pin-code'
  | 'document-keyword';

export type ExposureSource = 'ocr' | 'caption';

export type ExposureConfidence = 'high' | 'medium' | 'low';

export interface ExposureFinding {
  kind: ExposureKind;
  source: ExposureSource;
  /** The actual detected text/clue, verbatim. */
  excerpt: string;
  explanation: string;
  recommendation: string;
  confidence: ExposureConfidence;
}

const PHONE_PATTERN =
  /(?:\+?91[\s\-]?)?[6-9]\d{4}\s?\d{5}\b|\+?\d[\d\s\-]{7,14}\d/g;

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const ADDRESS_PATTERN =
  /\b(?:\d{1,4}\s*[,\-\/]?\s*)?[A-Za-z]+\s+(?:street|st\.?|road|rd\.?|avenue|ave\.?|lane|nagar|colony|marg|bazaar)\b/gi;

const PIN_PATTERN = /\b\d{6}\b/g;

const PIN_CONTEXT = /\b(pin\s?code|postal\s?code|zip\s?code|zip|pincode|pin)\b/i;

const DOCUMENT_KEYWORDS = [
  'aadhaar',
  'aadhar',
  'passport',
  'pan card',
  'voter id',
  'voter card',
  'driving licence',
  "driver's licence",
  'driving license',
  "driver's license",
  'ration card',
  'account number',
  'account no',
  'ifsc',
  'social security number',
  'date of birth',
  'dob:',
  'bank passbook',
];

function cleanOcrText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

/**
 * Detect phone-number-like strings. OCR often inserts or
 * drops characters, so phone matches from OCR are medium
 * confidence unless they match the Indian mobile format.
 */
export function detectPhoneNumbers(
  text: string,
  source: ExposureSource
): ExposureFinding[] {
  const cleaned = cleanOcrText(text);
  const matches = cleaned.match(PHONE_PATTERN) ?? [];
  return unique(matches).map((match) => {
    const digits = match.replace(/\D/g, '');
    const indianMobile = /^[6-9]\d{9}$/.test(digits) || /^(?:91)?[6-9]\d{9}$/.test(digits);
    return {
      kind: 'phone' as const,
      source,
      excerpt: match.trim(),
      explanation: indianMobile
        ? 'This looks like an Indian mobile number. Publishing a phone number can lead to spam calls, scams, and stalking.'
        : 'This looks like a phone number. Publishing a phone number can lead to spam calls, scams, and stalking.',
      recommendation:
        'Remove or crop the phone number before publishing. If it is yours, check who can see it; if it is someone else\'s, do not share their number without consent.',
      confidence: indianMobile && source === 'ocr' ? 'medium' : indianMobile ? 'high' : 'low',
    };
  });
}

export function detectEmails(
  text: string,
  source: ExposureSource
): ExposureFinding[] {
  const cleaned = cleanOcrText(text);
  const matches = cleaned.match(EMAIL_PATTERN) ?? [];
  return unique(matches).map((match) => ({
    kind: 'email' as const,
    source,
    excerpt: match,
    explanation:
      'This looks like an email address. Publishing it can lead to phishing, spam, and account-targeting attempts.',
    recommendation:
      'Remove or crop the email address before publishing. Be especially careful with work, school, or government email addresses.',
    confidence: source === 'ocr' ? 'medium' : 'high',
  }));
}

export function detectAddressClues(
  text: string,
  source: ExposureSource
): ExposureFinding[] {
  const cleaned = cleanOcrText(text);
  const matches = cleaned.match(ADDRESS_PATTERN) ?? [];
  return unique(matches).map((match) => ({
    kind: 'address-clue' as const,
    source,
    excerpt: match.trim(),
    explanation:
      'This looks like a street address or locality. Addresses are one of the strongest doxxing and stalking risks in published content.',
    recommendation:
      'Crop or remove the address before publishing. Avoid posting photos of documents, letters, or delivery labels that contain addresses.',
    confidence: 'medium',
  }));
}

export function detectPinCodes(
  text: string,
  source: ExposureSource
): ExposureFinding[] {
  const cleaned = cleanOcrText(text);
  const matches = cleaned.match(PIN_PATTERN) ?? [];
  return unique(matches)
    .filter((match) => PIN_CONTEXT.test(cleaned))
    .map((match) => ({
      kind: 'pin-code' as const,
      source,
      excerpt: match,
      explanation:
        'This 6-digit number appears near PIN/postal code wording. A PIN code narrows a location down to a locality.',
      recommendation:
        'Remove the PIN code from captions and visible text. When a photo contains it, crop it out.',
      confidence: 'medium',
    }));
}

export function detectDocumentKeywords(
  text: string,
  source: ExposureSource
): ExposureFinding[] {
  const cleaned = cleanOcrText(text).toLowerCase();
  const found = DOCUMENT_KEYWORDS.filter((keyword) =>
    cleaned.includes(keyword)
  );
  return unique(found).map((keyword) => ({
    kind: 'document-keyword' as const,
    source,
    excerpt: keyword,
    explanation:
      `The text mentions "${keyword}". Documents like these contain identity numbers that enable identity theft and impersonation if photographed and published.`,
    recommendation:
      'If this is a photo of a document, do not publish it — crop or delete it. If the keyword appears in a caption, remove it.',
    confidence: 'low',
  }));
}

/**
 * Analyze a block of text (OCR output or caption) for all
 * supported exposures. Returns findings ordered by risk.
 */
export function analyzeTextForExposures(
  text: string,
  source: ExposureSource
): ExposureFinding[] {
  if (!text.trim()) return [];

  const findings = [
    ...detectPhoneNumbers(text, source),
    ...detectEmails(text, source),
    ...detectAddressClues(text, source),
    ...detectPinCodes(text, source),
    ...detectDocumentKeywords(text, source),
  ];

  const order: Record<ExposureKind, number> = {
    phone: 0,
    'address-clue': 1,
    'pin-code': 2,
    email: 3,
    'document-keyword': 4,
  };
  return findings.sort((a, b) => order[a.kind] - order[b.kind]);
}

/**
 * Caption-specific checks on top of the general text analysis:
 * location-identifying phrases and geotag-style hashtags.
 */
export const CAPTION_LOCATION_PATTERNS: RegExp[] = [
  /\b(i\s+live\s+in|living\s+in|based\s+in|located\s+in|from\s+the\s+(area|city|town)|at\s+home|my\s+hometown|in\s+my\s+hometown)\b/i,
  /\b(my\s+(home|house|apartment|flat|hostel|college|school|office|neighbourhood|neighborhood))\b/i,
  /#(home|hometown|mycity|livingin|locallife)\b/i,
];

export function analyzeCaption(caption: string): ExposureFinding[] {
  const general = analyzeTextForExposures(caption, 'caption');
  const locationFindings: ExposureFinding[] = [];

  for (const pattern of CAPTION_LOCATION_PATTERNS) {
    const match = caption.match(pattern);
    if (!match) continue;
    locationFindings.push({
      kind: 'address-clue',
      source: 'caption',
      excerpt: match[0],
      explanation:
        'This phrase identifies or hints at your location. Location-identifying captions make photos and posts trackable to a place.',
      recommendation:
        'Remove location-identifying phrases and hashtags from captions. Consider posting location details after you leave a place, not while you are there.',
      confidence: 'medium',
    });
    break; // one location finding is enough
  }

  return [...general, ...locationFindings];
}
