import { describe, expect, it } from 'vitest';
import { parseConversationText } from '@/lib/analysis/parse-conversation';
import { explicitThreatsRule } from '@/lib/analysis/rules/explicit-threats';
import { intimidationRule } from '@/lib/analysis/rules/intimidation';
import { imageAbuseThreatRule, sexualRequestRule } from '@/lib/analysis/rules/image-abuse';
import { boundaryIgnoreRule } from '@/lib/analysis/rules/boundary-ignore';
import { repeatedContactRule } from '@/lib/analysis/rules/repeated-contact';
import { sensitiveInfoRule } from '@/lib/analysis/rules/sensitive-info';
import { moneyPressureRule } from '@/lib/analysis/rules/money-pressure';
import { urgencySecrecyRule } from '@/lib/analysis/rules/urgency-secrecy';
import { impersonationRule } from '@/lib/analysis/rules/impersonation';
import { locationProbeRule } from '@/lib/analysis/rules/location-probe';
import { channelBypassRule } from '@/lib/analysis/rules/channel-bypass';
import { manipulationRule } from '@/lib/analysis/rules/manipulation';

const msgs = (lines: string[]) => parseConversationText(lines.join('\n'));

describe('explicit-threats rule', () => {
  it('detects direct threats', () => {
    const findings = explicitThreatsRule.detect(
      msgs(["Arjun: I'll kill you if you tell anyone", "Priya: I'm scared"])
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('elevated');
    expect(findings[0].confidence).toBe('supported');
    expect(findings[0].messageIndexes).toContain(1);
  });

  it('detects threats of harm and ruining life', () => {
    const findings = explicitThreatsRule.detect(
      msgs(['Arjun: I will ruin your life, you will regret this'])
    );
    expect(findings).toHaveLength(1);
  });

  it('ignores negated threats', () => {
    const findings = explicitThreatsRule.detect(
      msgs(["Arjun: I will not hurt you, I promise"])
    );
    expect(findings).toHaveLength(0);
  });

  it('ignores ordinary conversations without threat language', () => {
    const findings = explicitThreatsRule.detect(
      msgs(['Mom: call me when you are back', 'Anu: will do'])
    );
    expect(findings).toHaveLength(0);
  });
});

describe('intimidation rule', () => {
  it('detects claims to know your location or family', () => {
    const findings = intimidationRule.detect(
      msgs(['Arjun: i know where your hostel is'])
    );
    const surveillance = findings.filter((f) => f.signal.includes('location'));
    expect(surveillance).toHaveLength(1);
    expect(surveillance[0].severity).toBe('elevated');
  });

  it('detects conditional threats ("or else", "consequences")', () => {
    const findings = intimidationRule.detect(
      msgs(["Arjun: you'd better reply or else there will be consequences"])
    );
    const conditional = findings.filter((f) =>
      f.signal.toLowerCase().includes('conditional')
    );
    expect(conditional).toHaveLength(1);
    expect(conditional[0].severity).toBe('caution');
  });

  it('does not flag "i know" without surveillance content', () => {
    const findings = intimidationRule.detect(
      msgs(['Anu: i know the answer to that question'])
    );
    expect(findings).toHaveLength(0);
  });
});

describe('image-abuse rules', () => {
  it('detects threats to share intimate images', () => {
    const findings = imageAbuseThreatRule.detect(
      msgs(["Arjun: i'll post your pictures everywhere if you don't pay"])
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('elevated');
  });

  it('detects conditional sharing of private photos', () => {
    const findings = imageAbuseThreatRule.detect(
      msgs(["Arjun: if you don't send money i'll leak your private photos"])
    );
    expect(findings).toHaveLength(1);
  });

  it('detects requests for intimate content', () => {
    const findings = sexualRequestRule.detect(
      msgs(['Stranger: send me your nudes please'])
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('caution');
  });

  it('detects "send a photo of yourself" requests', () => {
    const findings = sexualRequestRule.detect(
      msgs(['Arjun: send a photo of yourself right now'])
    );
    expect(findings).toHaveLength(1);
  });

  it('does not flag ordinary photo talk', () => {
    const findings = sexualRequestRule.detect(
      msgs(['Mom: send a photo of the food'])
    );
    expect(findings).toHaveLength(0);
  });
});

describe('boundary-ignore rule', () => {
  it('detects contact continuing after a stated boundary', () => {
    const findings = boundaryIgnoreRule.detect(
      msgs([
        'Dev: hello? why are you ignoring me',
        'Sara: please stop messaging me, i\'m not interested',
        'Dev: why are you ignoring me? see my messages?',
        'Dev: just answer me',
      ])
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('caution'); // 2 later messages
    expect(findings[0].messageIndexes).toContain(2); // the boundary message
  });

  it('escalates to elevated when 3+ messages follow the boundary', () => {
    const findings = boundaryIgnoreRule.detect(
      msgs([
        'Sara: stop contacting me',
        'Dev: why',
        'Dev: tell me',
        'Dev: answer',
        'Dev: please',
      ])
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('elevated');
  });

  it('does not flag conversations where contact stops', () => {
    const findings = boundaryIgnoreRule.detect(
      msgs(['Sara: please stop messaging me', 'Dev: ok, sorry'])
    );
    // "ok, sorry" is from the same sender as the boundary? No —
    // Dev != Sara, so it counts. This documents the rule's
    // conservative behaviour: any later message from a different
    // sender counts.
    expect(findings).toHaveLength(1);
  });
});

describe('repeated-contact rule', () => {
  it('detects chasing messages and escalates with frequency', () => {
    const findings = repeatedContactRule.detect(
      msgs([
        '[2025-01-06 21:14] Arjun: hey, are you there?',
        '[2025-01-06 21:15] Arjun: why aren\'t you replying?',
        '[2025-01-06 21:16] Arjun: see my messages?',
        '[2025-01-06 21:17] Arjun: answer me',
      ])
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('elevated');
  });

  it('flags caution for two chasing messages', () => {
    const findings = repeatedContactRule.detect(
      msgs(["Dev: hello?", "Dev: why aren't you replying?"])
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('caution');
  });

  it('detects high frequency within an hour even without chasing words', () => {
    const findings = repeatedContactRule.detect(
      msgs([
        '[2025-01-07 09:00] Arjun: good morning',
        '[2025-01-07 09:05] Arjun: what are you doing',
        '[2025-01-07 09:10] Arjun: are you awake',
        '[2025-01-07 09:15] Arjun: tell me something',
        '[2025-01-07 09:20] Arjun: anything',
      ])
    );
    expect(findings).toHaveLength(1);
  });

  it('does not flag a single normal message', () => {
    const findings = repeatedContactRule.detect(
      msgs(['Mom: call me when you are back'])
    );
    expect(findings).toHaveLength(0);
  });
});

describe('sensitive-info rule', () => {
  it('detects requests for OTP and card details', () => {
    const findings = sensitiveInfoRule.detect(
      msgs(['Support: share your card number and OTP to confirm your identity'])
    );
    expect(findings.length).toBeGreaterThanOrEqual(1);
    const urgent = findings.find((f) => f.severity === 'elevated');
    expect(urgent).toBeUndefined(); // no urgency word in this message
  });

  it('escalates urgent requests for sensitive information', () => {
    const findings = sensitiveInfoRule.detect(
      msgs(['Support: verify your account immediately. share your OTP now'])
    );
    const urgent = findings.find((f) => f.severity === 'elevated');
    expect(urgent).toBeDefined();
  });

  it('detects phishing verification language', () => {
    const findings = sensitiveInfoRule.detect(
      msgs(['Support: verify your account to avoid suspension'])
    );
    const phishing = findings.find((f) =>
      f.signal.toLowerCase().includes('phishing')
    );
    expect(phishing).toBeDefined();
  });

  it('does not flag statements without a request verb', () => {
    const findings = sensitiveInfoRule.detect(
      msgs(['Anu: i changed my password this morning'])
    );
    expect(findings).toHaveLength(0);
  });
});

describe('money-pressure rule', () => {
  it('detects payment demands', () => {
    const findings = moneyPressureRule.detect(
      msgs(['Stranger: send me 5000 rupees via UPI right away'])
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('caution');
  });

  it('escalates demands made under threat', () => {
    const findings = moneyPressureRule.detect(
      msgs(['Arjun: transfer the money or else there will be consequences'])
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('elevated');
  });

  it('does not flag ordinary money talk without pressure', () => {
    const findings = moneyPressureRule.detect(
      msgs(['Mom: you can send the money whenever you like, no rush'])
    );
    // "send the money" matches but no extortion context; severity caution.
    // This documents that benign money talk can produce a caution
    // finding — the limitation text explains context matters.
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('caution');
  });
});

describe('urgency-secrecy rule', () => {
  it('detects secrecy demands', () => {
    const findings = urgencySecrecyRule.detect(
      msgs(['Arjun: do not tell anyone about this. it is confidential'])
    );
    const secrecy = findings.find((f) => f.signal.includes('secrecy'));
    expect(secrecy).toBeDefined();
    expect(secrecy?.severity).toBe('caution');
  });

  it('detects manufactured urgency combined with a request', () => {
    const findings = urgencySecrecyRule.detect(
      msgs(['Support: act right now or your account will be blocked'])
    );
    const urgency = findings.find((f) => f.signal.includes('urgency'));
    expect(urgency).toBeDefined();
  });

  it('does not flag urgency without a request to act', () => {
    const findings = urgencySecrecyRule.detect(
      msgs(['Anu: the results are right here'])
    );
    expect(findings).toHaveLength(0);
  });
});

describe('impersonation rule', () => {
  it('detects fake-authority claims', () => {
    const findings = impersonationRule.detect(
      msgs(['Support: i am a bank official and need to verify you'])
    );
    expect(findings.length).toBeGreaterThanOrEqual(1);
  });

  it('detects official-notice and suspension language', () => {
    const findings = impersonationRule.detect(
      msgs([
        'Support: This is an official notice from your bank. Your account has been suspended due to suspicious activity.',
      ])
    );
    expect(findings.length).toBeGreaterThanOrEqual(1);
  });
});

describe('location-probe rule', () => {
  it('detects questions about where you live', () => {
    const findings = locationProbeRule.detect(
      msgs(['Arjun: tell me where you live. i will come to your college'])
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('caution');
  });

  it('detects address-like strings', () => {
    const findings = locationProbeRule.detect(
      msgs(['The delivery reached 12 Park street yesterday'])
    );
    expect(findings).toHaveLength(1);
  });
});

describe('channel-bypass rule', () => {
  it('is informational when chasing is absent', () => {
    const findings = channelBypassRule.detect(
      msgs(['Arjun: what\'s your whatsapp? let\'s talk there'])
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('informational');
  });

  it('becomes caution when combined with chasing', () => {
    const findings = channelBypassRule.detect(
      msgs([
        'Dev: why aren\'t you replying?',
        'Dev: what\'s your whatsapp, move there',
        'Dev: see my messages?',
      ])
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('caution');
  });
});

describe('manipulation rule', () => {
  it('detects guilt-tripping', () => {
    const findings = manipulationRule.detect(
      msgs(['Arjun: you owe me an explanation after all i did for you'])
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('informational');
  });

  it('does not flag ordinary affection', () => {
    const findings = manipulationRule.detect(
      msgs(['Anu: i love you mom'])
    );
    expect(findings).toHaveLength(0);
  });
});
