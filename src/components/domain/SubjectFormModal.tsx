import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { hasErrors, validateSubject, type FieldErrors, type SubjectFormValues } from '@/lib/forms';
import type { Subject } from '@/types';

const COLORS = ['#4f58c2', '#7c6be8', '#0e9f6e', '#d97706', '#0284c7', '#db2777', '#dc2626', '#0f766e', '#475569'];

interface Props {
  open: boolean;
  subject?: Subject | null;
  existingNames: string[];
  onClose: () => void;
  onSave: (values: SubjectFormValues) => void;
}

export function SubjectFormModal({ open, subject, existingNames, onClose, onSave }: Props) {
  const [values, setValues] = useState<SubjectFormValues>({ name: '', description: '', color: COLORS[0] });
  const [errors, setErrors] = useState<FieldErrors<keyof SubjectFormValues>>({});

  useEffect(() => {
    if (open) {
      setValues(subject ? { name: subject.name, description: subject.description, color: subject.color } : { name: '', description: '', color: COLORS[existingNames.length % COLORS.length] });
      setErrors({});
    }
  }, [open, subject, existingNames.length]);

  const save = () => {
    const others = existingNames.filter((n) => n !== subject?.name);
    const found = validateSubject(values, others);
    setErrors(found);
    if (!hasErrors(found)) onSave({ ...values, name: values.name.trim(), description: values.description.trim() });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={subject ? 'Edit subject' : 'Add subject'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{subject ? 'Save changes' : 'Add subject'}</Button>
        </>
      }
    >
      <form
        className="space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Field label="Subject name" htmlFor="sub-name" error={errors.name}>
          <input id="sub-name" className="input" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
        </Field>
        <Field label="Description" htmlFor="sub-desc" error={errors.description}>
          <textarea id="sub-desc" rows={3} className="input" value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
        </Field>
        <fieldset>
          <legend className="label">Colour</legend>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValues({ ...values, color: c })}
                className={`h-8 w-8 rounded-full ring-offset-2 transition ${values.color === c ? 'ring-2 ring-slate-900' : ''}`}
                style={{ backgroundColor: c }}
                aria-label={`Colour ${c}`}
                aria-pressed={values.color === c}
              />
            ))}
          </div>
          {errors.color && <p className="mt-1 text-xs text-red-600">{errors.color}</p>}
        </fieldset>
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}
