import React from 'react';
import { Dialog } from './Dialog';

interface ConfirmPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
}

export const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isConfirming = false,
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (err) {
      console.error('Confirmation action failed:', err);
    } finally {
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-650 dark:text-slate-300">{message}</p>
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-305 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {isConfirming && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
