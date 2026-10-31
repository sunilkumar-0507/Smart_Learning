import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { hasErrors, validateQuestion, type QuestionFormValues } from '@/lib/forms';
import type { Question } from '@/types';

interface Props {
  open: boolean;
  question?: Question | null;
  onClose: () => void;
  onSave: (values: QuestionFormValues) => void;
}

const EMPTY: QuestionFormValues = { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' };

export function QuestionFormModal({ open, question, onClose, onSave }: Props) {
  const [values, setValues] = useState<QuestionFormValues>(EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof validateQuestion>>({});

  useEffect(() => {
    if (!open) return;
    setValues(question ? { text: question.text, options: [...question.options], correctIndex: question.correctIndex, explanation: question.explanation } : EMPTY);
    setErrors({});
  }, [open, question]);

  const setOption = (i: number, value: string) => {
    const options = [...values.options] as QuestionFormValues['options'];
    options[i] = value;
    setValues({ ...values, options });
  };

  const save = () => {
    const found = validateQuestion(values);
    setErrors(found);
    if (!hasErrors(found)) onSave({ ...values, text: values.text.trim(), explanation: values.explanation.trim(), options: values.options.map((o) => o.trim()) as QuestionFormValues['options'] });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={question ? 'Edit question' : 'Add question'}
      description="Multiple choice with four options and exactly one correct answer."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{question ? 'Save question' : 'Add question'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Question" htmlFor="q-text" error={errors.text}>
          <textarea id="q-text" rows={2} className="input" value={values.text} onChange={(e) => setValues({ ...values, text: e.target.value })} />
        </Field>
        <fieldset>
          <legend className="label">Answer options — select the correct one</legend>
          <div className="space-y-2">
            {values.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct-option"
                  className="h-4 w-4 text-brand-600"
                  checked={values.correctIndex === i}
                  onChange={() => setValues({ ...values, correctIndex: i })}
                  aria-label={`Option ${String.fromCharCode(65 + i)} is correct`}
                />
                <span className="w-5 text-sm font-semibold text-slate-500">{String.fromCharCode(65 + i)}</span>
                <input className="input" value={opt} onChange={(e) => setOption(i, e.target.value)} aria-label={`Option ${String.fromCharCode(65 + i)}`} />
              </div>
            ))}
          </div>
          {(errors.options || errors.correctIndex) && <p className="mt-1 text-xs font-medium text-red-600">{errors.options ?? errors.correctIndex}</p>}
        </fieldset>
        <Field label="Explanation of the correct answer" htmlFor="q-expl" error={errors.explanation}>
          <textarea id="q-expl" rows={2} className="input" value={values.explanation} onChange={(e) => setValues({ ...values, explanation: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}
