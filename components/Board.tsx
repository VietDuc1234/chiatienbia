"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import Header from "./Header";
import Sidebar from "./Sidebar";
import PlayerCard from "./PlayerCard";
import ScoreChip, { ChipFace } from "./ScoreChip";
import AddPlayerModal from "./AddPlayerModal";
import SettingsModal from "./SettingsModal";
import { useAppState } from "@/lib/app-state-context";
import { applyChip, applyDoubleTapBalance, applyManualAdjust } from "@/lib/scoring";
import type { ChipType, Player } from "@/lib/types";

const CHIPS: ChipType[] = ["dot", "ball14", "ball15", "burn"];

type ActiveModal = "addPlayer" | "settings" | null;

export default function Board() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draggingChip, setDraggingChip] = useState<ChipType | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const { state, setState } = useAppState();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("chiatienbia-theme", isDark ? "dark" : "light");
  }

  function updatePlayers(updater: (players: Player[]) => Player[]) {
    setState((prev) =>
      prev
        ? {
            ...prev,
            currentSession: { ...prev.currentSession, players: updater(prev.currentSession.players) },
          }
        : prev
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingChip((event.active.data.current?.chip as ChipType) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingChip(null);
    const chip = event.active.data.current?.chip as ChipType | undefined;
    const targetId = event.over?.data.current?.playerId as number | undefined;
    if (!chip || targetId === undefined || !state) return;
    updatePlayers((players) => applyChip(players, targetId, chip, state.scoring));
  }

  if (!state) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-foreground/60">Đang tải...</p>
      </div>
    );
  }

  const { players } = state.currentSession;

  return (
    <div className="flex flex-1 flex-col">
      <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} onToggleTheme={toggleTheme} />

      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onAddPlayer={() => {
            setActiveModal("addPlayer");
            setSidebarOpen(false);
          }}
          onOpenSettings={() => {
            setActiveModal("settings");
            setSidebarOpen(false);
          }}
        />

        <AddPlayerModal open={activeModal === "addPlayer"} onClose={() => setActiveModal(null)} />
        <SettingsModal open={activeModal === "settings"} onClose={() => setActiveModal(null)} />

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <main className="flex flex-1 gap-3 overflow-auto p-3 portrait:flex-col landscape:flex-row">
            <div className="flex flex-1 gap-3 portrait:flex-col landscape:flex-row">
              {players.length === 0 ? (
                <p className="m-auto text-foreground/60">Chưa có người chơi — mở sidebar để thêm.</p>
              ) : (
                players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onIncrement={() => updatePlayers((ps) => applyManualAdjust(ps, player.id, 1))}
                    onDecrement={() => updatePlayers((ps) => applyManualAdjust(ps, player.id, -1))}
                    onDoubleTap={() => updatePlayers((ps) => applyDoubleTapBalance(ps, player.id))}
                  />
                ))
              )}
            </div>

            <div className="flex shrink-0 gap-3 portrait:flex-row portrait:justify-center landscape:flex-col">
              {CHIPS.map((chip) => (
                <ScoreChip key={chip} chip={chip} />
              ))}
            </div>
          </main>

          <DragOverlay>{draggingChip ? <ChipFace chip={draggingChip} /> : null}</DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
