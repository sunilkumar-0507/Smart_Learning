import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { usePerformance } from '@/hooks/useEngine';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PerformanceBadge } from '@/components/domain/Badges';
import { SubjectFormModal } from '@/components/domain/SubjectFormModal';
import { toast } from '@/store/toastStore';
import { formatMinutes, pluralize } from '@/lib/format';
import type { Subject } from '@/types';

export default function SubjectsPage() {
  const subjects = useAppStore((s) => s.subjects);
  const topics = useAppStore((s) => s.topics);
  const progress = useAppStore((s) => s.progress);
  const thresholds = useAppStore((s) => s.settings.thresholds);
  const addSubject = useAppStore((s) => s.addSubject);
  const updateSubject = useAppStore((s) => s.updateSubject);
  const deleteSubject = useAppStore((s) => s.deleteSubject);
  const { subjectPerf } = usePerformance();

  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Subject | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Subject | null>(null);

  const cards = useMemo(() => {
    const perf = new Map(subjectPerf.map((p) => [p.subjectId, p]));
    return subjects
      .filter((s) => `${s.name} ${s.description}`.toLowerCase().includes(query.toLowerCase()))
      .map((s) => {
        const list = topics.filter((t) => t.subjectId === s.id);
        const done = list.filter((t) => progress[t.id]?.status === 'completed').length;
        return {
          subject: s,
          topicCount: list.length,
          done,
          minutes: list.reduce((m, t) => m + t.estimatedMinutes, 0),
          questions: list.reduce((m, t) => m + t.questions.length, 0),
          average: perf.get(s.id)?.average ?? null,
        };
      });
  }, [subjects, topics, progress, subjectPerf, query]);

  const deletingTopics = deleting ? topics.filter((t) => t.subjectId === deleting.id).length : 0;

  return (
    <>
      <PageHeader
        title="Subjects"
        description="Manage the subjects and topics in your curriculum. Changes immediately update recommendations, analytics and your dashboard."
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add subject
          </Button>
        }
      />

      {subjects.length > 0 && (
        <div className="relative mb-5 max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search subjects…" aria-label="Search subjects" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<BookOpen size={22} />}
            title="No subjects yet"
            description="Create a subject, then add topics with prerequisites and assessment questions."
            action={
              <Button icon={<Plus size={16} />} onClick={() => setFormOpen(true)}>
                Add your first subject
              </Button>
            }
          />
        </div>
      ) : cards.length === 0 ? (
        <p className="text-sm text-slate-500">No subjects match “{query}”.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ subject, topicCount, done, minutes, questions, average }) => (
            <article key={subject.id} className="card flex flex-col overflow-hidden">
              <div className="h-1.5" style={{ backgroundColor: subject.color }} />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/subjects/${subject.id}`} className="text-base font-semibold text-slate-900 hover:text-brand-700">
                    {subject.name}
                  </Link>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`Edit ${subject.name}`}
                      onClick={() => {
                        setEditing(subject);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button type="button" className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${subject.name}`} onClick={() => setDeleting(subject)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{subject.description || 'No description.'}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{pluralize(topicCount, 'topic')}</span>
                  <span>{pluralize(questions, 'question')}</span>
                  <span>{formatMinutes(minutes)}</span>
                </div>
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-slate-600">
                      {done}/{topicCount} completed
                    </span>
                    <PerformanceBadge score={average} thresholds={thresholds} />
                  </div>
                  <ProgressBar value={topicCount ? (done / topicCount) * 100 : 0} size="sm" label={`${subject.name} completion`} />
                </div>
                <Link to={`/subjects/${subject.id}`} className="mt-4 text-sm font-semibold text-brand-700 hover:underline">
                  Open subject →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <SubjectFormModal
        open={formOpen}
        subject={editing}
        existingNames={subjects.map((s) => s.name)}
        onClose={() => setFormOpen(false)}
        onSave={(values) => {
          if (editing) {
            updateSubject(editing.id, values);
            toast(`Updated ${values.name}.`);
          } else {
            addSubject(values);
            toast(`Added ${values.name}. Open it to add topics.`);
          }
          setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${deleting?.name ?? 'subject'}?`}
        message={`This permanently removes the subject, its ${pluralize(deletingTopics, 'topic')}, their questions, resources, assessment history and progress. Prerequisite links to these topics are removed from other topics.`}
        confirmLabel="Delete subject"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteSubject(deleting.id);
            toast(`Deleted ${deleting.name}.`, 'info');
          }
          setDeleting(null);
        }}
      />
    </>
  );
}
