/**
 * Deterministic demo scenarios for TraceTrust.
 *
 * ALL CONTENT IS FICTIONAL. Names, messages, and
 * situations were written for this demonstration.
 * The same input always produces the same findings
 * because the engine is a fixed rule set.
 */

export interface DemoScenario {
  id: string;
  title: string;
  label: string;
  description: string;
  labels: string[];
  text: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'escalating-contact',
    title: 'Scenario 1 — Repeated contact that escalates',
    label: 'Escalating unwanted contact (fictional)',
    description:
      'FICTIONAL. A young woman receives messages from a college acquaintance. The contact becomes more frequent, ignores a stated boundary, probes for her location, and turns threatening over three days.',
    labels: ['boundary-ignored', 'repeated-contact', 'in-person-safety'],
    text: `[2025-01-06 21:14] Arjun: hey long time! we should catch up soon
[2025-01-06 21:15] Arjun: why aren't you replying?
[2025-01-06 21:16] Arjun: see my messages?
[2025-01-07 09:02] Arjun: good morning. what are you doing today?
[2025-01-07 09:03] Arjun: answer me
[2025-01-07 09:04] Priya: please stop contacting me. i don't want to talk to you.
[2025-01-07 09:06] Arjun: why are you ignoring me? you owe me an explanation
[2025-01-07 09:07] Arjun: tell me where you live. i'll come to your college
[2025-01-08 22:41] Arjun: you'd better start replying or else there will be consequences
[2025-01-08 22:42] Arjun: don't tell anyone about this. keep it between us
[2025-01-09 03:12] Arjun: i know where your hostel is. if you don't send a photo of yourself i'll post your pictures everywhere`,
  },
  {
    id: 'benign-family',
    title: 'Scenario 2 — Ordinary family conversation',
    label: 'Benign conversation (fictional)',
    description:
      'FICTIONAL. An ordinary morning conversation between a mother and daughter. This scenario should produce few or no warning signs — a control case showing the engine does not flag normal chats.',
    labels: [],
    text: `[2025-01-06 08:12] Mom: good morning! did you eat?
[2025-01-06 08:14] Anu: yes mom. had dosa
[2025-01-06 08:15] Mom: great. what are your plans today?
[2025-01-06 08:16] Anu: library in the morning, meeting a friend later
[2025-01-06 08:17] Mom: ok. call me when you are back
[2025-01-06 08:18] Anu: will do. love you mom
[2025-01-06 08:20] Mom: love you too. don't forget your umbrella, rain is expected`,
  },
  {
    id: 'bank-phishing',
    title: 'Scenario 3 — Fake bank "verification" (social engineering)',
    label: 'Social engineering / financial pressure (fictional)',
    description:
      'FICTIONAL. Messages that impersonate a bank, create urgency, demand secrecy, and ask for card details and an OTP — a classic phishing and fraud pattern.',
    labels: ['impersonation-suspected', 'financial-pressure'],
    text: `[2025-01-10 10:05] Support: This is an official notice from your bank. Your account has been suspended due to suspicious activity.
[2025-01-10 10:06] Support: verify your account immediately. share your card number and OTP to confirm your identity
[2025-01-10 10:08] Support: this is urgent. act right now or your account will be permanently blocked
[2025-01-10 10:09] Support: do not tell anyone. it is confidential`,
  },
  {
    id: 'boundary-ignored-simple',
    title: 'Scenario 4 — Boundary ignored, no explicit threats',
    label: 'Boundary ignored without violent language (fictional)',
    description:
      'FICTIONAL. Shows that SENTINEL does not need explicit violent language to flag a meaningful warning sign: contact continues after a clear request to stop.',
    labels: ['boundary-ignored'],
    text: `[2025-02-01 18:22] Dev: hi! are we still on for tonight?
[2025-02-01 18:40] Dev: hello? why aren't you replying
[2025-02-01 18:41] Sara: dev please stop messaging me, i'm not interested
[2025-02-01 18:55] Dev: why are you ignoring me? see my messages?
[2025-02-01 18:56] Dev: just tell me what i did wrong, answer me`,
  },
];
