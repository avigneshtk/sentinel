import { SafetyCenterPanel } from '@/components/safety-center/safety-center-panel';

export const metadata = {
  title: 'Safety & Reporting Centre',
};

export default function SafetyCenterPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">
          Safety & Reporting Centre
        </h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Practical safety steps and official reporting
          channels for your country and situation. You do not
          need to prove anything to use these resources — and
          using SENTINEL never files a complaint on your
          behalf.
        </p>
      </section>

      <SafetyCenterPanel />
    </div>
  );
}
