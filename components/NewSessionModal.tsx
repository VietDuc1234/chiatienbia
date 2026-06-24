"use client";

import Modal from "./Modal";
import { useAppState } from "@/lib/app-state-context";
import { calcMoney } from "@/lib/scoring";
import type { HistoryEntry } from "@/lib/types";

const moneyFormatter = new Intl.NumberFormat("vi-VN");

function formatMoney(amount: number) {
  return `${moneyFormatter.format(Math.abs(amount))} đ`;
}

interface NewSessionModalProps {
  open: boolean;
  onClose: () => void;
  onOpenHistory?: () => void;
}

export default function NewSessionModal({ open, onClose, onOpenHistory }: NewSessionModalProps) {
  const { state, setState } = useAppState();

  if (!state) return null;
  const { currentSession } = state;
  const { players, pricePerPoint } = currentSession;

  const totalScore = players.reduce((sum, p) => sum + p.score, 0);
  const totalMoney = players.reduce((sum, p) => sum + calcMoney(p.score, pricePerPoint), 0);

  function updatePrice(value: number) {
    setState((prev) =>
      prev
        ? { ...prev, currentSession: { ...prev.currentSession, pricePerPoint: value } }
        : prev
    );
  }

  function handleSaveAndReset() {
    if (pricePerPoint === 0) {
      const proceed = window.confirm(
        "Giá mỗi điểm đang là 0 — tất cả số tiền sẽ bằng 0. Vẫn lưu phiên?"
      );
      if (!proceed) return;
    }

    setState((prev) => {
      if (!prev) return prev;
      const session = prev.currentSession;
      const historyEntry: HistoryEntry = {
        id: session.id,
        startedAt: session.startedAt,
        endedAt: new Date().toISOString(),
        pricePerPoint: session.pricePerPoint,
        players: session.players.map((p) => ({
          name: p.name,
          score: p.score,
          money: calcMoney(p.score, session.pricePerPoint),
        })),
      };

      return {
        ...prev,
        history: [historyEntry, ...prev.history],
        currentSession: {
          id: Date.now(),
          startedAt: new Date().toISOString(),
          pricePerPoint: session.pricePerPoint,
          players: session.players.map((p) => ({ ...p, score: 0 })),
        },
      };
    });

    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Phiên mới">
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-foreground/60">Giá mỗi điểm (VND)</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={pricePerPoint}
            onChange={(e) => updatePrice(Number(e.target.value) || 0)}
            className="rounded-lg border-2 border-foreground/20 bg-transparent px-3 py-2 text-base outline-none focus:border-foreground/50"
          />
        </label>

        {players.length === 0 ? (
          <p className="text-foreground/50">Chưa có người chơi.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-foreground/50">
                <th className="py-1 font-normal">Tên</th>
                <th className="py-1 text-right font-normal">Điểm</th>
                <th className="py-1 text-right font-normal">Số tiền</th>
                <th className="py-1"></th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const money = calcMoney(p.score, pricePerPoint);
                return (
                  <tr key={p.id} className="border-t border-foreground/10">
                    <td className="py-2 truncate">{p.name}</td>
                    <td className="py-2 text-right tabular-nums">{p.score}</td>
                    <td className="py-2 text-right tabular-nums">{formatMoney(money)}</td>
                    <td
                      className={`py-2 text-right text-xs font-semibold ${
                        money > 0
                          ? "text-green-600"
                          : money < 0
                            ? "text-red-500"
                            : "text-foreground/40"
                      }`}
                    >
                      {money > 0 ? "NHẬN" : money < 0 ? "TRẢ" : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-foreground/20 font-semibold">
                <td className="py-2">Tổng</td>
                <td className="py-2 text-right tabular-nums">{totalScore}</td>
                <td className="py-2 text-right tabular-nums" colSpan={2}>
                  {formatMoney(totalMoney)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        <div className="flex items-center justify-between gap-2">
          {onOpenHistory ? (
            <button
              type="button"
              onClick={onOpenHistory}
              className="rounded-lg px-3 py-2 text-sm hover:bg-foreground/10"
            >
              📜 Lịch sử
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-base hover:bg-foreground/10"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSaveAndReset}
              disabled={players.length === 0}
              className="rounded-lg bg-foreground px-4 py-2 text-base font-semibold text-background disabled:opacity-40"
            >
              Lưu &amp; phiên mới
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
