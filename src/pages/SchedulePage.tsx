import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, RefreshCw, RotateCcw, Target, XCircle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useLearningPath, useLookups, useRanking } from '@/hooks/useEngine';
import { generateSchedule, groupSessionsByDay, markMissedSessions, mergeTasksByPriority, type ScheduleTask } from '@/lib/engine/scheduler';
import { startOfWeek } from '@/lib/engine/progress';
import { addDays, daysBetween, formatDate, parseISODate, toISODate, WEEKDAY_SHORT } from '@/lib/date';
import { formatMinutes } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field } from '@/components/ui/Field';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/store/toastStore';
import type { ScheduleSettings, StudySession } from '@/types';

export default function SchedulePage() {
  const settings = useAppStore((s) => s.settings);
  const schedule = useAppStore((s) => s.schedule);
  const setSchedule = useAppStore((s) => s.setSchedule);
  const setSessionStatus = useAppStore((s) => s.setSessionStatus);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const path = useLearningPath();
  const { recommendations } = useRanking();
  const { topicById } = useLookups();
  const today = toISODate(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [hoursText, setHoursText] = useState(String(settings.schedule.dailyHours));

  const tasks = useMemo(() => {
    const name = (id: string) => topicById.get(id)?.name ?? 'Topic';
    const learn: ScheduleTask[] = path
      .filter((s) => !s.blockedByCycle)
      .map((s) => ({ topicId: s.topicId, topicName: name(s.topicId), minutes: s.estimatedMinutes, priority: s.priority, kind: 'learn' }));
    const review: ScheduleTask[] = recommendations
      .filter((r) => r.kind === 'review')
      .map((r) => ({ topicId: r.topicId, topicName: name(r.topicId), minutes: Math.min(30, Math.max(15, Math.round((topicById.get(r.topicId)?.estimatedMinutes ?? 30) / 2))), priority: r.priority, kind: 'review' }));
    return mergeTasksByPriority(learn, review);
  }, [path, recommendations, topicById]);

  const regenerate = useCallback(
    (scheduleSettings: ScheduleSettings, message?: string) => {
      const current = useAppStore.getState().schedule;
      const next = generateSchedule({ tasks, settings: scheduleSettings, startDate: today, previous: current ? markMissedSessions(current, today) : null });
      setSchedule(next);
      if (message) toast(message);
    },
    [tasks, today, setSchedule],
  );

  // First visit: build a timetable. Later visits: flag sessions whose date has passed.
  useEffect(() => {
    if (!schedule) regenerate(settings.schedule);
    else {
      const marked = markMissedSessions(schedule, today);
      if (marked !== schedule) setSchedule(marked);
    }
  }, [schedule, today]);

  const applySettings = (patch: Partial<ScheduleSettings>) => {
    const next = { ...settings.schedule, ...patch };
    updateSettings({ ...settings, schedule: next });
    regenerate(next);
  };

  const sessions = schedule?.sessions ?? [];
  const missed = sessions.filter((s) => s.status === 'missed');
  const planned = sessions.filter((s) => s.status === 'planned');
  const doneMinutes = sessions.filter((s) => s.status === 'completed').reduce((m, s) => m + s.minutes, 0);
  const totalMinutes = sessions.reduce((m, s) => m + s.minutes, 0);
  const daysToExam = settings.schedule.examDate ? daysBetween(today, settings.schedule.examDate) : null;
  const byDay = useMemo(() => new Map(groupSessionsByDay(sessions).map((d) => [d.date, d])), [sessions]);

  const weekStart = addDays(startOfWeek(today), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todaysTarget = byDay.get(today);

  const statusButton = (s: StudySession) => {
    if (s.status === 'completed')
      return (
        <button type="button" className="text-[11px] font-medium text-slate-500 hover:text-slate-800" onClick={() => setSessionStatus(s.id, s.date < today ? 'missed' : 'planned')}>
          Undo
        </button>
      );
    return (
      <div className="flex gap-2">
        <button
          type="button"
          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900"
          onClick={() => {
            setSessionStatus(s.id, 'completed');
            toast('Session completed and logged to your progress.');
          }}
        >
          <CheckCircle2 size={12} /> Done
        </button>
        {s.status === 'planned' && (
          <button type="button" className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-red-700" onClick={() => setSessionStatus(s.id, 'missed')}>
            <XCircle size={12} /> Missed
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="Study Schedule"
        description="A deterministic timetable generated from your learning path order, daily availability and exam date. Completed sessions are kept whenever the plan is regenerated."
        actions={
          <>
            {missed.length > 0 && (
              <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={() => regenerate(settings.schedule, `Rescheduled ${missed.length} missed session${missed.length === 1 ? '' : 's'}.`)}>
                Reschedule missed ({missed.length})
              </Button>
            )}
            <Button icon={<RefreshCw size={16} />} onClick={() => regenerate(settings.schedule, 'Schedule regenerated from your latest learning path.')}>
              Regenerate
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Availability" description="Changes regenerate the timetable automatically">
          <div className="space-y-4">
            <Field label="Daily study hours" htmlFor="sch-hours" hint="0.5 – 12 hours" error={!(Number(hoursText) >= 0.5 && Number(hoursText) <= 12) ? 'Enter between 0.5 and 12 hours.' : null}>
              <input
                id="sch-hours"
                type="number"
                min={0.5}
                max={12}
                step={0.5}
                className="input"
                value={hoursText}
                onChange={(e) => {
                  setHoursText(e.target.value);
                  const v = Number(e.target.value);
                  if (v >= 0.5 && v <= 12) applySettings({ dailyHours: v });
                }}
              />
            </Field>
            <fieldset>
              <legend className="label">Study days</legend>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAY_SHORT.map((d, i) => {
                  const active = settings.schedule.studyDays.includes(i);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={active}
                      onClick={() => applySettings({ studyDays: active ? settings.schedule.studyDays.filter((x) => x !== i) : [...settings.schedule.studyDays, i].sort() })}
                      className={`h-9 w-11 rounded-lg text-xs font-semibold ${active ? 'bg-brand-700 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:border-brand-400'}`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <Field label="Examination date" htmlFor="sch-exam" hint="Leave empty to plan the next 90 days">
              <div className="flex gap-2">
                <input id="sch-exam" type="date" className="input" min={addDays(today, 1)} value={settings.schedule.examDate} onChange={(e) => applySettings({ examDate: e.target.value })} />
                {settings.schedule.examDate && (
                  <Button variant="secondary" onClick={() => applySettings({ examDate: '' })}>
                    Clear
                  </Button>
                )}
              </div>
            </Field>
            <Field label="Maximum session length" htmlFor="sch-max">
              <select id="sch-max" className="input" value={settings.schedule.maxSessionMinutes} onChange={(e) => applySettings({ maxSessionMinutes: Number(e.target.value) })}>
                {[30, 45, 60, 90, 120].map((m) => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Exam countdown"
              value={daysToExam === null ? '—' : daysToExam > 0 ? `${daysToExam} days` : 'Passed'}
              hint={settings.schedule.examDate ? formatDate(settings.schedule.examDate) : 'No exam date set'}
              icon={<Target size={20} />}
              tone="danger"
            />
            <StatCard label="Today’s target" value={formatMinutes(todaysTarget?.minutes ?? 0)} hint={`${formatMinutes(todaysTarget?.completedMinutes ?? 0)} completed today`} icon={<Clock size={20} />} tone="violet" />
            <StatCard
              label="Plan progress"
              value={`${totalMinutes ? Math.round((doneMinutes / totalMinutes) * 100) : 0}%`}
              hint={`${planned.length} sessions planned · ${missed.length} missed`}
              icon={<CalendarDays size={20} />}
              tone="success"
            />
          </div>

          {schedule && schedule.conflicts.length > 0 && (
            <div className="space-y-2" role="alert">
              {schedule.conflicts.slice(0, 4).map((c, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                  <p>{c.message}</p>
                </div>
              ))}
              {schedule.conflicts.length > 4 && <p className="text-xs text-amber-700">…and {schedule.conflicts.length - 4} more topics that do not fit.</p>}
            </div>
          )}

        </div>
      </div>

      <Card
        className="mt-6"
        title={`Week of ${formatDate(weekStart, { day: 'numeric', month: 'long' })}`}
        actions={
          <>
            <Button size="sm" variant="secondary" onClick={() => setWeekOffset((w) => w - 1)} aria-label="Previous week">
              <ChevronLeft size={16} />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}>
              This week
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setWeekOffset((w) => w + 1)} aria-label="Next week">
              <ChevronRight size={16} />
            </Button>
          </>
        }
      >
        {sessions.length === 0 ? (
          <EmptyState icon={<CalendarDays size={22} />} title="Nothing scheduled" description="Select study days and daily hours, or add topics to your learning path." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {weekDays.map((date) => {
              const day = byDay.get(date);
              const isToday = date === today;
              const studyDay = settings.schedule.studyDays.includes(parseISODate(date).getDay());
              const isExam = date === settings.schedule.examDate;
              return (
                <div key={date} className={`min-h-[7rem] rounded-xl border p-2.5 ${isToday ? 'border-brand-400 bg-brand-50/50' : 'border-slate-200'} ${!studyDay ? 'bg-slate-50' : ''}`}>
                  <div className="mb-2 flex items-baseline justify-between">
                    <p className={`text-xs font-semibold ${isToday ? 'text-brand-700' : 'text-slate-600'}`}>
                      {WEEKDAY_SHORT[parseISODate(date).getDay()]} {parseISODate(date).getDate()}
                    </p>
                    {day && <p className="text-[11px] text-slate-500">{formatMinutes(day.minutes)}</p>}
                  </div>
                  {isExam && <Badge tone="danger">Exam day</Badge>}
                  <ul className="space-y-1.5">
                    {day?.sessions.map((s) => (
                      <li
                        key={s.id}
                        className={`rounded-lg border p-2 text-xs ${
                          s.status === 'completed' ? 'border-emerald-200 bg-emerald-50' : s.status === 'missed' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <p className={`font-medium ${s.status === 'completed' ? 'text-emerald-800 line-through decoration-emerald-400' : 'text-slate-800'}`}>{topicById.get(s.topicId)?.name ?? 'Removed topic'}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {s.minutes} min{s.kind === 'review' ? ' · revision' : ''}
                          {s.rescheduledFrom ? ` · moved from ${formatDate(s.rescheduledFrom, { day: 'numeric', month: 'short' })}` : ''}
                        </p>
                        <div className="mt-1">{statusButton(s)}</div>
                      </li>
                    ))}
                    {!day && !isExam && <li className="text-[11px] text-slate-400">{studyDay ? 'Free' : 'Rest day'}</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}
