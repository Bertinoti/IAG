import type { ReactNode } from "react";

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ui-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="ui-modal-title"
            className="text-xl font-semibold text-slate-900"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            className="text-xl text-slate-400 hover:text-slate-700"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </section>
    </div>
  );
}
