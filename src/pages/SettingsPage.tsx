import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Download, FileJson, RotateCcw, Trash2, Upload } from 'lucide-react';
import { selectData, useAppStore } from '@/store/appStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProfileForm } from '@/components/domain/ProfileForm';
import { WeightsEditor } from '@/components/domain/WeightsEditor';
import { downloadFile, parseImport, resultsToCsv, serializeExport, topicsToCsv } from '@/lib/storage/exportImport';
import { validateThresholds } from '@/lib/engine/performance';
import { STORAGE_KEY } from '@/lib/storage/storage';
import { toast } from '@/store/toastStore';
import { toISODate } from '@/lib/date';
import type { AppData, EngineSettings, PerformanceThresholds } from '@/types';

type Pending = { kind: 'import'; data: AppData; fileName: string } | { kind: 'demo' } | { kind: 'delete' } | null;

const ENGINE_FIELDS: { key: Exclude<keyof EngineSettings, 'weights'>; label: string; hint: string; min: number; max: number }[] = [
  { key: 'defaultUnassessedGap', label: 'Assumed gap for unassessed topics', hint: 'G used before a topic is assessed (0–100)', min: 0, max: 100 },
  { key: 'prerequisiteMastery', label: 'Prerequisite mastery score (%)', hint: 'A prerequisite counts as satisfied at this score or when completed', min: 0, max: 100 },
  { key: 'revisionStabilityDays', label: 'Memory stability (days)', hint: 'S₀ in the revision forgetting curve (1–365)', min: 1, max: 365 },
  { key: 'reviewThreshold', label: 'Review threshold (R)', hint: 'Completed topics with R at or above this are suggested for revision', min: 0, max: 100 },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile)!;
  const settings = useAppStore((s) => s.settings);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const importData = useAppStore((s) => s.importData);
  const loadDemo = useAppStore((s) => s.loadDemo);
  const clearAll = useAppStore((s) => s.clearAll);
  const fileInput = useRef<HTMLInputElement>(null);

  const [engineDraft, setEngineDraft] = useState(settings.engine);
  const [thresholdDraft, setThresholdDraft] = useState<PerformanceThresholds>(settings.thresholds);
  const [pending, setPending] = useState<Pending>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const engineError = ENGINE_FIELDS.map((f) => {
    const v = engineDraft[f.key];
    return Number.isFinite(v) && v >= f.min && v <= f.max ? null : `${f.label} must be between ${f.min} and ${f.max}.`;
  }).find(Boolean);
  const thresholdError = validateThresholds(thresholdDraft);
  const engineDirty = ENGINE_FIELDS.some((f) => engineDraft[f.key] !== settings.engine[f.key]);
  const thresholdDirty = (['developing', 'good', 'excellent'] as const).some((k) => thresholdDraft[k] !== settings.thresholds[k]);

  let storageKb = 0;
  try {
    storageKb = Math.round((window.localStorage.getItem(STORAGE_KEY)?.length ?? 0) / 1024);
  } catch {
    storageKb = 0;
  }

  const stamp = toISODate(new Date());
  const exportJson = () => {
    downloadFile(`smart-learning-backup-${stamp}.json`, serializeExport(selectData(useAppStore.getState())), 'application/json');
    toast('Backup downloaded as JSON.');
  };
  const exportCsv = (kind: 'topics' | 'results') => {
    const data = selectData(useAppStore.getState());
    downloadFile(`smart-learning-${kind}-${stamp}.csv`, kind === 'topics' ? topicsToCsv(data) : resultsToCsv(data), 'text/csv');
    toast(`${kind === 'topics' ? 'Topic progress' : 'Assessment history'} exported as CSV.`);
  };

  const onFile = async (file: File | undefined) => {
    setImportErrors([]);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setImportErrors(['The file is larger than 5 MB and cannot be a valid backup.']);
      return;
    }
    const parsed = parseImport(await file.text());
    if (fileInput.current) fileInput.current.value = '';
    if (!parsed.ok) {
      setImportErrors(parsed.errors);
      toast('Import failed — the file is not a valid backup.', 'error');
      return;
    }
    if (!parsed.data.profile) {
      setImportErrors(['The backup does not contain a student profile.']);
      return;
    }
    setPending({ kind: 'import', data: parsed.data, fileName: file.name });
  };

  return (
    <>
      <PageHeader title="Settings" description="Profile, learning preferences, algorithm configuration and local data management." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Profile settings" className="lg:col-span-2">
          <ProfileForm
            key={profile.id}
            initial={profile}
            submitLabel="Save profile"
            onSubmit={(values) => {
              updateProfile(values);
              toast('Profile saved.');
            }}
          />
        </Card>

        <Card title="Recommendation weights" description="P = wG·G + wD·D + wI·I + wR·R. Saved immediately.">
          <WeightsEditor weights={settings.engine.weights} onChange={(weights) => {
            updateSettings({ ...settings, engine: { ...settings.engine, weights } });
            setEngineDraft((d) => ({ ...d, weights }));
          }} />
        </Card>

        <Card title="Learning preferences" description="Parameters of the PBWPS engine">
          <form
            className="space-y-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (engineError) return;
              updateSettings({ ...settings, engine: { ...engineDraft, weights: settings.engine.weights } });
              toast('Learning preferences saved — recommendations updated.');
            }}
          >
            {ENGINE_FIELDS.map((f) => (
              <Field key={f.key} label={f.label} htmlFor={`eng-${f.key}`} hint={f.hint}>
                <input
                  id={`eng-${f.key}`}
                  type="number"
                  min={f.min}
                  max={f.max}
                  className="input"
                  value={Number.isNaN(engineDraft[f.key]) ? '' : engineDraft[f.key]}
                  onChange={(e) => setEngineDraft({ ...engineDraft, [f.key]: e.target.valueAsNumber })}
                />
              </Field>
            ))}
            {engineError && <p className="text-xs font-medium text-red-600" role="alert">{engineError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" disabled={!engineDirty} onClick={() => setEngineDraft(settings.engine)}>
                Discard
              </Button>
              <Button type="submit" disabled={!engineDirty || Boolean(engineError)}>
                Save preferences
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Performance thresholds" description="Boundaries between Needs Improvement, Developing, Good and Excellent">
          <form
            className="space-y-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (thresholdError) return;
              updateSettings({ ...settings, thresholds: thresholdDraft });
              toast('Thresholds saved.');
            }}
          >
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  ['developing', 'Developing from'],
                  ['good', 'Good from'],
                  ['excellent', 'Excellent from'],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label} htmlFor={`th-${key}`}>
                  <input
                    id={`th-${key}`}
                    type="number"
                    min={0}
                    max={100}
                    className="input"
                    value={Number.isNaN(thresholdDraft[key]) ? '' : thresholdDraft[key]}
                    onChange={(e) => setThresholdDraft({ ...thresholdDraft, [key]: e.target.valueAsNumber })}
                  />
                </Field>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Below {thresholdDraft.developing}% = Needs Improvement. Topics below the Developing threshold are treated as weak and scheduled first.
            </p>
            {thresholdError && <p className="text-xs font-medium text-red-600" role="alert">{thresholdError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setThresholdDraft({ developing: 40, good: 60, excellent: 80 })}>
                Defaults
              </Button>
              <Button type="submit" disabled={!thresholdDirty || Boolean(thresholdError)}>
                Save thresholds
              </Button>
            </div>
          </form>
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <Database size={16} /> Data management
            </span>
          }
          description={`All data lives in this browser’s LocalStorage (≈ ${storageKb} KB used).`}
        >
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-slate-800">Export</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="secondary" icon={<FileJson size={16} />} onClick={exportJson}>
                  Full backup (JSON)
                </Button>
                <Button variant="secondary" icon={<Download size={16} />} onClick={() => exportCsv('topics')}>
                  Topic progress (CSV)
                </Button>
                <Button variant="secondary" icon={<Download size={16} />} onClick={() => exportCsv('results')}>
                  Assessments (CSV)
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Import</p>
              <p className="text-xs text-slate-500">Restore a previously exported JSON backup. The file is validated before anything is replaced.</p>
              <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" aria-label="Choose backup file" onChange={(e) => void onFile(e.target.files?.[0])} />
              <Button className="mt-2" variant="secondary" icon={<Upload size={16} />} onClick={() => fileInput.current?.click()}>
                Import JSON backup
              </Button>
              {importErrors.length > 0 && (
                <ul className="mt-2 list-disc space-y-0.5 rounded-lg bg-red-50 p-3 pl-6 text-xs text-red-700" role="alert">
                  {importErrors.slice(0, 6).map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-slate-100 pt-5">
              <p className="text-sm font-medium text-slate-800">Reset</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={() => setPending({ kind: 'demo' })}>
                  Reset to demo data
                </Button>
                <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => setPending({ kind: 'delete' })}>
                  Delete all data
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={pending?.kind === 'import'}
        tone="primary"
        title="Restore this backup?"
        message={
          pending?.kind === 'import'
            ? `“${pending.fileName}” contains ${pending.data.subjects.length} subjects, ${pending.data.topics.length} topics and ${pending.data.results.length} assessment results for ${pending.data.profile?.name}. Your current data will be replaced.`
            : ''
        }
        confirmLabel="Restore backup"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending?.kind === 'import') {
            importData(pending.data);
            setEngineDraft(pending.data.settings.engine);
            setThresholdDraft(pending.data.settings.thresholds);
            toast('Backup restored.');
          }
          setPending(null);
        }}
      />
      <ConfirmDialog
        open={pending?.kind === 'demo'}
        title="Reset to demo data?"
        message="Your profile, subjects, assessments and progress will be replaced by the demo student. Export a backup first if you want to keep them."
        confirmLabel="Reset to demo"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          loadDemo();
          const fresh = useAppStore.getState().settings;
          setEngineDraft(fresh.engine);
          setThresholdDraft(fresh.thresholds);
          setPending(null);
          toast('Demo data restored.');
        }}
      />
      <ConfirmDialog
        open={pending?.kind === 'delete'}
        title="Delete all application data?"
        message="This permanently removes your profile, curriculum changes, assessment history, progress and schedule from this browser. This cannot be undone."
        requireText="DELETE"
        confirmLabel="Delete everything"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          setPending(null);
          clearAll();
          toast('All data deleted.', 'info');
          navigate('/', { replace: true });
        }}
      />
    </>
  );
}
