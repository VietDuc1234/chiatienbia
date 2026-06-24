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
import NewSessionModal from "./NewSessionModal";
import HistoryModal from "./HistoryModal";
import { useAppState } from "@/lib/app-state-context";
import { applyChip, applyDoubleTapBalance, applyManualAdjust } from "@/lib/scoring";
import { playScoreSound } from "@/lib/sound";
import type { ChipType, Player } from "@/lib/types";

const CHIPS: ChipType[] = ["dot", "ball14", "ball15", "burn"];

type ActiveModal = "addPlayer" | "settings" | "newSession" | "history" | null;

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
    if (state.soundOn) playScoreSound();
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
          onNewSession={() => {
            setActiveModal("newSession");
            setSidebarOpen(false);
          }}
          onOpenHistory={() => {
            setActiveModal("history");
            setSidebarOpen(false);
          }}
          onOpenSettings={() => {
            setActiveModal("settings");
            setSidebarOpen(false);
          }}
        />

        <AddPlayerModal open={activeModal === "addPlayer"} onClose={() => setActiveModal(null)} />
        <NewSessionModal
          open={activeModal === "newSession"}
          onClose={() => setActiveModal(null)}
          onOpenHistory={() => setActiveModal("history")}
        />
        <HistoryModal open={activeModal === "history"} onClose={() => setActiveModal(null)} />
        <SettingsModal open={activeModal === "settings"} onClose={() => setActiveModal(null)} />

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <main className="flex flex-1 overflow-hidden p-3 gap-3 flex-col portrait:flex-col landscape:flex-row">
            <div className="flex flex-1 flex-col gap-3 overflow-auto">
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
                    onRename={(newName) =>
                      updatePlayers((ps) =>
                        ps.map((p) => (p.id === player.id ? { ...p, name: newName } : p))
                      )
                    }
                    onColorChange={(newColor) =>
                      updatePlayers((ps) =>
                        ps.map((p) => (p.id === player.id ? { ...p, color: newColor } : p))
                      )
                    }
                  />
                ))
              )}
            </div>

            <div className="flex shrink-0 gap-2
              portrait:flex-row portrait:flex-wrap portrait:justify-center portrait:my-2
              landscape:flex-col landscape:h-full landscape:w-16 landscape:overflow-hidden">
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
