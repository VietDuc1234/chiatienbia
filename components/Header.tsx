"use client";

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
}

export default function Header({ onToggleSidebar, onToggleTheme }: HeaderProps) {
  return (
    <header className="flex h-[46px] shrink-0 items-center justify-between border-b border-foreground/10 px-2">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Mở/đóng menu"
        className="flex size-9 items-center justify-center rounded-lg text-xl hover:bg-foreground/10"
      >
        ☰
      </button>
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label="Đổi giao diện sáng/tối"
        className="flex size-9 items-center justify-center rounded-lg text-xl hover:bg-foreground/10"
      >
        🌗
      </button>
    </header>
  );
}
