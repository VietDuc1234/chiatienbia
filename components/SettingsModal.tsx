"use client";

import { useState } from "react";
import Modal from "./Modal";
import { useAppState } from "@/lib/app-state-context";

const MAX_NAME_LENGTH = 12;

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { state, setState } = useAppState();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  if (!state) return null;
  const { soundOn, currentSession } = state;

  function toggleSound() {
    setState((prev) => (prev ? { ...prev, soundOn: !prev.soundOn } : prev));
  }

  function startRename(id: number, currentName: string) {
    setEditingId(id);
    setEditingName(currentName);
  }

  function commitRename() {
    const trimmed = editingName.trim().slice(0, MAX_NAME_LENGTH);
    if (trimmed && editingId !== null) {
      const id = editingId;
      setState((prev) =>
        prev
          ? {
              ...prev,
              currentSession: {
                ...prev.currentSession,
                players: prev.currentSession.players.map((p) =>
                  p.id === id ? { ...p, name: trimmed } : p
                ),
              },
            }
          : prev
      );
    }
    setEditingId(null);
  }

  function removePlayer(id: number, name: string) {
    if (!window.confirm(`Xoá người chơi "${name}"?`)) return;
    setState((prev) =>
      prev
        ? {
            ...prev,
            currentSession: {
              ...prev.currentSession,
              players: prev.currentSession.players.filter((p) => p.id !== id),
            },
          }
        : prev
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Cài đặt">
      <div className="flex flex-col gap-5">
        <label className="flex items-center justify-between">
          <span>Âm thanh khi ghi điểm</span>
          <input type="checkbox" checked={soundOn} onChange={toggleSound} className="size-5" />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-foreground/60">Người chơi</span>
          {currentSession.players.length === 0 && (
            <p className="text-foreground/50">Chưa có người chơi.</p>
          )}
          {currentSession.players.map((player) => {
            const canDelete = player.score === 0;
            return (
              <div key={player.id} className="flex items-center gap-2">
                <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: player.color }} />
                {editingId === player.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value.slice(0, MAX_NAME_LENGTH))}
                    onBlur={commitRename}
                    onKeyDown={(e) => e.key === "Enter" && commitRename()}
                    className="min-w-0 flex-1 rounded-lg border-2 border-foreground/20 bg-transparent px-2 py-1"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startRename(player.id, player.name)}
                    className="min-w-0 flex-1 truncate text-left hover:underline"
                  >
                    {player.name}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => canDelete && removePlayer(player.id, player.name)}
                  disabled={!canDelete}
                  title={canDelete ? "Xoá người chơi" : "Đưa điểm về 0 trước khi xoá"}
                  className="rounded-lg px-2 py-1 text-sm text-red-500 disabled:opacity-30"
                >
                  Xoá
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
