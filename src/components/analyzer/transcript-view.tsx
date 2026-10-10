'use client';

/**
 * Chronological transcript view.
 *
 * Messages are shown in the order they were parsed
 * (chronological when timestamps are in order). Messages
 * implicated in findings are highlighted. Sender/date
 * information is shown only when the user supplied it.
 */

import { ConversationMessage, SignalMatch } from '@/lib/analysis/types';
import { Card } from '@/components/ui/card';

interface TranscriptViewProps {
  messages: ConversationMessage[];
  findings: SignalMatch[];
}

export function TranscriptView({ messages, findings }: TranscriptViewProps) {
  const flaggedIndexes = new Set<number>();
  for (const finding of findings) {
    for (const idx of finding.messageIndexes) flaggedIndexes.add(idx);
  }

  return (
    <Card>
      <h3 className="mb-1 text-base font-semibold text-slate-100">
        Conversation transcript
      </h3>
      <p className="mb-4 text-xs text-slate-500">
        Chronological view of what you pasted. Highlighted messages
        triggered findings. Senders and timestamps appear only when
        you provided them.
      </p>
      <ol className="space-y-2.5">
        {messages.map((message) => {
          const flagged = flaggedIndexes.has(message.index);
          return (
            <li
              key={message.id}
              className={`rounded-lg border px-3.5 py-2.5 text-sm ${
                flagged
                  ? 'border-indigo-400/50 bg-indigo-500/10'
                  : 'border-slate-800 bg-navy-850'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-400">
                  #{message.index}
                </span>
                {message.sender && (
                  <span className="font-medium text-slate-300">
                    {message.sender}
                  </span>
                )}
                {message.rawTimestamp && (
                  <time dateTime={message.timestamp?.toISOString()}>
                    {message.rawTimestamp}
                  </time>
                )}
                {flagged && (
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                    warning sign detected
                  </span>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-slate-200">
                {message.text}
              </p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
