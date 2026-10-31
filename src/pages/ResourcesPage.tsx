import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, ClipboardCheck, Code2, Dumbbell, FileText, Library, NotebookPen, Plus, Search, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useLookups } from '@/hooks/useEngine';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/store/toastStore';
import type { LearningResource, ResourceType } from '@/types';

const TYPE_META: Record<ResourceType, { label: string; icon: typeof FileText }> = {
  text: { label: 'Explanation', icon: FileText },
  code: { label: 'Code example', icon: Code2 },
  exercise: { label: 'Practice exercise', icon: Dumbbell },
  notes: { label: 'Revision notes', icon: NotebookPen },
  quiz: { label: 'Quiz material', icon: ClipboardCheck },
};
const TYPES = Object.keys(TYPE_META) as ResourceType[];

function ResourceCard({ resource, done, onToggle, onDelete }: { resource: LearningResource; done: boolean; onToggle: () => void; onDelete?: () => void }) {
  const [open, setOpen] = useState(false);
  const Icon = TYPE_META[resource.type].icon;
  return (
    <div className={`rounded-xl border ${done ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Icon size={17} />
        </div>
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
          <p className="text-sm font-medium text-slate-900">{resource.title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {TYPE_META[resource.type].label} · {resource.estimatedMinutes} min
            {resource.custom && <Badge tone="violet">Custom</Badge>}
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          {onDelete && (
            <button type="button" onClick={onDelete} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${resource.title}`}>
              <Trash2 size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={onToggle}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${done ? 'text-emerald-700 hover:bg-emerald-100' : 'text-slate-600 hover:bg-slate-100'}`}
            aria-pressed={done}
          >
            {done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
            {done ? 'Completed' : 'Mark done'}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
          {resource.type === 'code' ? (
            <pre className="code-block">
              <code>{resource.content}</code>
            </pre>
          ) : (
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{resource.content}</p>
          )}
          {resource.type === 'quiz' && (
            <ButtonLink to={`/assessment/${resource.topicId}`} size="sm" className="mt-3" icon={<ClipboardCheck size={14} />}>
              Take the graded assessment
            </ButtonLink>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResourcesPage() {
  const subjects = useAppStore((s) => s.subjects);
  const topics = useAppStore((s) => s.topics);
  const resources = useAppStore((s) => s.resources);
  const completedIds = useAppStore((s) => s.completedResourceIds);
  const toggleResource = useAppStore((s) => s.toggleResource);
  const addResource = useAppStore((s) => s.addResource);
  const deleteResource = useAppStore((s) => s.deleteResource);
  const { topicById, subjectById } = useLookups();
  const [params, setParams] = useSearchParams();

  const topicParam = params.get('topic') ?? '';
  const [subjectId, setSubjectId] = useState(() => topicById.get(topicParam)?.subjectId ?? 'all');
  const [type, setType] = useState<'all' | ResourceType>('all');
  const [status, setStatus] = useState<'all' | 'todo' | 'done'>('all');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<LearningResource | null>(null);
  const [draft, setDraft] = useState({ topicId: '', type: 'notes' as ResourceType, title: '', content: '', estimatedMinutes: 10 });
  const [draftError, setDraftError] = useState<string | null>(null);

  const completed = useMemo(() => new Set(completedIds), [completedIds]);
  const filtered = useMemo(
    () =>
      resources.filter((r) => {
        const topic = topicById.get(r.topicId);
        if (!topic || !subjectById.has(topic.subjectId)) return false;
        if (topicParam && r.topicId !== topicParam) return false;
        if (subjectId !== 'all' && topic.subjectId !== subjectId) return false;
        if (type !== 'all' && r.type !== type) return false;
        if (status === 'done' && !completed.has(r.id)) return false;
        if (status === 'todo' && completed.has(r.id)) return false;
        if (query && !`${r.title} ${r.content}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    [resources, topicById, subjectById, topicParam, subjectId, type, status, query, completed],
  );
  const groups = useMemo(() => {
    const map = new Map<string, LearningResource[]>();
    for (const r of filtered) map.set(r.topicId, [...(map.get(r.topicId) ?? []), r]);
    return [...map.entries()];
  }, [filtered]);

  const totalDone = resources.filter((r) => completed.has(r.id)).length;
  const subjectTopics = topics.filter((t) => subjectId === 'all' || t.subjectId === subjectId);

  const setTopicFilter = (id: string) => {
    const next = new URLSearchParams(params);
    if (id) next.set('topic', id);
    else next.delete('topic');
    setParams(next, { replace: true });
  };

  const saveDraft = () => {
    if (!draft.topicId) return setDraftError('Choose a topic.');
    if (draft.title.trim().length < 3) return setDraftError('Title must be at least 3 characters.');
    if (draft.content.trim().length < 10) return setDraftError('Content must be at least 10 characters.');
    if (!(draft.estimatedMinutes >= 1 && draft.estimatedMinutes <= 600)) return setDraftError('Estimated time must be 1–600 minutes.');
    addResource({ ...draft, title: draft.title.trim(), content: draft.content.trim(), ...(draft.type === 'code' ? { language: 'text' } : {}) });
    toast('Resource added.');
    setFormOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Learning Resources"
        description="Explanations, worked code examples, practice exercises, revision notes and quiz material for every topic — all stored locally."
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => {
              setDraft({ topicId: topicParam || topics[0]?.id || '', type: 'notes', title: '', content: '', estimatedMinutes: 10 });
              setDraftError(null);
              setFormOpen(true);
            }}
          >
            Add resource
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">{totalDone}</span> of {resources.length} resources completed
          </p>
          <div className="sm:w-1/2">
            <ProgressBar value={totalDone} max={resources.length || 1} tone="success" label="Resources completed" />
          </div>
        </div>
      </Card>

      <div className="mb-5 grid gap-3 md:grid-cols-5">
        <div className="relative md:col-span-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search…" aria-label="Search resources" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select
          className="input"
          aria-label="Filter by subject"
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setTopicFilter('');
          }}
        >
          <option value="all">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select className="input" aria-label="Filter by topic" value={topicParam} onChange={(e) => setTopicFilter(e.target.value)}>
          <option value="">All topics</option>
          {subjectTopics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select className="input" aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
          <option value="all">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_META[t].label}
            </option>
          ))}
        </select>
        <select className="input" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="all">Any status</option>
          <option value="todo">Not completed</option>
          <option value="done">Completed</option>
        </select>
      </div>

      {groups.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Library size={22} />} title="No resources match these filters" description="Clear a filter or add your own resource." />
        </div>
      ) : (
        <div className="space-y-6">
          {groups.slice(0, 30).map(([topicId, list]) => {
            const topic = topicById.get(topicId)!;
            const done = list.filter((r) => completed.has(r.id)).length;
            return (
              <section key={topicId}>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    {topic.name} <span className="font-normal text-slate-500">· {subjectById.get(topic.subjectId)?.name}</span>
                  </h2>
                  <span className="text-xs text-slate-500">
                    {done}/{list.length} done ·{' '}
                    <Link to={`/assessment/${topicId}`} className="font-medium text-brand-700 hover:underline">
                      assess
                    </Link>
                  </span>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  {list.map((r) => (
                    <ResourceCard
                      key={r.id}
                      resource={r}
                      done={completed.has(r.id)}
                      onToggle={() => {
                        toggleResource(r.id);
                        if (!completed.has(r.id)) toast(`Completed “${r.title}”.`);
                      }}
                      onDelete={r.custom ? () => setDeleting(r) : undefined}
                    />
                  ))}
                </div>
              </section>
            );
          })}
          {groups.length > 30 && <p className="text-center text-sm text-slate-500">Showing 30 of {groups.length} topics — narrow the filters to see the rest.</p>}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add a learning resource"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveDraft}>Add resource</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Topic" htmlFor="res-topic" className="sm:col-span-2">
              <select id="res-topic" className="input" value={draft.topicId} onChange={(e) => setDraft({ ...draft, topicId: e.target.value })}>
                <option value="">Choose a topic…</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {subjectById.get(t.subjectId)?.name} — {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Type" htmlFor="res-type">
              <select id="res-type" className="input" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as ResourceType })}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_META[t].label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Title" htmlFor="res-title" className="sm:col-span-2">
              <input id="res-title" className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </Field>
            <Field label="Minutes" htmlFor="res-min">
              <input id="res-min" type="number" min={1} max={600} className="input" value={draft.estimatedMinutes} onChange={(e) => setDraft({ ...draft, estimatedMinutes: e.target.valueAsNumber })} />
            </Field>
          </div>
          <Field label="Content" htmlFor="res-content">
            <textarea id="res-content" rows={8} className={`input ${draft.type === 'code' ? 'font-mono text-xs' : ''}`} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
          </Field>
          {draftError && (
            <p className="text-sm font-medium text-red-600" role="alert">
              {draftError}
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this resource?"
        message={`“${deleting?.title}” will be removed permanently.`}
        confirmLabel="Delete"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteResource(deleting.id);
          setDeleting(null);
          toast('Resource deleted.', 'info');
        }}
      />
    </>
  );
}
