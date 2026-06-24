"use client";

import { useDroppable } from "@dnd-kit/core";
import { useEffect, useRef } from "react";
import type { Player } from "@/lib/types";

const HOLD_DELAY_MS = 400;
const HOLD_REPEAT_MS = 80;

function useHoldRepeat(onTick: () => void) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stop() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }

  function start() {
    onTick();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(onTick, HOLD_REPEAT_MS);
    }, HOLD_DELAY_MS);
  }

  useEffect(() => stop, []);

  return {
    onPointerDown: start,
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
  };
}

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
  const { setNodeRef, isOver } = useDroppable({
    id: `player-${player.id}`,
    data: { playerId: player.id },
  });

  const decHandlers = useHoldRepeat(() => onDecrement?.());
  const incHandlers = useHoldRepeat(() => onIncrement?.());

  return (
    <div
      ref={setNodeRef}
      onDoubleClick={onDoubleTap}
      className="flex min-w-0 flex-1 select-none items-center gap-3 rounded-2xl border-4 p-4 transition
        portrait:h-[84px] portrait:flex-row
        landscape:h-full landscape:flex-col landscape:justify-between landscape:gap-4 landscape:py-6"
      style={{
        borderColor: player.color,
        backgroundColor: `${player.color}1a`,
        boxShadow: isOver ? `0 0 0 4px ${player.color}66` : undefined,
        transform: isOver ? "scale(1.02)" : undefined,
      }}
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
          {...decHandlers}
          onDoubleClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Trừ 1 điểm"
          className="flex touch-none items-center justify-center rounded-lg border-2 border-foreground/40 text-2xl font-bold active:scale-95
            portrait:size-[46px] landscape:size-[52px]"
        >
          −
        </button>
        <button
          type="button"
          {...incHandlers}
          onDoubleClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Cộng 1 điểm"
          className="flex touch-none items-center justify-center rounded-lg border-2 border-foreground/40 text-2xl font-bold active:scale-95
            portrait:size-[46px] landscape:size-[52px]"
        >
          +
        </button>
      </div>
    </div>
  );
}
