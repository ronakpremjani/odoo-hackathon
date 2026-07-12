import React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}) => {
  return (
    <RadixDialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <RadixDialog.Portal forceMount>
            <RadixDialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
              />
            </RadixDialog.Overlay>

            <RadixDialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-slate-950 p-6 shadow-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
              >
                {title && (
                  <RadixDialog.Title className="text-lg font-semibold text-slate-950 dark:text-white mb-1">
                    {title}
                  </RadixDialog.Title>
                )}
                {description && (
                  <RadixDialog.Description className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {description}
                  </RadixDialog.Description>
                )}

                <div className="mt-2">{children}</div>

                <RadixDialog.Close asChild>
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </RadixDialog.Close>
              </motion.div>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  );
};
