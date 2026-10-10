/**
 * Safety & Reporting Centre — verified official resources.
 *
 * Every entry below was verified against the official
 * source before inclusion (see AUDIT.md for verification
 * notes). Do not add a country or resource without
 * verifying it against the official government site.
 *
 * Structure is extensible: add a new country object to
 * REPORTING_RESOURCES and it will appear in the UI.
 */

export type ResourceType =
  | 'emergency'
  | 'official-reporting'
  | 'helpline'
  | 'support'
  | 'guidance';

export interface ReportingResource {
  name: string;
  url: string;
  type: ResourceType;
  description: string;
  /** For phone-based resources, the number to call. */
  phone?: string;
}

export interface CountryResources {
  code: string;
  name: string;
  emergencyNumber: string;
  emergencyNote: string;
  resources: ReportingResource[];
}

export const REPORTING_RESOURCES: CountryResources[] = [
  {
    code: 'IN',
    name: 'India',
    emergencyNumber: '112',
    emergencyNote:
      '112 is the pan-India Emergency Response Support System (ERSS) number for police, fire, and ambulance emergencies. It works from any phone.',
    resources: [
      {
        name: 'National Cyber Crime Reporting Portal',
        url: 'https://cybercrime.gov.in/',
        type: 'official-reporting',
        description:
          'Government of India portal (Ministry of Home Affairs / I4C) to report cybercrime online, with a special focus on crimes against women and children. Filing here is how you make an official complaint — SENTINEL does not file it for you.',
      },
      {
        name: 'National Cyber Crime Helpline — 1930',
        url: 'https://cybercrime.gov.in/Webform/Helpline.aspx',
        type: 'helpline',
        phone: '1930',
        description:
          'Toll-free national helpline (24×7) for guidance on reporting cybercrime, including online harassment, identity theft, and financial fraud. For financial fraud, call 1930 immediately — quick reporting can help freeze the money trail.',
      },
      {
        name: 'Women Helpline — 181',
        url: 'https://wcd.gov.in/women/help',
        type: 'support',
        phone: '181',
        description:
          'Toll-free 24-hour helpline for women, run by the Ministry of Women and Child Development. Connects callers to emergency response (112), One Stop Centres, and counselling. Note: availability varies by state/UT.',
      },
      {
        name: 'Emergency Response Support System — 112',
        url: 'https://www.112.gov.in/',
        type: 'emergency',
        phone: '112',
        description:
          'Single pan-India emergency number (police, fire, ambulance). If you are in immediate danger, call 112 first. The 112 India app also offers a panic button and SHOUT feature for women and children.',
      },
      {
        name: 'Childline — 1098',
        url: 'https://www.childline.gov.in/',
        type: 'support',
        phone: '1098',
        description:
          '24-hour emergency helpline for children and young people, including online abuse and exploitation. If you are under 18, you can call 1098.',
      },
    ],
  },
  {
    code: 'US',
    name: 'United States',
    emergencyNumber: '911',
    emergencyNote:
      'Call 911 for emergencies, or your local police non-emergency line for non-urgent reports.',
    resources: [
      {
        name: 'FBI Internet Crime Complaint Center (IC3)',
        url: 'https://www.ic3.gov/',
        type: 'official-reporting',
        description:
          'The FBI-run central hub for reporting cyber-enabled crime, including online fraud, extortion, and threats. File a report even if you are unsure it qualifies.',
      },
      {
        name: 'National Domestic Violence Hotline',
        url: 'https://www.thehotline.org/',
        type: 'support',
        phone: '1-800-799-7233',
        description:
          '24/7 confidential support for people experiencing abuse, including digital abuse and stalking. Also offers a chat option on the website.',
      },
      {
        name: 'Cyberbullying Research Center',
        url: 'https://cyberbullying.org/',
        type: 'guidance',
        description:
          'Independent research and guidance on cyberbullying, including state-by-state legal information and how to respond.',
      },
    ],
  },
  {
    code: 'UK',
    name: 'United Kingdom',
    emergencyNumber: '999',
    emergencyNote:
      'Call 999 for emergencies. For non-urgent police matters in England, Wales, and Northern Ireland, call 101; in Scotland, call Police Scotland on 101.',
    resources: [
      {
        name: 'Report Fraud (City of London Police)',
        url: 'https://www.reportfraud.police.uk/',
        type: 'official-reporting',
        phone: '0300 123 2040',
        description:
          'The UK national centre for reporting cyber crime and fraud (replaced Action Fraud in December 2025). Report online any time, or call 0300 123 2040 (Mon–Fri, 8am–8pm). Businesses under live attack should call immediately.',
      },
      {
        name: 'Revenge Porn Helpline',
        url: 'https://www.revengepornhelpline.org.uk/',
        type: 'support',
        phone: '0345 600 0459',
        description:
          'UK specialist support for image-based abuse, including help removing intimate images shared without consent.',
      },
      {
        name: 'Samaritans',
        url: 'https://www.samaritans.org/',
        type: 'support',
        phone: '116 123',
        description:
          '24/7 emotional support for anyone in distress, whatever the cause.',
      },
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    emergencyNumber: '000',
    emergencyNote:
      'Call 000 for emergencies (police, fire, ambulance).',
    resources: [
      {
        name: 'ReportCyber (Australian Cyber Security Centre)',
        url: 'https://www.cyber.gov.au/report',
        type: 'official-reporting',
        description:
          'Australian Government portal to report cybercrime, cyber incidents, and ransomware. Cyber security hotline: 1300 CYBER1 (1300 292 371).',
      },
      {
        name: 'eSafety Commissioner',
        url: 'https://www.esafety.gov.au/report',
        type: 'official-reporting',
        description:
          'Official Australian Government safety commissioner. Investigates image-based abuse (sharing or threatening to share intimate images without consent), adult cyber abuse, and cyberbullying of children — and can order harmful content removed.',
      },
    ],
  },
  {
    code: 'CA',
    name: 'Canada',
    emergencyNumber: '911',
    emergencyNote: 'Call 911 for emergencies.',
    resources: [
      {
        name: 'Canadian Anti-Fraud Centre',
        url: 'https://antifraudcentre-centreantifraude.ca/',
        type: 'official-reporting',
        phone: '1-888-495-8501',
        description:
          'Canada\'s central agency for reporting fraud, including online fraud, identity theft, and extortion. Operated with the RCMP and Ontario Provincial Police.',
      },
      {
        name: 'NeedHelpNow.ca (Canadian Centre for Child Protection)',
        url: 'https://needhelpmow.com/',
        type: 'support',
        description:
          'Support for young people dealing with image-based abuse and sextortion, including help removing images. (If the link changes, search "NeedHelpNow Canada".)',
      },
    ],
  },
];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  emergency: 'Emergency',
  'official-reporting': 'Official reporting',
  helpline: 'Helpline',
  support: 'Support',
  guidance: 'Guidance',
};

/** Practical, non-country-specific safety guidance per incident type. */
export type IncidentType =
  | 'harassment'
  | 'stalking'
  | 'impersonation'
  | 'financial-scam'
  | 'image-based-abuse'
  | 'threats'
  | 'privacy-exposure'
  | 'general';

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  harassment: 'Online harassment or abusive messages',
  stalking: 'Cyberstalking / repeated unwanted contact',
  impersonation: 'Impersonation or fake profile',
  'financial-scam': 'Financial scam or fraud',
  'image-based-abuse': 'Image-based abuse / intimate images',
  threats: 'Threats or intimidation',
  'privacy-exposure': 'Privacy exposure / doxxing',
  general: 'General safety guidance',
};

export const INCIDENT_GUIDANCE: Record<IncidentType, string[]> = {
  harassment: [
    'Do not respond to abusive messages — replying can escalate them.',
    'Keep evidence: screenshots or exports with dates, sender, and platform for each message.',
    'Use the platform\'s mute, block, and report tools.',
    'Tell a trusted person what is happening; harassment is easier to carry with support.',
    'If harassment is severe, threatening, or persistent, file an official report through the resources below.',
  ],
  stalking: [
    'Repeated contact after you have asked for it to stop is a warning sign — take it seriously.',
    'Do not engage, negotiate, or try to reason with the person.',
    'Document every contact with dates and times, even short ones.',
    'Review your privacy settings and limit what is publicly visible.',
    'Tell a trusted person and consider reporting to police — stalking is a crime in most jurisdictions.',
  ],
  impersonation: [
    'Do not confront the impersonator directly — it can escalate the situation.',
    'Report the fake account through the platform\'s impersonation reporting flow.',
    'Warn friends and followers through a channel you control, without sharing the fake account\'s content.',
    'Capture screenshots of the fake profile (URLs, posts, messages) before it is taken down.',
  ],
  'financial-scam': [
    'Stop all contact with the person immediately.',
    'If you sent money: contact your bank right away and ask about freezing or recalling the transfer.',
    'In India, call the cyber crime helpline 1930 immediately — fast reporting can help freeze the money trail.',
    'Never pay "recovery fees" — recovery scams target people who have already lost money.',
    'Report the account, phone number, and UPI/payment IDs through the official portal below.',
  ],
  'image-based-abuse': [
    'Do not pay, comply with demands, or send further images — it rarely stops the threats.',
    'Stop contact with the person if you can do so safely.',
    'Keep evidence (screenshots with dates) but do not reshare the images.',
    'Report the account on the platform and file an official report through the resources below.',
    'Specialist help exists: in the UK, the Revenge Porn Helpline; in Australia, the eSafety Commissioner; in India, the cyber crime portal (cybercrime.gov.in). It is not your fault.',
  ],
  threats: [
    'If you are in immediate danger, call your local emergency number now (India: 112).',
    'Take threats seriously even if they seem like bluster.',
    'Do not provoke or negotiate with the person.',
    'Keep the messages as evidence, including timestamps.',
    'Tell a trusted person and consider filing an official report.',
  ],
  'privacy-exposure': [
    'If your address, phone number, or private details were posted, document the post with a screenshot and URL.',
    'Report the post to the platform and request removal.',
    'Consider notifying people who may be affected (for example, if a phone number was exposed).',
    'Review privacy settings on your accounts and search your own name to see what is visible.',
    'If the exposure threatens your safety, contact local emergency services.',
  ],
  general: [
    'You do not need to prove anything to access safety resources.',
    'Keep records: screenshots or exports with dates and platform names.',
    'Use strong, unique passwords and turn on two-factor authentication.',
    'Be cautious with links, attachments, and requests for money or personal details — even from known contacts.',
    'If anything feels wrong, trust that feeling and talk to a trusted person.',
  ],
};
