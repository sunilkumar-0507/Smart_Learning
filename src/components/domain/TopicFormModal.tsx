import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { hasErrors, validateTopic, type FieldErrors, type TopicFormValues } from '@/lib/forms';
import { wouldCreateCycle } from '@/lib/engine/graph';
import type { Subject, Topic } from '@/types';

interface Props {
  open: boolean;
  subjectId: string;
  topic?: Topic | null;
  allTopics: Topic[];
  subjects: Subject[];
  onClose: () => void;
  onSave: (values: TopicFormValues) => void;
}

const EMPTY: TopicFormValues = { name: '', description: '', difficulty: 2, importance: 70, estimatedMinutes: 60, prerequisites: [] };

export function TopicFormModal({ open, subjectId, topic, allTopics, subjects, onClose, onSave }: Props) {
  const [values, setValues] = useState<TopicFormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<keyof TopicFormValues>>({});
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!open) return;
    setValues(
      topic
        ? {
            name: topic.name,
            description: topic.description,
            difficulty: topic.difficulty,
            importance: topic.importance,
            estimatedMinutes: topic.estimatedMinutes,
            prerequisites: [...topic.prerequisites],
          }
        : EMPTY,
    );
    setErrors({});
    setFilter('');
  }, [open, topic]);

  const subjectName = useMemo(() => new Map(subjects.map((s) => [s.id, s.name])), [subjects]);
  // Candidate prerequisites: every other topic, flagged when choosing it would create a cycle.
  const candidates = useMemo(
    () =>
      allTopics
        .filter((t) => t.id !== topic?.id)
        .filter((t) => `${t.name} ${subjectName.get(t.subjectId) ?? ''}`.toLowerCase().includes(filter.toLowerCase()))
        .map((t) => ({ topic: t, cyclic: topic ? wouldCreateCycle(allTopics, topic.id, t.id) : false })),
    [allTopics, topic, filter, subjectName],
  );

  const save = () => {
    const siblings = allTopics.filter((t) => t.subjectId === subjectId && t.id !== topic?.id).map((t) => t.name);
    const found = validateTopic(values, siblings);
    setErrors(found);
    if (!hasErrors(found)) onSave({ ...values, name: values.name.trim(), description: values.description.trim() });
  };

  const toggle = (id: string) =>
    setValues((v) => ({ ...v, prerequisites: v.prerequisites.includes(id) ? v.prerequisites.filter((p) => p !== id) : [...v.prerequisites, id] }));

  const num = (key: 'difficulty' | 'importance' | 'estimatedMinutes') => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues({ ...values, [key]: Number(e.target.value) });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={topic ? 'Edit topic' : 'Add topic'}
      description="Difficulty, importance and prerequisites feed directly into the PBWPS priority score."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{topic ? 'Save changes' : 'Add topic'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Topic name" htmlFor="tp-name" error={errors.name}>
          <input id="tp-name" className="input" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
        </Field>
        <Field label="Description" htmlFor="tp-desc">
          <textarea id="tp-desc" rows={2} className="input" value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Difficulty (1–5)" htmlFor="tp-diff" error={errors.difficulty}>
            <select id="tp-diff" className="input" value={values.difficulty} onChange={num('difficulty')}>
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>
                  {d} — {['Introductory', 'Basic', 'Intermediate', 'Advanced', 'Expert'][d - 1]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Importance (0–100)" htmlFor="tp-imp" error={errors.importance}>
            <input id="tp-imp" type="number" min={0} max={100} className="input" value={values.importance} onChange={num('importance')} />
          </Field>
          <Field label="Estimated minutes" htmlFor="tp-min" error={errors.estimatedMinutes}>
            <input id="tp-min" type="number" min={5} max={1440} step={5} className="input" value={values.estimatedMinutes} onChange={num('estimatedMinutes')} />
          </Field>
        </div>
        <div>
          <p className="label">Prerequisite topics ({values.prerequisites.length} selected)</p>
          <input className="input mb-2" placeholder="Filter topics…" aria-label="Filter prerequisite topics" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {candidates.length === 0 && <p className="p-2 text-sm text-slate-500">No matching topics.</p>}
            {candidates.map(({ topic: t, cyclic }) => (
              <label key={t.id} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${cyclic && !values.prerequisites.includes(t.id) ? 'opacity-50' : 'hover:bg-slate-50'}`}>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                  checked={values.prerequisites.includes(t.id)}
                  disabled={cyclic && !values.prerequisites.includes(t.id)}
                  onChange={() => toggle(t.id)}
                />
                <span className="flex-1">{t.name}</span>
                <span className="text-xs text-slate-400">{cyclic ? 'would create a cycle' : subjectName.get(t.subjectId)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
