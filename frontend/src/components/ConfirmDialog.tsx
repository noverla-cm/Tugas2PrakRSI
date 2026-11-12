import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel, busy, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className="dialog" onCancel={(e) => { e.preventDefault(); onCancel(); }}>
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="row-end">
        <button className="btn" onClick={onCancel} disabled={busy}>Batal</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Menghapus…' : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
