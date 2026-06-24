"use client";

import type { Player } from "@/lib/types";

interface PlayerCardProps {
  player: Player;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onDoubleTap?: () => void;
}

export default function PlayerCard({
  player,
  onIncrement,
  onDecrement,
  onDoubleTap,
}: PlayerCardProps) {
  return (
    <div
      onDoubleClick={onDoubleTap}
      className="flex min-w-0 flex-1 select-none items-center gap-3 rounded-2xl border-4 p-4
        portrait:h-[84px] portrait:flex-row
        landscape:h-full landscape:flex-col landscape:justify-between landscape:gap-4 landscape:py-6"
      style={{ borderColor: player.color, backgroundColor: `${player.color}1a` }}
    >
      <span className="truncate text-lg font-bold portrait:text-base landscape:text-xl">
        {player.name}
      </span>

      <span
        className="flex-1 truncate text-center text-3xl font-extrabold tabular-nums
          portrait:flex-none portrait:text-[32px]
          landscape:flex landscape:items-center landscape:justify-center landscape:text-[52px]"
      >
        {player.score}
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDecrement}
          onDoubleClick={(e) => e.stopPropagation()}
          aria-label="Trừ 1 điểm"
          className="flex items-center justify-center rounded-lg border-2 border-foreground/40 text-2xl font-bold active:scale-95
            portrait:size-[46px] landscape:size-[52px]"
        >
          −
        </button>
        <button
          type="button"
          onClick={onIncrement}
          onDoubleClick={(e) => e.stopPropagation()}
          aria-label="Cộng 1 điểm"
          className="flex items-center justify-center rounded-lg border-2 border-foreground/40 text-2xl font-bold active:scale-95
            portrait:size-[46px] landscape:size-[52px]"
        >
          +
        </button>
      </div>
    </div>
  );
}
