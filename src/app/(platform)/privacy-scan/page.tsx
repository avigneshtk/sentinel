import { ScanPanel } from '@/components/privacy-scanner/scan-panel';
import { Alert } from '@/components/ui/alert';

export const metadata = {
  title: 'TRACELESS — Privacy Scanner',
};

export default function PrivacyScanPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">
          TRACELESS
        </h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          A privacy scanner for images and captions. Before you
          publish a photo, TRACELESS reads visible text
          on-device (real OCR via Tesseract.js) and checks it —
          plus your caption — for a limited, documented set of
          personal-information exposures.
        </p>
      </section>

      <Alert tone="info" title="On-device only">
        Your image and caption are processed entirely in your
        browser. TRACELESS does not upload images to any
        server or external AI service. Nothing is retained
        after you close the page.
      </Alert>

      <ScanPanel />
    </div>
  );
}
