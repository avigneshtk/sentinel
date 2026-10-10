import { Card, CardHeader } from '@/components/ui/card';
import {
  ToolCards,
  HowItWorks,
  PrivacySnapshot,
  RecentIncidents,
  QuickSupport,
} from '@/components/dashboard/dashboard-widgets';
import { DEMO_SCENARIOS } from '@/data/demo-scenarios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">
          Dashboard
        </h1>
        <p className="mt-2 text-slate-400">
          Welcome to SENTINEL. Start with an analysis, scan a
          photo, organize incidents, or find official support —
          no account needed, ever.
        </p>
      </section>

      <section aria-label="Safety tools">
        <ToolCards />
      </section>

      <section
        aria-label="Try a demo"
        className="grid gap-4 lg:grid-cols-3"
      >
        <Card className="lg:col-span-2">
          <CardHeader
            title="Try it with a fictional demo"
            description="The judges' demo path: escalating unwanted contact, analyzed in seconds."
            icon={<span aria-hidden="true">🎬</span>}
          />
          <p className="text-sm text-slate-300">
            Open TraceTrust and load{' '}
            <strong>Scenario 1 — Repeated contact that
            escalates</strong>. It shows repeated contact, an
            ignored boundary, location probing, secrecy demands,
            and a threat — with escalation analysis across three
            days. Then compare with Scenario 2, an ordinary
            family chat that should trigger no strong warnings.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {DEMO_SCENARIOS.slice(0, 3).map((s) => (
              <Link key={s.id} href={`/analyze?demo=${s.id}`}>
                <Button size="sm" variant="secondary">
                  {s.title.split('—')[0].trim()}
                </Button>
              </Link>
            ))}
          </div>
        </Card>
        <QuickSupport />
      </section>

      <section
        aria-label="How it works and your data"
        className="grid gap-4 lg:grid-cols-2"
      >
        <HowItWorks />
        <div className="space-y-4">
          <PrivacySnapshot />
          <RecentIncidents />
        </div>
      </section>
    </div>
  );
}
