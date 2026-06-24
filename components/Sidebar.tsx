"use client";

import { AnimatePresence, motion } from "motion/react";

interface SidebarItem {
  icon: string;
  label: string;
  onClick?: () => void;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onAddPlayer?: () => void;
  onNewSession?: () => void;
  onOpenHistory?: () => void;
  onOpenSettings?: () => void;
}

export default function Sidebar({
  open,
  onClose,
  onAddPlayer,
  onNewSession,
  onOpenHistory,
  onOpenSettings,
}: SidebarProps) {
  const items: SidebarItem[] = [
    { icon: "👤+", label: "Thêm người", onClick: onAddPlayer },
    { icon: "➕", label: "Phiên mới", onClick: onNewSession },
    { icon: "📜", label: "Lịch sử", onClick: onOpenHistory },
    { icon: "⚙️", label: "Cài đặt", onClick: onOpenSettings },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 z-20 bg-black/35"
          />
          <motion.nav
            key="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.2 }}
            className="absolute inset-y-0 left-0 z-30 flex w-[200px] flex-col gap-1 border-r border-foreground/10 bg-background p-2 landscape:w-[220px]"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-base hover:bg-foreground/10"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
