'use client';

/**
 * TRACELESS privacy scanner.
 *
 * Fully browser-side: image validation, object-URL
 * lifecycle management, Tesseract.js OCR, and
 * exposure detection. Nothing is uploaded.
 */

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Field, TextArea, Label } from '@/components/ui/fields';
import { Alert } from '@/components/ui/alert';
import { analyzeCaption, analyzeTextForExposures, ExposureFinding } from '@/lib/privacy-scanner/detect-exposures';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  runOcr,
  validateImageFile,
} from '@/lib/privacy-scanner/ocr';
import { Tag } from '@/components/ui/badge';

type ScanState =
  | { kind: 'idle' }
  | { kind: 'scanning'; progress: number; status: string }
  | {
      kind: 'done';
      ocrText: string;
      confidence: number;
      exposures: ExposureFinding[];
      captionFindings: ExposureFinding[];
    }
  | { kind: 'error'; message: string };

export function ScanPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [fileError, setFileError] = useState<string | undefined>();
  const [state, setState] = useState<ScanState>({ kind: 'idle' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke temporary object URLs when they are replaced
  // or the component unmounts.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function handleFile(selected: File | null) {
    setFileError(undefined);
    setState({ kind: 'idle' });
    setFile(selected);
    if (!selected) {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
      setPreviewUrl(null);
      return;
    }
    const validation = validateImageFile(selected);
    if (!validation.ok) {
      setFileError(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFile(null);
      return;
    }
    const url = URL.createObjectURL(selected);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = url;
    setPreviewUrl(url);
  }

  async function handleScan() {
    if (!file || !objectUrlRef.current) return;
    setState({ kind: 'scanning', progress: 0, status: 'Loading OCR engine…' });
    try {
      const result = await runOcr(objectUrlRef.current, (p) => {
        setState({
          kind: 'scanning',
          progress: p.progress,
          status: p.status,
        });
      });

      const ocrFindings = analyzeTextForExposures(result.text, 'ocr');
      const captionFindings = analyzeCaption(caption);

      setState({
        kind: 'done',
        ocrText: result.text,
        confidence: result.confidence,
        exposures: ocrFindings,
        captionFindings,
      });
    } catch {
      setState({
        kind: 'error',
        message:
          'OCR could not read this image. It may be too dark, blurry, low-resolution, or contain no readable text. Try a sharper, well-lit image.',
      });
    }
  }

  function handleReset() {
    handleFile(null);
    setCaption('');
    setState({ kind: 'idle' });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Select an image"
          description="Processed entirely in your browser with Tesseract.js. Nothing is uploaded to any server."
          icon={<span aria-hidden="true">🖼</span>}
        />

        <Field
          label="Image file"
          htmlFor="image-input"
          error={fileError}
          hint={`PNG, JPEG, WebP, GIF, or BMP — up to ${(MAX_IMAGE_SIZE_BYTES / 1024 / 1024).toFixed(0)} MB.`}
        >
          <input
            ref={fileInputRef}
            id="image-input"
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="block w-full rounded-lg border border-slate-700 bg-navy-850 px-3 py-2.5 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-invalid={Boolean(fileError)}
          />
        </Field>

        {previewUrl && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Preview (stays on your device)
            </p>
            <img
              src={previewUrl}
              alt="Preview of the selected image"
              className="max-h-72 rounded-lg border border-slate-700 object-contain"
            />
          </div>
        )}

        <div className="mt-5">
          <Field
            label="Caption (optional)"
            htmlFor="caption-input"
            hint="The text you would post alongside the image."
          >
            <TextArea
              id="caption-input"
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Morning coffee at home 🏡"
            />
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            type="button"
            size="lg"
            onClick={handleScan}
            disabled={!file}
            loading={state.kind === 'scanning'}
          >
            {state.kind === 'scanning' ? 'Scanning…' : 'Scan locally'}
          </Button>
          <Button type="button" size="lg" variant="secondary" onClick={handleReset}>
            Clear
          </Button>
        </div>
      </Card>

      {state.kind === 'scanning' && (
        <Card>
          <p className="text-sm font-medium text-slate-200">
            {state.status}
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(state.progress * 100)}
            aria-label="OCR progress"
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-navy-800"
          >
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${Math.round(state.progress * 100)}%` }}
            />
          </div>
        </Card>
      )}

      {state.kind === 'error' && (
        <Alert tone="danger" title="Scan failed">
          {state.message}
        </Alert>
      )}

      {state.kind === 'done' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Text detected by OCR (verbatim)"
              description={`Tesseract.js read this text from your image (confidence: ${Math.round(state.confidence)}%). OCR is approximate — always review it yourself.`}
              icon={<span aria-hidden="true">📄</span>}
            />
            {state.ocrText.trim() ? (
              <pre className="whitespace-pre-wrap rounded-lg bg-navy-850 p-4 font-mono text-sm text-slate-200">
                {state.ocrText}
              </pre>
            ) : (
              <Alert tone="info">
                No readable text was detected in the image. That
                may simply mean the image has no text — it is not
                proof the image is safe to publish.
              </Alert>
            )}
          </Card>

          <ExposureResults
            title="Possible exposures in the image"
            findings={state.exposures}
            sourceNote="Detected in OCR text extracted from your image."
          />
          <ExposureResults
            title="Possible exposures in the caption"
            findings={state.captionFindings}
            sourceNote="Analyzed from the caption text you entered."
          />

          <Card>
            <CardHeader
              title="Limitations — read before trusting a scan"
              icon={<span aria-hidden="true">⚠</span>}
            />
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
              <li>
                OCR is approximate and can miss or mangle text,
                especially in handwriting, low light, or small
                fonts.
              </li>
              <li>
                SENTINEL checks a limited, documented set of
                exposures: phone numbers, emails, address clues,
                PIN codes near address words, and sensitive
                document keywords.
              </li>
              <li>
                It does <strong>not</strong> detect faces,
                objects, GPS metadata, or locations shown in the
                image, and it cannot detect every sensitive
                detail.
              </li>
              <li>
                A clean scan is <strong>not</strong> a guarantee
                that an image is safe to publish.
              </li>
              <li>
                Images and OCR text are processed only in your
                browser and are never uploaded or stored by
                SENTINEL.
              </li>
              <li>
                If the image involves intimate content or
                image-based abuse, do not upload it anywhere —
                see the Safety Centre for help instead.
              </li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function ExposureResults({
  title,
  findings,
  sourceNote,
}: {
  title: string;
  findings: ExposureFinding[];
  sourceNote: string;
}) {
  return (
    <Card>
      <CardHeader title={title} description={sourceNote} icon={<span aria-hidden="true">🔍</span>} />
      {findings.length === 0 ? (
        <p className="text-sm text-slate-400">
          No supported exposure patterns were detected in this
          text. Remember: this only covers the limited set of
          patterns listed under Limitations.
        </p>
      ) : (
        <div className="space-y-3" role="list" aria-label="Possible exposures">
          {findings.map((finding, i) => (
            <div
              key={i}
              role="listitem"
              className="rounded-lg border border-slate-700 bg-navy-850 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Tag>{formatKind(finding.kind)}</Tag>
                <span className="text-xs text-slate-500">
                  Confidence:{' '}
                  <strong className="text-slate-300">
                    {finding.confidence}
                  </strong>
                </span>
                <span className="text-xs text-slate-500">
                  Source:{' '}
                  <strong className="text-slate-300">
                    {finding.source === 'ocr' ? 'image (OCR)' : 'caption'}
                  </strong>
                </span>
              </div>
              <p className="mt-2 rounded bg-navy-900 px-2.5 py-1.5 font-mono text-sm text-slate-200">
                {finding.excerpt}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {finding.explanation}
              </p>
              <p className="mt-1.5 text-sm text-slate-400">
                <span className="font-medium text-slate-300">
                  Suggestion:
                </span>{' '}
                {finding.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function formatKind(kind: ExposureFinding['kind']): string {
  switch (kind) {
    case 'phone':
      return 'Phone number';
    case 'email':
      return 'Email address';
    case 'address-clue':
      return 'Address clue';
    case 'pin-code':
      return 'PIN / postal code';
    case 'document-keyword':
      return 'Sensitive document reference';
  }
}
