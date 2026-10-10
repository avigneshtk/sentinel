/**
 * Rule: probing for location and address details.
 *
 * Asking where you live, for your address, or for location
 * pins is an early stalking / doxxing indicator — especially
 * from new or pushy contacts.
 */

import { DetectionRule, SignalMatch } from '../types';
import { buildFinding, findAll, isNegated, RuleHit } from './helpers';

const LOCATION_PROBE =
  /\b(where\s+do\s+you\s+(live|stay|reside)|where\s+you\s+(live|stay|reside)|what'?s\s+your\s+(home\s+)?(address|location)|send\s+(me\s+)?your\s+(location|address|live\s+location)|what\s+(area|locality|colony|city)\s+do\s+you\s+(live|stay)|which\s+(college|school|hostel|office)\s+do\s+you\s+(study|go|work)|what'?s\s+your\s+(college|school|hostel)\s+name)\b/i;

const ADDRESS_CLUE =
  /\b\d{1,4}\s*[,\-\/]?\s*[a-z]+\s+(street|st\.?|road|rd\.?|avenue|ave\.?|lane|nagar|colony|marg|bazaar)\b/i;

const PIN_PROBE = /\b(pin\s?code|postal\s?code|zip\s?code)\b/i;

export const locationProbeRule: DetectionRule =
  {
    id: 'location-probe',
    name: 'Probing for location or address',
    category: 'Privacy exposure',
    detect(messages): SignalMatch[] {
      const hits: RuleHit[] = [];
      for (const pattern of [LOCATION_PROBE, ADDRESS_CLUE, PIN_PROBE]) {
        for (const hit of findAll(messages, pattern)) {
          if (!isNegated(hit.message.text, hit.index)) hits.push(hit);
        }
      }

      const finding = buildFinding({
        ruleId: 'location-probe',
        signal: 'Request or mention of home address, area, or location',
        severity: 'caution',
        confidence: 'possible',
        hits,
        explanation:
          'The conversation asks where you live, study or work, mentions an address-like string, or asks for a PIN/postal code. Location details enable stalking, doxxing and offline harm — especially in the early stages of contact.',
        recommendation:
          'Avoid sharing your home address, hostel, routine, or live location with people you don\'t trust. If a new contact keeps asking where you are, treat that as a warning sign and preserve the messages.',
        limitation:
          'Address-like strings can appear in ordinary contexts (deliveries, plans with friends). SENTINEL cannot tell who is asking or why.',
      });
      return finding ? [finding] : [];
    },
  };
