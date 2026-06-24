"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import PlayerCard from "./PlayerCard";
import ScoreChip from "./ScoreChip";
import type { ChipType, Player } from "@/lib/types";

const CHIPS: ChipType[] = ["dot", "ball14", "ball15", "burn"];

const MOCK_PLAYERS: Player[] = [
  { id: 1, name: "THANH", score: 20, color: "#ff4d4d" },
  { id: 2, name: "DAC", score: -10, color: "#ffeb3b" },
  { id: 3, name: "DUC", score: -10, color: "#ff9800" },
];

export default function Board() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("chiatienbia-theme", isDark ? "dark" : "light");
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} onToggleTheme={toggleTheme} />

      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex flex-1 gap-3 overflow-auto p-3 portrait:flex-col landscape:flex-row">
          <div className="flex flex-1 gap-3 portrait:flex-col landscape:flex-row">
            {MOCK_PLAYERS.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>

          <div className="flex shrink-0 gap-3 portrait:flex-row portrait:justify-center landscape:flex-col">
            {CHIPS.map((chip) => (
              <ScoreChip key={chip} chip={chip} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
