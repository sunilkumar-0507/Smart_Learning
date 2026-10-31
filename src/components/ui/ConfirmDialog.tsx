import { useState, type ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
  /** When set, the user must type this word to enable the confirm button. */
  requireText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', tone = 'danger', requireText, onConfirm, onCancel }: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const close = () => {
    setTyped('');
    onCancel();
  };
  const blocked = Boolean(requireText) && typed.trim().toUpperCase() !== requireText!.toUpperCase();
  return (
    <Modal
      open={open}
      title={title}
      onClose={close}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button
            variant={tone}
            disabled={blocked}
            onClick={() => {
              setTyped('');
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm text-slate-600">
        <div>{message}</div>
        {requireText && (
          <div>
            <label className="label" htmlFor="confirm-text">
              Type <span className="font-mono font-semibold">{requireText}</span> to confirm
            </label>
            <input id="confirm-text" className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </div>
        )}
      </div>
    </Modal>
  );
}
