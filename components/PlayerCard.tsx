"use client";

import { useDroppable } from "@dnd-kit/core";
import { motion } from "motion/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { PLAYER_COLORS, type Player } from "@/lib/types";
import Image from "next/image";

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

function useLongPress(onLongPress: () => void, delayMs = 500) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTriggered = useRef(false);

  function start(e: React.PointerEvent) {
    if (e.button !== 0) return;
    isTriggered.current = false;
    timeoutRef.current = setTimeout(() => {
      isTriggered.current = true;
      onLongPress();
    }, delayMs);
  }

  function stop() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(() => stop, []);

  function handleClick(e: React.MouseEvent) {
    if (isTriggered.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return {
    onPointerDown: start,
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onClick: handleClick,
  };
}

interface PlayerCardProps {
  player: Player;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onDoubleTap?: () => void;
  onRename?: (newName: string) => void;
  onColorChange?: (newColor: string) => void;
}

function isLightColor(hex: string): boolean {
  const color = hex.replace("#", "");
  if (color.length !== 6) return true;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140;
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHue(hex: string): number {
  const color = hex.replace("#", "");
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  let hue: number;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  hue *= 60;
  return hue < 0 ? hue + 360 : hue;
}

// Né hue gần các màu cố định (PLAYER_COLORS) để màu random không bị lẫn với người chơi khác.
const FIXED_PALETTE_HUES = PLAYER_COLORS.map(hexToHue);
const HUE_EXCLUSION_MARGIN = 25;

function isHueTooCloseToPalette(hue: number): boolean {
  return FIXED_PALETTE_HUES.some((paletteHue) => {
    const diff = Math.abs(hue - paletteHue) % 360;
    return Math.min(diff, 360 - diff) < HUE_EXCLUSION_MARGIN;
  });
}

function generateRandomColor(): string {
  let hue = Math.floor(Math.random() * 360);
  while ((hue >= 250 && hue <= 325) || isHueTooCloseToPalette(hue)) {
    hue = Math.floor(Math.random() * 360);
  }
  const saturation = 85 + Math.floor(Math.random() * 10); // 85% - 95%
  const lightness = 65 + Math.floor(Math.random() * 10); // 65% - 75%
  return hslToHex(hue, saturation, lightness);
}

export default function PlayerCard({
  player,
  onIncrement,
  onDecrement,
  onDoubleTap,
  onRename,
  onColorChange,
}: PlayerCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `player-${player.id}`,
    data: { playerId: player.id },
  });

  const decHandlers = useHoldRepeat(() => onDecrement?.());
  const incHandlers = useHoldRepeat(() => onIncrement?.());

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(player.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.select();
    }
  }, [isEditingName]);

  const longPressHandlers = useLongPress(() => {
    setIsEditingName(true);
    setTempName(player.name);
  }, 500);

  function handleSaveName() {
    const trimmed = tempName.trim();
    if (trimmed && trimmed.length <= 12) {
      onRename?.(trimmed);
    }
    setIsEditingName(false);
  }

  const isLight = useMemo(() => isLightColor(player.color), [player.color]);
  const textClass = isLight ? "text-slate-900" : "text-white";
  const borderClass = isLight ? "border-slate-900/30" : "border-white/30";

  return (
    <div
      ref={setNodeRef}
      onDoubleClick={onDoubleTap}
      className="relative overflow-hidden flex min-w-0 flex-1 select-none items-center gap-2 rounded-2xl h-[110px] flex-row px-3 py-2 transition"
      style={{
        backgroundColor: player.color,
        boxShadow: isOver ? `0 0 0 4px ${player.color}66` : undefined,
        transform: isOver ? "scale(1.02)" : undefined,
      }}
    >
      <Image
        src="/turtle.png"
        alt="Đổi màu"
        width={96}
        height={96}
        onClick={(e) => {
          e.stopPropagation();
          onColorChange?.(generateRandomColor());
        }}
        onDoubleClick={(e) => e.stopPropagation()}
        className="absolute bottom-[-10px] left-[-10px] w-24 h-24 select-none object-contain z-10 cursor-pointer active:scale-90 transition-transform"
      />

      {isEditingName ? (
        <input
          ref={inputRef}
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveName();
            if (e.key === "Escape") setIsEditingName(false);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          maxLength={12}
          className={`bg-transparent border-b-2 outline-none w-full max-w-[30%] font-extrabold text-[28px] relative z-10 ${textClass} ${borderClass}`}
        />
      ) : (
        <span
          {...longPressHandlers}
          onDoubleClick={(e) => e.stopPropagation()}
          className={`truncate font-extrabold max-w-[30%] text-[28px] cursor-pointer relative z-10 ${textClass}`}
        >
          {player.name}
        </span>
      )}

      <motion.span
        key={player.score}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`flex-1 truncate text-center font-black tabular-nums text-[48px] flex items-center justify-center relative z-10 ${textClass}`}
      >
        {player.score}
      </motion.span>

      <div className="flex flex-col shrink-0 gap-1.5 self-stretch py-0 relative z-10">
        <button
          type="button"
          {...incHandlers}
          onDoubleClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Cộng 1 điểm"
          className={`flex touch-none items-center justify-center rounded-xl border-2 text-3xl font-bold active:scale-95
            flex-1 w-[84px] ${textClass} ${borderClass}`}
        >
          +
        </button>
        <button
          type="button"
          {...decHandlers}
          onDoubleClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Trừ 1 điểm"
          className={`flex touch-none items-center justify-center rounded-xl border-2 text-3xl font-bold active:scale-95
            flex-1 w-[84px] ${textClass} ${borderClass}`}
        >
          −
        </button>
      </div>
    </div>
  );
}
