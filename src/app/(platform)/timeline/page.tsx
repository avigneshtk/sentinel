import { TimelinePanel } from '@/components/timeline/timeline-panel';

export const metadata = {
  title: 'Incident Timeline',
};

export default function TimelinePage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">
          Incident Timeline
        </h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Organize incidents chronologically, notice repeated
          categories, and export a factual summary for
          official reporting. You decide what is kept — records
          live in this browser only, and only if you opt in.
        </p>
      </section>

      <TimelinePanel />
    </div>
  );
}
