import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/layout/navbar';
import { Alert } from '@/components/ui/alert';

const OUTCOMES = [
  {
    icon: '👁',
    title: 'Recognize threats',
    body: 'Understand warning signs in messages — pressure, secrecy, impersonation, threats — explained in plain language.',
  },
  {
    icon: '🛡',
    title: 'Prevent exposure',
    body: 'Scan photos and captions for personal information before publishing, and reduce what strangers can learn.',
  },
  {
    icon: '📈',
    title: 'Detect early',
    body: 'Spot repeated contact, ignored boundaries, and escalation across messages — as early as the evidence permits.',
  },
  {
    icon: '🚪',
    title: 'Take action',
    body: 'Reach official reporting channels and support, with country-specific resources you can verify yourself.',
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="pb-4 pt-10 text-center sm:pt-16">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-indigo-300">
            Track 03 · The Human Attack Surface
          </span>
        </div>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-50 sm:text-6xl">
          SENTINEL
        </h1>
        <p className="mt-3 text-xl font-medium text-indigo-300">
          Digital Safety & Threat Intelligence Platform
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          Detect threats. Protect privacy. Take action. Help
          people — particularly women — recognize digital
          threats, catch warning signs early, reduce personal
          exposure, and reach the right support.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard">
            <Button size="lg">Get started</Button>
          </Link>
          <Link href="/analyze">
            <Button size="lg" variant="secondary">
              Analyze a conversation
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Free · No account · Nothing you paste leaves your
          browser
        </p>
      </section>

      {/* Immediate danger banner */}
      <section className="mx-auto max-w-3xl">
        <Alert tone="danger" title="In immediate danger?">
          <p>
            Call your local emergency number now. In India:{' '}
            <a href="tel:112" className="font-semibold underline">
              112
            </a>{' '}
            (emergency),{' '}
            <a href="tel:181" className="font-semibold underline">
              181
            </a>{' '}
            (women helpline),{' '}
            <a href="tel:1930" className="font-semibold underline">
              1930
            </a>{' '}
            (cyber crime helpline). SENTINEL is not a
            substitute for emergency help.
          </p>
        </Alert>
      </section>

      {/* The gap */}
      <section>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">
            The gap SENTINEL fills
          </h2>
          <p className="mt-3 text-slate-300">
            Modern security systems keep getting smarter, yet
            most attacks still exploit human behaviour, trust,
            and unawareness. Women face additional digital
            threats — online harassment, impersonation,
            cyberstalking, and image-based abuse — and existing
            tools often fail to detect them early or guide
            victims toward effective support.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OUTCOMES.map((outcome) => (
            <Card key={outcome.title} className="h-full">
              <span
                aria-hidden="true"
                className="text-2xl"
              >
                {outcome.icon}
              </span>
              <h3 className="mt-3 font-semibold text-slate-100">
                {outcome.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-400">
                {outcome.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">
            Four tools, one platform
          </h2>
          <p className="mt-3 text-slate-300">
            Every tool is functional, explainable, and
            privacy-first. Try the fictional demo scenarios —
            the same input always produces the same results.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="flex items-center gap-2 font-semibold text-slate-100">
              <span aria-hidden="true">💬</span> TraceTrust
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Conversation-level behavioural analysis. Detects
              repeated unwanted contact, escalation,
              manipulation, threats, and social engineering —
              with per-message explanations and honest
              uncertainty.
            </p>
            <div className="mt-4">
              <Link href="/analyze">
                <Button size="sm">Open TraceTrust</Button>
              </Link>
            </div>
          </Card>
          <Card>
            <h3 className="flex items-center gap-2 font-semibold text-slate-100">
              <span aria-hidden="true">🖼</span> TRACELESS
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Privacy scanner for images and captions. Real
              on-device OCR detects phone numbers, emails,
              address clues, and document references before
              you publish.
            </p>
            <div className="mt-4">
              <Link href="/privacy-scan">
                <Button size="sm">Open TRACELESS</Button>
              </Link>
            </div>
          </Card>
          <Card>
            <h3 className="flex items-center gap-2 font-semibold text-slate-100">
              <span aria-hidden="true">🗒</span> Incident Timeline
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Organize incidents chronologically, notice
              repeated categories, edit or delete records,
              and export a factual summary. You control
              retention.
            </p>
            <div className="mt-4">
              <Link href="/timeline">
                <Button size="sm">Open Timeline</Button>
              </Link>
            </div>
          </Card>
          <Card>
            <h3 className="flex items-center gap-2 font-semibold text-slate-100">
              <span aria-hidden="true">🛟</span> Safety Centre
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Country-specific official reporting channels,
              helplines, and step-by-step safety guidance for
              each incident type.
            </p>
            <div className="mt-4">
              <Link href="/safety-center">
                <Button size="sm">Open Safety Centre</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Ethics commitments */}
      <section>
        <div className="mx-auto max-w-3xl">
          <Card>
            <h2 className="text-xl font-bold text-slate-50">
              Our commitments
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li className="flex gap-2.5">
                <span aria-hidden="true">🔒</span>
                Privacy by design — analysis is browser-side;
                no accounts; no silent uploads; meaningful
                delete controls.
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden="true">🔍</span>
                Explainability — every finding shows the exact
                text that triggered it, why it matters, and
                what is uncertain.
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden="true">⚖</span>
                No accusations — SENTINEL never claims
                anyone&apos;s guilt, identity, or intent is
                proven, and never contacts anyone on your
                behalf.
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden="true">💜</span>
                Women&apos;s digital safety is a core
                requirement, not a feature afterthought.
              </li>
            </ul>
            <div className="mt-6 text-center">
              <Logo />
              <p className="mt-2 text-xs text-slate-500">
                Built for FISAT Hack2Pitch · Demonstration
                data is fictional
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
