import { useState, type FormEvent } from 'react';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { EDUCATION_LEVELS, hasErrors, validateProfile, type FieldErrors, type ProfileFormValues } from '@/lib/forms';
import type { EducationLevel } from '@/types';

const SUGGESTED_INTERESTS = ['Web Development', 'Programming', 'Databases', 'Algorithms', 'Data Structures', 'Networking', 'Security', 'AI & Data Science'];

interface ProfileFormProps {
  initial?: Partial<ProfileFormValues>;
  submitLabel: string;
  onSubmit: (values: ProfileFormValues) => void;
  onCancel?: () => void;
}

export function ProfileForm({ initial, submitLabel, onSubmit, onCancel }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    interests: initial?.interests ?? [],
    educationLevel: initial?.educationLevel ?? 'Undergraduate',
    dailyStudyMinutes: initial?.dailyStudyMinutes ?? 90,
    learningGoals: initial?.learningGoals ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors<keyof ProfileFormValues>>({});
  const [customInterest, setCustomInterest] = useState('');

  const update = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const toggleInterest = (interest: string) =>
    update('interests', values.interests.includes(interest) ? values.interests.filter((i) => i !== interest) : [...values.interests, interest]);
  const addCustom = () => {
    const value = customInterest.trim();
    if (value && !values.interests.includes(value)) update('interests', [...values.interests, value]);
    setCustomInterest('');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateProfile(values);
    setErrors(found);
    if (!hasErrors(found)) onSubmit({ ...values, name: values.name.trim(), email: values.email.trim(), learningGoals: values.learningGoals.trim() });
  };

  const allInterests = [...new Set([...SUGGESTED_INTERESTS, ...values.interests])];

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="pf-name" error={errors.name}>
          <input id="pf-name" className="input" value={values.name} onChange={(e) => update('name', e.target.value)} autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="pf-email" error={errors.email}>
          <input id="pf-email" type="email" className="input" value={values.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" />
        </Field>
        <Field label="Education level" htmlFor="pf-level" error={errors.educationLevel}>
          <select id="pf-level" className="input" value={values.educationLevel} onChange={(e) => update('educationLevel', e.target.value as EducationLevel)}>
            {EDUCATION_LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Preferred daily study time (minutes)" htmlFor="pf-minutes" error={errors.dailyStudyMinutes}>
          <input
            id="pf-minutes"
            type="number"
            min={15}
            max={720}
            step={15}
            className="input"
            value={Number.isNaN(values.dailyStudyMinutes) ? '' : values.dailyStudyMinutes}
            onChange={(e) => update('dailyStudyMinutes', e.target.valueAsNumber)}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="label">Learning interests</legend>
        <div className="flex flex-wrap gap-2">
          {allInterests.map((interest) => {
            const active = values.interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                aria-pressed={active}
                onClick={() => toggleInterest(interest)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-brand-400'
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            aria-label="Add another interest"
            className="input"
            placeholder="Add another interest"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustom();
              }
            }}
          />
          <Button variant="secondary" onClick={addCustom} disabled={!customInterest.trim()}>
            Add
          </Button>
        </div>
      </fieldset>

      <Field label="Learning goals" htmlFor="pf-goals" error={errors.learningGoals} hint="What do you want to achieve? e.g. pass the end-semester exam, build a portfolio site.">
        <textarea id="pf-goals" rows={3} className="input" value={values.learningGoals} onChange={(e) => update('learningGoals', e.target.value)} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
