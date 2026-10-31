import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, ClipboardCheck, Lock, Pencil, Play, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useEngineConfig, useLookups, useTopicSignals } from '@/hooks/useEngine';
import { validatePrerequisites } from '@/lib/engine/pbwps';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DifficultyDots, PerformanceBadge, StatusBadge } from '@/components/domain/Badges';
import { SubjectFormModal } from '@/components/domain/SubjectFormModal';
import { TopicFormModal } from '@/components/domain/TopicFormModal';
import { QuestionFormModal } from '@/components/domain/QuestionFormModal';
import { NotFoundPage } from './NotFoundPage';
import { toast } from '@/store/toastStore';
import { formatMinutes, pluralize } from '@/lib/format';
import type { DifficultyLevel, Question, Topic } from '@/types';

export default function SubjectDetailPage() {
  const { id = '' } = useParams();
  const subjects = useAppStore((s) => s.subjects);
  const topics = useAppStore((s) => s.topics);
  const progress = useAppStore((s) => s.progress);
  const thresholds = useAppStore((s) => s.settings.thresholds);
  const actions = useAppStore.getState();
  const signals = useTopicSignals();
  const config = useEngineConfig();
  const { topicById } = useLookups();

  const subject = subjects.find((s) => s.id === id);
  const subjectTopics = useMemo(() => topics.filter((t) => t.subjectId === id).sort((a, b) => a.order - b.order), [topics, id]);
  const signalById = useMemo(() => new Map(signals.map((s) => [s.id, s])), [signals]);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [subjectFormOpen, setSubjectFormOpen] = useState(false);
  const [topicForm, setTopicForm] = useState<{ open: boolean; topic: Topic | null }>({ open: false, topic: null });
  const [questionForm, setQuestionForm] = useState<{ open: boolean; topicId: string; question: Question | null }>({ open: false, topicId: '', question: null });
  const [confirm, setConfirm] = useState<null | { kind: 'topic'; topic: Topic } | { kind: 'question'; topicId: string; question: Question }>(null);

  if (!subject) return <NotFoundPage />;

  const completed = subjectTopics.filter((t) => progress[t.id]?.status === 'completed').length;

  return (
    <>
      <Link to="/subjects" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700">
        <ArrowLeft size={14} /> All subjects
      </Link>
      <PageHeader
        title={subject.name}
        description={subject.description}
        actions={
          <>
            <Button variant="secondary" icon={<Pencil size={16} />} onClick={() => setSubjectFormOpen(true)}>
              Edit subject
            </Button>
            <Button icon={<Plus size={16} />} onClick={() => setTopicForm({ open: true, topic: null })}>
              Add topic
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2 text-sm">
        <Badge tone="brand">{pluralize(subjectTopics.length, 'topic')}</Badge>
        <Badge tone="success">{completed} completed</Badge>
        <Badge>{formatMinutes(subjectTopics.reduce((m, t) => m + t.estimatedMinutes, 0))} total study time</Badge>
      </div>

      <Card bodyClassName="p-0" title="Topics" description="Expand a topic to manage its assessment questions.">
        {subjectTopics.length === 0 ? (
          <EmptyState
            icon={<Plus size={22} />}
            title="This subject has no topics"
            description="Empty subjects are ignored by the recommendation engine until topics are added."
            action={<Button onClick={() => setTopicForm({ open: true, topic: null })}>Add a topic</Button>}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {subjectTopics.map((topic) => {
              const signal = signalById.get(topic.id);
              const status = progress[topic.id]?.status ?? 'not-started';
              const check = signal ? validatePrerequisites(signal, signalById, config.prerequisiteMastery) : { satisfied: true, missing: [] as string[] };
              const isOpen = expanded === topic.id;
              return (
                <li key={topic.id}>
                  <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-start gap-3 text-left"
                      onClick={() => setExpanded(isOpen ? null : topic.id)}
                      aria-expanded={isOpen}
                    >
                      {isOpen ? <ChevronDown size={18} className="mt-0.5 shrink-0 text-slate-400" /> : <ChevronRight size={18} className="mt-0.5 shrink-0 text-slate-400" />}
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-900">{topic.name}</span>
                          {!check.satisfied && status !== 'completed' && (
                            <Badge tone="neutral">
                              <Lock size={11} /> Locked
                            </Badge>
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">{topic.description}</span>
                        <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <DifficultyDots level={topic.difficulty} />
                          <span>Importance {topic.importance}</span>
                          <span>{formatMinutes(topic.estimatedMinutes)}</span>
                          <span>{pluralize(topic.questions.length, 'question')}</span>
                          {topic.prerequisites.length > 0 && (
                            <span>Requires: {topic.prerequisites.map((p) => topicById.get(p)?.name ?? 'removed topic').join(', ')}</span>
                          )}
                        </span>
                      </span>
                    </button>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <StatusBadge status={status} />
                      <PerformanceBadge score={signal?.latestScore ?? null} thresholds={thresholds} />
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {status === 'not-started' && (
                          <Button size="sm" icon={<Play size={14} />} onClick={() => { actions.startTopic(topic.id); toast(`Started ${topic.name}.`); }}>
                            Start topic
                          </Button>
                        )}
                        {status !== 'completed' && (
                          <Button size="sm" variant="success" icon={<CheckCircle2 size={14} />} onClick={() => { actions.completeTopic(topic.id); toast(`Marked ${topic.name} as completed.`); }}>
                            Mark completed
                          </Button>
                        )}
                        {status !== 'not-started' && (
                          <Button size="sm" variant="secondary" icon={<RotateCcw size={14} />} onClick={() => { actions.resetTopic(topic.id); toast(`Reset progress for ${topic.name}.`, 'info'); }}>
                            Reset progress
                          </Button>
                        )}
                        <ButtonLink size="sm" variant="secondary" to={`/assessment/${topic.id}`} icon={<ClipboardCheck size={14} />}>
                          Take assessment
                        </ButtonLink>
                        <Button size="sm" variant="secondary" icon={<Pencil size={14} />} onClick={() => setTopicForm({ open: true, topic })}>
                          Edit topic
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" icon={<Trash2 size={14} />} onClick={() => setConfirm({ kind: 'topic', topic })}>
                          Delete topic
                        </Button>
                      </div>
                      {!check.satisfied && status !== 'completed' && (
                        <p className="mt-3 text-xs text-slate-600">
                          Locked until you master (score ≥ {config.prerequisiteMastery}% or complete): {check.missing.map((m) => topicById.get(m)?.name).join(', ')}.
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-800">Assessment questions</h3>
                        <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => setQuestionForm({ open: true, topicId: topic.id, question: null })}>
                          Add question
                        </Button>
                      </div>
                      {topic.questions.length < 5 && (
                        <p className="mt-2 text-xs text-amber-700">
                          {topic.questions.length === 0 ? 'This topic has no questions, so it cannot be assessed yet.' : 'At least 5 questions are recommended for a reliable assessment.'}
                        </p>
                      )}
                      <ol className="mt-3 space-y-2">
                        {topic.questions.map((q, i) => (
                          <li key={q.id} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                            <span className="text-xs font-semibold text-slate-400">{i + 1}.</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-slate-800">{q.text}</p>
                              <p className="mt-1 text-xs text-emerald-700">Answer: {q.options[q.correctIndex]}</p>
                            </div>
                            <button type="button" className="rounded p-1 text-slate-400 hover:text-slate-700" aria-label={`Edit question ${i + 1}`} onClick={() => setQuestionForm({ open: true, topicId: topic.id, question: q })}>
                              <Pencil size={14} />
                            </button>
                            <button type="button" className="rounded p-1 text-slate-400 hover:text-red-600" aria-label={`Delete question ${i + 1}`} onClick={() => setConfirm({ kind: 'question', topicId: topic.id, question: q })}>
                              <Trash2 size={14} />
                            </button>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <SubjectFormModal
        open={subjectFormOpen}
        subject={subject}
        existingNames={subjects.map((s) => s.name)}
        onClose={() => setSubjectFormOpen(false)}
        onSave={(values) => {
          actions.updateSubject(subject.id, values);
          setSubjectFormOpen(false);
          toast('Subject updated.');
        }}
      />
      <TopicFormModal
        open={topicForm.open}
        subjectId={subject.id}
        topic={topicForm.topic}
        allTopics={topics}
        subjects={subjects}
        onClose={() => setTopicForm({ open: false, topic: null })}
        onSave={(values) => {
          const input = { ...values, subjectId: subject.id, difficulty: values.difficulty as DifficultyLevel };
          if (topicForm.topic) {
            actions.updateTopic(topicForm.topic.id, input);
            toast(`Updated ${values.name}.`);
          } else {
            const newId = actions.addTopic(input);
            setExpanded(newId);
            toast(`Added ${values.name}. Add assessment questions next.`);
          }
          setTopicForm({ open: false, topic: null });
        }}
      />
      <QuestionFormModal
        open={questionForm.open}
        question={questionForm.question}
        onClose={() => setQuestionForm({ open: false, topicId: '', question: null })}
        onSave={(values) => {
          actions.saveQuestion(questionForm.topicId, {
            id: questionForm.question?.id,
            text: values.text,
            options: values.options,
            correctIndex: values.correctIndex as Question['correctIndex'],
            explanation: values.explanation,
          });
          toast(questionForm.question ? 'Question updated.' : 'Question added.');
          setQuestionForm({ open: false, topicId: '', question: null });
        }}
      />
      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.kind === 'topic' ? `Delete ${confirm.topic.name}?` : 'Delete this question?'}
        message={
          confirm?.kind === 'topic'
            ? 'The topic, its questions, resources, assessment history and progress will be removed. Topics that list it as a prerequisite will no longer require it.'
            : 'Past assessment scores are kept; future assessments will not include this question.'
        }
        confirmLabel="Delete"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.kind === 'topic') {
            actions.deleteTopic(confirm.topic.id);
            toast(`Deleted ${confirm.topic.name}.`, 'info');
          } else if (confirm?.kind === 'question') {
            actions.deleteQuestion(confirm.topicId, confirm.question.id);
            toast('Question deleted.', 'info');
          }
          setConfirm(null);
        }}
      />
    </>
  );
}
