import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useLookups, useRanking } from '@/hooks/useEngine';
import { buildAssessment, validateSubmission } from '@/lib/engine/assessment';
import { classifyPerformance } from '@/lib/engine/performance';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PerformanceBadge, PriorityBadge } from '@/components/domain/Badges';
import { NotFoundPage } from './NotFoundPage';
import { toast } from '@/store/toastStore';
import type { AssessmentResult, Recommendation } from '@/types';

/** Remount per topic so answers never leak between assessments. */
export default function TakeAssessmentPage() {
  const { id = '' } = useParams();
  return <AssessmentRunner key={id} id={id} />;
}

function AssessmentRunner({ id }: { id: string }) {
  const navigate = useNavigate();
  const topic = useAppStore((s) => s.topics.find((t) => t.id === id));
  const thresholds = useAppStore((s) => s.settings.thresholds);
  const submitAssessment = useAppStore((s) => s.submitAssessment);
  const { subjectById, topicById } = useLookups();
  const ranking = useRanking();

  const assessment = useMemo(() => (topic ? buildAssessment(topic) : null), [topic]);
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const startedAt = useRef(new Date().toISOString());
  const before = useRef<Recommendation | null>(null);

  if (!topic || !assessment) return <NotFoundPage />;
  const subject = subjectById.get(topic.subjectId);
  const questions = assessment.questions;

  if (questions.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={<ClipboardCheck size={22} />}
          title="This topic has no questions yet"
          description="Add multiple-choice questions to the topic before taking its assessment."
          action={<ButtonLink to={`/subjects/${topic.subjectId}`}>Manage questions</ButtonLink>}
        />
      </div>
    );
  }

  const findRec = (r: typeof ranking) => [...r.recommendations, ...r.locked].find((x) => x.topicId === topic.id) ?? null;
  const check = validateSubmission(questions, answers);
  const answeredCount = questions.length - check.unanswered.length;
  const current = questions[Math.min(index, questions.length - 1)];

  const submit = () => {
    if (!check.complete) {
      setError(`Please answer every question before submitting — ${check.unanswered.length} remaining.`);
      setIndex(questions.findIndex((q) => q.id === check.unanswered[0]));
      return;
    }
    try {
      before.current = findRec(ranking);
      const saved = submitAssessment({ topicId: topic.id, answers, startedAt: startedAt.current });
      setResult(saved);
      setError(null);
      toast(`Assessment saved: ${saved.score}%. Recommendations updated.`);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The assessment could not be submitted.');
    }
  };

  const restart = () => {
    setAnswers({});
    setIndex(0);
    setResult(null);
    setError(null);
    startedAt.current = new Date().toISOString();
  };

  if (result) {
    const after = findRec(ranking);
    const band = classifyPerformance(result.score, thresholds);
    const nextUp = ranking.recommendations[0];
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">
              {subject?.name} · {topic.name}
            </p>
            <p className="mt-3 text-5xl font-semibold text-slate-900">{result.score}%</p>
            <div className="mt-3 flex justify-center">
              <PerformanceBadge score={result.score} thresholds={thresholds} />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {result.correctCount} of {result.totalQuestions} correct · {Math.max(1, Math.round(result.durationSeconds / 60))} min ·{' '}
              {band === 'Excellent' || band === 'Good' ? 'Well done!' : 'Review the explanations below, then study the topic resources.'}
            </p>
          </div>
          <div className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority before</p>
              <p className="mt-1">{before.current ? <PriorityBadge level={before.current.level} score={before.current.priority} /> : <span className="text-slate-500">Not on the list</span>}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority now</p>
              <p className="mt-1">{after ? <PriorityBadge level={after.level} score={after.priority} /> : <span className="text-slate-500">No longer needs attention</span>}</p>
            </div>
            {nextUp && (
              <p className="flex items-center gap-2 text-slate-600 sm:col-span-2">
                <Sparkles size={14} className="text-accent-500" /> Next recommended topic: <strong className="font-semibold text-slate-800">{topicById.get(nextUp.topicId)?.name}</strong>
              </p>
            )}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={restart}>
              Retake
            </Button>
            <ButtonLink to={`/resources?topic=${topic.id}`} variant="secondary">
              Study resources
            </ButtonLink>
            <ButtonLink to="/learning-path" icon={<ArrowRight size={16} />}>
              View updated learning path
            </ButtonLink>
          </div>
        </Card>

        <Card title="Answer review">
          <ol className="space-y-5">
            {questions.map((q, i) => {
              const record = result.answers.find((a) => a.questionId === q.id);
              return (
                <li key={q.id}>
                  <p className="flex items-start gap-2 text-sm font-medium text-slate-900">
                    {record?.correct ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" /> : <XCircle size={18} className="mt-0.5 shrink-0 text-red-600" />}
                    <span>
                      {i + 1}. {q.text}
                    </span>
                  </p>
                  <ul className="mt-2 space-y-1 pl-7 text-sm">
                    {q.options.map((opt, oi) => {
                      const isCorrect = oi === q.correctIndex;
                      const chosen = oi === record?.selectedIndex;
                      return (
                        <li
                          key={oi}
                          className={`rounded-md px-3 py-1.5 ${isCorrect ? 'bg-emerald-50 text-emerald-800' : chosen ? 'bg-red-50 text-red-800' : 'text-slate-600'}`}
                        >
                          {String.fromCharCode(65 + oi)}. {opt}
                          {isCorrect && <span className="ml-2 text-xs font-semibold">Correct answer</span>}
                          {chosen && !isCorrect && <span className="ml-2 text-xs font-semibold">Your answer</span>}
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-2 pl-7 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Explanation: </span>
                    {q.explanation}
                  </p>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>
    );
  }

  const selected = answers[current.id];
  const isLast = index === questions.length - 1;

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={() => (answeredCount > 0 ? setLeaveOpen(true) : navigate('/assessment'))}
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700"
      >
        <ArrowLeft size={14} /> All assessments
      </button>
      <div className="mb-5">
        <p className="text-sm font-medium" style={{ color: subject?.color }}>
          {subject?.name}
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">{assessment.title}</h1>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={answeredCount} max={questions.length} label="Questions answered" />
          <span className="shrink-0 text-xs font-medium text-slate-500">
            {answeredCount}/{questions.length} answered
          </span>
        </div>
      </div>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Question {index + 1} of {questions.length}
        </p>
        <fieldset className="mt-2">
          <legend className="text-lg font-medium text-slate-900">{current.text}</legend>
          <div className="mt-4 space-y-2">
            {current.options.map((opt, oi) => (
              <label
                key={oi}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                  selected === oi ? 'border-brand-600 bg-brand-50 text-brand-900' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name={current.id}
                  className="mt-0.5 h-4 w-4 text-brand-600"
                  checked={selected === oi}
                  onChange={() => {
                    setAnswers((a) => ({ ...a, [current.id]: oi }));
                    setError(null);
                  }}
                />
                <span>
                  <span className="mr-1 font-semibold">{String.fromCharCode(65 + oi)}.</span> {opt}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" disabled={index === 0} onClick={() => setIndex((i) => i - 1)} icon={<ArrowLeft size={16} />}>
            Previous
          </Button>
          <nav className="flex flex-wrap gap-1.5" aria-label="Jump to question">
            {questions.map((q, i) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Question ${i + 1}${answers[q.id] !== undefined ? ' (answered)' : ''}`}
                aria-current={i === index ? 'step' : undefined}
                className={`h-8 w-8 rounded-full text-xs font-semibold ${
                  i === index ? 'bg-brand-700 text-white' : answers[q.id] !== undefined ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
          {isLast ? (
            <Button onClick={submit} disabled={!check.complete} title={check.complete ? undefined : 'Answer all questions to submit'}>
              Submit assessment
            </Button>
          ) : (
            <Button onClick={() => setIndex((i) => i + 1)}>
              Next <ArrowRight size={16} />
            </Button>
          )}
        </div>
        {isLast && !check.complete && <p className="mt-3 text-right text-xs text-slate-500">{check.unanswered.length} unanswered — submission is enabled once every question has an answer.</p>}
      </Card>

      <ConfirmDialog
        open={leaveOpen}
        title="Leave this assessment?"
        message="Your answers have not been submitted and will be lost."
        confirmLabel="Leave"
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() => navigate('/assessment')}
      />

      <p className="mt-4 text-center text-xs text-slate-500">
        Need a refresher first? <Link to={`/resources?topic=${topic.id}`} className="font-medium text-brand-700 hover:underline">Open the {topic.name} resources</Link>
      </p>
    </div>
  );
}
