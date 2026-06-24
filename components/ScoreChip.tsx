"use client";

import { useDraggable } from "@dnd-kit/core";
import type { ChipType } from "@/lib/types";

const CHIP_LABELS: Record<ChipType, string> = {
  dot: ".",
  ball14: "14",
  ball15: "15",
  burn: "cháy",
};

export function ChipFace({ chip }: { chip: ChipType }) {
  const isBurn = chip === "burn";

  return (
    <div
      className={`flex shrink-0 select-none items-center justify-center rounded-full border-2 border-dashed font-bold
        portrait:size-16 portrait:text-lg landscape:size-[78px] landscape:text-2xl
        ${isBurn ? "border-red-500 text-red-500" : "border-foreground/50 text-foreground/80"}`}
    >
      {CHIP_LABELS[chip]}
    </div>
  );
}

export default function ScoreChip({ chip }: { chip: ChipType }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `chip-${chip}`,
    data: { chip },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab touch-none ${isDragging ? "opacity-30" : ""}`}
    >
      <ChipFace chip={chip} />
    </div>
  );
}
