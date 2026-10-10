import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FindingsList } from '@/components/analyzer/findings-list';
import { SignalMatch } from '@/lib/analysis/types';

const messages = [
  { id: 'm1', index: 1, sender: 'Arjun', text: "I'll hurt you if you tell anyone" },
  { id: 'm2', index: 2, sender: 'Priya', text: 'please stop' },
];

const finding: SignalMatch = {
  ruleId: 'explicit-threats',
  signal: 'Explicit threat of violence or harm',
  severity: 'elevated',
  confidence: 'supported',
  excerpt: "I'll hurt you if you tell anyone",
  messageIndexes: [1],
  explanation: 'Direct threatening language.',
  recommendation: 'Prioritise your safety.',
  limitation: 'SENTINEL cannot verify intent.',
};

const xssFinding: SignalMatch = {
  ...finding,
  ruleId: 'test-xss',
  excerpt: '<script>alert("xss")</script>',
  messageIndexes: [],
};

describe('FindingsList — safe rendering of untrusted content', () => {
  it('renders the finding with signal, explanation, and recommendation', () => {
    render(<FindingsList findings={[finding]} messages={messages} />);
    expect(screen.getByText(finding.signal)).toBeInTheDocument();
    expect(screen.getByText(finding.explanation)).toBeInTheDocument();
    expect(screen.getByText(finding.recommendation)).toBeInTheDocument();
    // The excerpt appears in the "supporting text"
    // blockquote and in the full-message details.
    expect(screen.getAllByText(finding.excerpt).length).toBeGreaterThanOrEqual(1);
  });

  it('escapes HTML in untrusted excerpts instead of executing it', () => {
    render(<FindingsList findings={[xssFinding]} messages={messages} />);
    // The script tag must appear as literal text, not execute.
    expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();
    // No script element was actually created by React.
    const scripts = document.querySelectorAll('script');
    expect(scripts).toHaveLength(0);
  });

  it('shows a safe-state card when there are no findings', () => {
    render(<FindingsList findings={[]} messages={messages} />);
    expect(screen.getByText('No warning signs detected')).toBeInTheDocument();
  });

  it('labels severity with text, not color alone', () => {
    render(<FindingsList findings={[finding]} messages={messages} />);
    expect(screen.getByText('Elevated concern')).toBeInTheDocument();
  });
});
