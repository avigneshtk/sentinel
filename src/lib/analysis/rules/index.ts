/**
 * Registry of all detection rules.
 *
 * The registry is exported so the Settings page can display
 * exactly which rules exist — full transparency about how
 * the engine works.
 */

import { DetectionRule } from '../types';
import { explicitThreatsRule } from './explicit-threats';
import { intimidationRule } from './intimidation';
import { imageAbuseThreatRule, sexualRequestRule } from './image-abuse';
import { boundaryIgnoreRule } from './boundary-ignore';
import { repeatedContactRule } from './repeated-contact';
import { sensitiveInfoRule } from './sensitive-info';
import { moneyPressureRule } from './money-pressure';
import { urgencySecrecyRule } from './urgency-secrecy';
import { impersonationRule } from './impersonation';
import { locationProbeRule } from './location-probe';
import { channelBypassRule } from './channel-bypass';
import { manipulationRule } from './manipulation';

export const RULES: DetectionRule[] = [
  explicitThreatsRule,
  intimidationRule,
  imageAbuseThreatRule,
  sexualRequestRule,
  boundaryIgnoreRule,
  repeatedContactRule,
  sensitiveInfoRule,
  moneyPressureRule,
  urgencySecrecyRule,
  impersonationRule,
  locationProbeRule,
  channelBypassRule,
  manipulationRule,
];

export const RULES_BY_ID: Record<string, DetectionRule> = Object.fromEntries(
  RULES.map((rule) => [rule.id, rule])
);
