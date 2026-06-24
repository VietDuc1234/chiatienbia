"use client";

import { useDraggable } from "@dnd-kit/core";
import type { ChipType } from "@/lib/types";
import Image from "next/image";

const CHIP_LABELS: Record<ChipType, string> = {
  dot: ".",
  ball14: "14",
  ball15: "15",
  burn: "cháy",
};

export function ChipFace({ chip }: { chip: ChipType }) {
  const isBurn = chip === "burn";
  const isDot = chip === "dot";

  return (
    <div
      className={`flex shrink-0 select-none items-center justify-center rounded-xl border-2 border-dashed font-bold transition-all
        portrait:size-20 portrait:text-2xl
        landscape:w-full landscape:flex-1 landscape:text-3xl
        ${isBurn ? "border-red-500 text-red-500 bg-red-500/5" : "border-foreground/50 text-foreground/80 bg-foreground/5"}`}
    >
      {isBurn ? (
        <Image
          src="/fire.png"
          alt="cháy"
          width={64}
          height={64}
          className="w-12 h-12 portrait:w-14 portrait:h-14 landscape:w-16 landscape:h-16 object-contain"
        />
      ) : isDot ? (
        <Image
          src="/dot.png"
          alt="chấm"
          width={64}
          height={64}
          className="w-12 h-12 portrait:w-14 portrait:h-14 landscape:w-16 landscape:h-16 object-contain"
        />
      ) : (
        CHIP_LABELS[chip]
      )}
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
      className={`cursor-grab touch-none portrait:shrink-0 landscape:flex-1 landscape:flex landscape:w-full ${isDragging ? "opacity-30" : ""}`}
    >
      <ChipFace chip={chip} />
    </div>
  );
}
