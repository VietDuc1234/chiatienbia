"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/35"
          />
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed left-1/2 top-1/2 z-50 w-[min(90vw,360px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-foreground/10 bg-background p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="flex size-8 items-center justify-center rounded-lg text-lg hover:bg-foreground/10"
              >
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
