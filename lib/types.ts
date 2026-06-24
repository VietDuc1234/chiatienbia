export interface Player {
  id: number;
  name: string;
  score: number;
  color: string;
}

export interface Session {
  id: number;
  startedAt: string;
  pricePerPoint: number;
  players: Player[];
}

export interface HistoryPlayerEntry {
  name: string;
  score: number;
  money: number;
}

export interface HistoryEntry {
  id: number;
  startedAt: string;
  endedAt: string;
  pricePerPoint: number;
  players: HistoryPlayerEntry[];
}

export interface ScoringConfig {
  dot: number;
  ball14: number;
  ball15: number;
  burn: number;
}

export type ChipType = keyof ScoringConfig;

export interface AppState {
  currentSession: Session;
  soundOn: boolean;
  scoring: ScoringConfig;
  history: HistoryEntry[];
}

/** Bảng màu cố định gán theo thứ tự thêm người (SDD §6), tối đa 4 người. */
export const PLAYER_COLORS = ["#ff4d4d", "#ffeb3b", "#ff9800", "#2196f3"] as const;

export const MAX_PLAYERS = PLAYER_COLORS.length;

export function isValidAppState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;

  const session = v.currentSession as Record<string, unknown> | undefined;
  if (!session || typeof session !== "object") return false;
  if (typeof session.id !== "number") return false;
  if (typeof session.startedAt !== "string") return false;
  if (typeof session.pricePerPoint !== "number") return false;
  if (!Array.isArray(session.players)) return false;

  if (typeof v.soundOn !== "boolean") return false;

  const scoring = v.scoring as Record<string, unknown> | undefined;
  if (!scoring || typeof scoring !== "object") return false;
  if (
    typeof scoring.dot !== "number" ||
    typeof scoring.ball14 !== "number" ||
    typeof scoring.ball15 !== "number" ||
    typeof scoring.burn !== "number"
  ) {
    return false;
  }

  if (!Array.isArray(v.history)) return false;

  return true;
}
