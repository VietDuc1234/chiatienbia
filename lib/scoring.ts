import type { ChipType, Player, ScoringConfig } from "./types";

/** Đơn vị điểm mặc định cho mỗi chip (SDD §6 / §5.1). */
export const DEFAULT_SCORING: ScoringConfig = {
  dot: 10,
  ball14: 2,
  ball15: 2,
  burn: 10,
};

/**
 * Áp dụng luật điểm khi thả 1 chip vào người chơi target (SDD §5.1).
 * `.`/`14`/`15` là zero-sum: target nhận u×(n−1), mỗi người khác mất u.
 * `cháy` không zero-sum: chỉ trừ target u, người khác giữ nguyên.
 * Khi chỉ có 1 người chơi, (n−1)=0 nên zero-sum tự nhiên không đổi gì cho target.
 */
export function applyChip(
  players: Player[],
  targetId: number,
  chip: ChipType,
  scoring: ScoringConfig
): Player[] {
  const u = scoring[chip];
  const n = players.length;

  if (chip === "burn") {
    return players.map((p) => (p.id === targetId ? { ...p, score: p.score - u } : p));
  }

  return players.map((p) => {
    if (p.id === targetId) {
      return { ...p, score: p.score + u * (n - 1) };
    }
    return { ...p, score: p.score - u };
  });
}

/** Chỉnh điểm thủ công ±1/lần qua nút −/+ (FR-3), không áp dụng zero-sum. */
export function applyManualAdjust(players: Player[], targetId: number, delta: number): Player[] {
  return players.map((p) => (p.id === targetId ? { ...p, score: p.score + delta } : p));
}

/**
 * Cân bằng zero-sum bằng double-tap (FR-14): điểm mới = điểm cũ − tổng hiện tại,
 * đưa tổng tất cả người chơi về đúng 0. Nếu tổng đã = 0 thì không đổi gì.
 */
export function applyDoubleTapBalance(players: Player[], targetId: number): Player[] {
  const total = players.reduce((sum, p) => sum + p.score, 0);
  return players.map((p) => (p.id === targetId ? { ...p, score: p.score - total } : p));
}

/** Tiền = điểm × giá mỗi điểm (SDD §5.2). */
export function calcMoney(score: number, pricePerPoint: number): number {
  return score * pricePerPoint;
}

/** Giá mỗi điểm mặc định khi chia tiền bàn lúc kết thúc. */
export const DEFAULT_PRICE_PER_POINT = 3000;

/**
 * Chia tiền bàn lúc kết thúc: mỗi người trả phần chia đều (tổng tiền ÷ số người),
 * trừ đi tiền thắng theo điểm (điểm × giá mỗi điểm). Người trả nhiều nhất chỉ về 0,
 * không nhận lại tiền dư dù điểm cao hơn phần chia đều.
 */
export function calcSettlement(
  score: number,
  totalMoney: number,
  playerCount: number,
  pricePerPoint: number
): number {
  if (playerCount === 0) return 0;
  const baseShare = totalMoney / playerCount;
  return Math.max(0, baseShare - score * pricePerPoint);
}
