"use client";

import { useState, type FormEvent } from "react";
import Modal from "./Modal";
import { useAppState } from "@/lib/app-state-context";
import { MAX_PLAYERS, PLAYER_COLORS } from "@/lib/types";

const MAX_NAME_LENGTH = 12;

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddPlayerModal({ open, onClose }: AddPlayerModalProps) {
  const { state, setState } = useAppState();
  const [name, setName] = useState("");

  const players = state?.currentSession.players ?? [];
  const isFull = players.length >= MAX_PLAYERS;

  function handleClose() {
    setName("");
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isFull) return;

    setState((prev) => {
      if (!prev || prev.currentSession.players.length >= MAX_PLAYERS) return prev;
      const nextPlayer = {
        id: Date.now(),
        name: trimmed,
        score: 0,
        color: PLAYER_COLORS[prev.currentSession.players.length],
      };
      return {
        ...prev,
        currentSession: {
          ...prev.currentSession,
          players: [...prev.currentSession.players, nextPlayer],
        },
      };
    });
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Thêm người chơi">
      {isFull ? (
        <p className="text-foreground/70">Đã đủ {MAX_PLAYERS} người chơi.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
            placeholder="Tên người chơi"
            maxLength={MAX_NAME_LENGTH}
            className="rounded-lg border-2 border-foreground/20 bg-transparent px-3 py-2 text-base outline-none focus:border-foreground/50"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-base hover:bg-foreground/10"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-lg bg-foreground px-4 py-2 text-base font-semibold text-background disabled:opacity-40"
            >
              Thêm
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
