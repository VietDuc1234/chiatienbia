"use client";

import { useState } from "react";
import Modal from "./Modal";
import { useAppState } from "@/lib/app-state-context";
import { calcSettlement, DEFAULT_PRICE_PER_POINT } from "@/lib/scoring";

const moneyFormatter = new Intl.NumberFormat("vi-VN");

function formatMoney(amount: number) {
  return `${moneyFormatter.format(Math.round(amount))} đ`;
}

interface EndSessionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EndSessionModal({ open, onClose }: EndSessionModalProps) {
  const { state, setState } = useAppState();
  const [totalMoneyK, setTotalMoneyK] = useState(0);
  const [pricePerPointK, setPricePerPointK] = useState(DEFAULT_PRICE_PER_POINT / 1000);

  if (!state) return null;
  const { players } = state.currentSession;

  const totalMoney = totalMoneyK * 1000;
  const pricePerPoint = pricePerPointK * 1000;
  const totalCollected = players.reduce(
    (sum, p) => sum + calcSettlement(p.score, totalMoney, players.length, pricePerPoint),
    0
  );

  function handleConfirm() {
    setState((prev) => {
      if (!prev) return prev;
      const session = prev.currentSession;
      return {
        ...prev,
        currentSession: {
          id: Date.now(),
          startedAt: new Date().toISOString(),
          pricePerPoint: session.pricePerPoint,
          players: session.players.map((p) => ({ ...p, score: 0 })),
        },
      };
    });
    setTotalMoneyK(0);
    setPricePerPointK(DEFAULT_PRICE_PER_POINT / 1000);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Kết thúc & chia tiền bàn">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm text-foreground/60">Tổng tiền (nghìn đồng)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={totalMoneyK}
              onChange={(e) => setTotalMoneyK(Number(e.target.value) || 0)}
              className="rounded-lg border-2 border-foreground/20 bg-transparent px-3 py-2 text-base outline-none focus:border-foreground/50"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm text-foreground/60">Giá mỗi điểm (nghìn đồng)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={pricePerPointK}
              onChange={(e) => setPricePerPointK(Number(e.target.value) || 0)}
              className="rounded-lg border-2 border-foreground/20 bg-transparent px-3 py-2 text-base outline-none focus:border-foreground/50"
            />
          </label>
        </div>

        {players.length === 0 ? (
          <p className="text-foreground/50">Chưa có người chơi.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-foreground/50">
                <th className="py-1 font-normal">Tên</th>
                <th className="py-1 text-right font-normal">Điểm</th>
                <th className="py-1 text-right font-normal">Phải trả</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const payment = calcSettlement(p.score, totalMoney, players.length, pricePerPoint);
                return (
                  <tr key={p.id} className="border-t border-foreground/10">
                    <td className="py-2 truncate">{p.name}</td>
                    <td className="py-2 text-right tabular-nums">{p.score}</td>
                    <td className="py-2 text-right tabular-nums">{formatMoney(payment)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-foreground/20 font-semibold">
                <td className="py-2" colSpan={2}>
                  Tổng thu được
                </td>
                <td className="py-2 text-right tabular-nums">{formatMoney(totalCollected)}</td>
              </tr>
            </tfoot>
          </table>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-base hover:bg-foreground/10"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={players.length === 0}
            className="rounded-lg bg-foreground px-4 py-2 text-base font-semibold text-background disabled:opacity-40"
          >
            Xác nhận &amp; phiên mới
          </button>
        </div>
      </div>
    </Modal>
  );
}
