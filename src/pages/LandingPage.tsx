import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GitBranch,
  Lock,
  PlayCircle,
  Route,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProfileForm } from '@/components/domain/ProfileForm';
import { Logo } from '@/components/layout/Logo';
import { toast } from '@/store/toastStore';
import { CURRICULUM } from '@/data/seed';

const FEATURES = [
  { icon: ClipboardCheck, title: 'Topic assessments', text: 'Five-question diagnostic quizzes per topic with instant scoring and explanations.' },
  { icon: BarChart3, title: 'Performance analysis', text: 'Topic and subject scores, strengths, weaknesses and improvement trends.' },
  { icon: BrainCircuit, title: 'PBWPS engine', text: 'Weighted priority scoring of knowledge gap, difficulty, importance and revision need.' },
  { icon: GitBranch, title: 'Prerequisite-aware', text: 'Locked topics are never recommended before their foundations are mastered.' },
  { icon: Route, title: 'Personal learning path', text: 'A dependency-safe sequence that re-plans itself after every assessment.' },
  { icon: CalendarDays, title: 'Study scheduler', text: 'Deterministic weekly timetable that respects your hours, days and exam date.' },
];

const STEPS = [
  { title: 'Assess', text: 'Take short topic assessments. Each score becomes a measured knowledge gap G = 100 − score.' },
  { title: 'Prioritise', text: 'Every topic receives a priority P from four normalised factors and configurable weights.' },
  { title: 'Validate', text: 'Prerequisites are checked; locked topics wait until their foundations are mastered.' },
  { title: 'Sequence', text: 'A priority-driven topological sort turns the ranking into an ordered, explainable path.' },
];

const BENEFITS = [
  'Focus on the topics that matter most for you right now',
  'Understand exactly why each topic was recommended',
  'Never get stuck on material you are not ready for',
  'Turn priorities into a realistic study timetable',
  'Works fully offline — your data never leaves your browser',
];

export function LandingPage() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const createProfile = useAppStore((s) => s.createProfile);
  const loadDemo = useAppStore((s) => s.loadDemo);
  const [onboarding, setOnboarding] = useState(false);
  const [confirm, setConfirm] = useState<null | 'demo' | 'new'>(null);

  const topicCount = CURRICULUM.reduce((n, s) => n + s.topics.length, 0);
  const questionCount = CURRICULUM.reduce((n, s) => n + s.topics.reduce((m, t) => m + t.questions.length, 0), 0);

  const startDemo = () => {
    loadDemo();
    toast('Demo student loaded — explore the dashboard.');
    navigate('/dashboard');
  };
  const requestDemo = () => (profile ? setConfirm('demo') : startDemo());
  const requestNew = () => (profile ? setConfirm('new') : setOnboarding(true));

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            {profile ? (
              <ButtonLink to="/dashboard" size="sm" icon={<ArrowRight size={16} />}>
                Continue as {profile.name.split(' ')[0]}
              </ButtonLink>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={requestDemo}>
                  Try the demo
                </Button>
                <Button size="sm" onClick={requestNew}>
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-b from-brand-50/70 to-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
                <Sparkles size={14} /> Adaptive learning research prototype
              </span>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-brand-950 sm:text-5xl">Know exactly what to study next.</h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                Smart Learning Path analyses your assessment results, finds your knowledge gaps and builds a personalised,
                prerequisite-aware learning path using <strong className="font-semibold text-slate-800">Performance-Based Weighted Priority Scheduling</strong>.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={requestNew} icon={<ArrowRight size={18} />}>
                  Get started
                </Button>
                <Button size="lg" variant="secondary" onClick={requestDemo} icon={<PlayCircle size={18} />}>
                  Explore demo student
                </Button>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <ShieldCheck size={16} className="text-emerald-600" /> No sign-up, no server — everything runs and stays in your browser.
              </p>
            </div>

            <div className="card p-5 shadow-pop" aria-label="Example recommendation">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recommended next</p>
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">Critical · 80.3</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-900">Joins</p>
              <p className="text-sm text-slate-500">Database Management · 90 min</p>
              <div className="mt-4 space-y-2.5">
                {[
                  ['Knowledge gap', 80, 'bg-red-500'],
                  ['Difficulty', 75, 'bg-amber-500'],
                  ['Importance', 95, 'bg-brand-600'],
                  ['Revision need', 70, 'bg-accent-500'],
                ].map(([label, value, color]) => (
                  <div key={label as string}>
                    <div className="mb-1 flex justify-between text-xs text-slate-600">
                      <span>{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <p className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" /> All prerequisites satisfied (Filtering &amp; Sorting).
                </p>
                <p className="mt-1.5 flex items-start gap-2">
                  <Lock size={14} className="mt-0.5 shrink-0 text-slate-400" /> Unlocks Indexing once mastered.
                </p>
              </div>
              <p className="mt-3 text-[11px] text-slate-400">Illustration of the recommendation card layout.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              [String(CURRICULUM.length), 'subjects included'],
              [String(topicCount), 'topics with prerequisites'],
              [String(questionCount), 'assessment questions'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-slate-100 p-6 text-center">
                <p className="text-3xl font-semibold text-brand-800">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-semibold text-slate-900">Purpose</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Students often study topics in a fixed order or by gut feeling, spending time on material they already know while
              foundational gaps remain hidden. This application turns assessment evidence into a transparent priority for every
              topic, respects the order in which knowledge builds, and updates the plan every time you learn something new.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="card p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <f.icon size={20} />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold text-slate-900">How the recommendation system works</h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-xl border border-slate-200 p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">{i + 1}</span>
                <h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 rounded-xl bg-brand-950 p-6 text-center text-brand-100">
            <p className="font-mono text-lg text-white sm:text-xl">P = 0.40·G + 0.25·D + 0.20·I + 0.15·R</p>
            <p className="mt-2 text-sm">
              G knowledge gap · D normalised difficulty · I importance · R revision requirement — all on a 0–100 scale, weights configurable.
            </p>
          </div>
        </section>

        <section className="bg-surface py-16">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Benefits for students</h2>
              <ul className="mt-6 space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-slate-700">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900">Ready to start?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Create your own profile to begin with a clean history, or open the demo student who already has a month of
                assessment results, completed topics and study activity.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button onClick={requestNew} icon={<ArrowRight size={16} />}>
                  Create my profile
                </Button>
                <Button variant="secondary" onClick={requestDemo} icon={<PlayCircle size={16} />}>
                  Demo student access
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-500">
        Smart Learning Path Recommendation System · Academic research prototype · Runs entirely in your browser
      </footer>

      <Modal open={onboarding} onClose={() => setOnboarding(false)} title="Create your student profile" description="Stored only in this browser. You can change it later in Settings." size="lg">
        <ProfileForm
          submitLabel="Create profile"
          onCancel={() => setOnboarding(false)}
          onSubmit={(values) => {
            createProfile(values);
            setOnboarding(false);
            toast(`Welcome, ${values.name.split(' ')[0]}! Start with a diagnostic assessment.`);
            navigate('/dashboard');
          }}
        />
      </Modal>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm === 'demo' ? 'Load the demo student?' : 'Start a new profile?'}
        message={`This replaces the current data for ${profile?.name ?? 'this browser'}. Export a backup from Settings first if you want to keep it.`}
        confirmLabel={confirm === 'demo' ? 'Load demo' : 'Continue'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const action = confirm;
          setConfirm(null);
          if (action === 'demo') startDemo();
          else setOnboarding(true);
        }}
      />
    </div>
  );
}
