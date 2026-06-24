"use client";

import { useState } from "react";
import Modal from "./Modal";
import { useAppState } from "@/lib/app-state-context";
import type { HistoryEntry } from "@/lib/types";

const moneyFormatter = new Intl.NumberFormat("vi-VN");

function formatMoney(amount: number) {
  return `${moneyFormatter.format(Math.abs(amount))} đ`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildCopyText(entry: HistoryEntry) {
  const lines = entry.players.map((p) => {
    const label = p.money > 0 ? "NHẬN" : p.money < 0 ? "TRẢ" : "—";
    return `${p.name}: ${p.score >= 0 ? "+" : ""}${p.score} điểm = ${formatMoney(p.money)} (${label})`;
  });
  return [
    `Bi-a ${formatDate(entry.endedAt)} — giá ${moneyFormatter.format(entry.pricePerPoint)} đ/điểm`,
    ...lines,
  ].join("\n");
}

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HistoryModal({ open, onClose }: HistoryModalProps) {
  const { state, setState } = useAppState();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  if (!state) return null;

  function handleDelete(id: number) {
    setState((prev) => (prev ? { ...prev, history: prev.history.filter((h) => h.id !== id) } : prev));
  }

  async function handleCopy(entry: HistoryEntry) {
    try {
      await navigator.clipboard.writeText(buildCopyText(entry));
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId((id) => (id === entry.id ? null : id)), 1500);
    } catch {
      // Clipboard API không khả dụng — bỏ qua, người dùng tự copy tay.
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Lịch sử">
      <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
        {state.history.length === 0 ? (
          <p className="text-foreground/50">Chưa có phiên nào được lưu.</p>
        ) : (
          state.history.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-foreground/10 p-3">
              <div className="mb-2 flex items-center justify-between text-sm text-foreground/60">
                <span>{formatDate(entry.endedAt)}</span>
                <span>{moneyFormatter.format(entry.pricePerPoint)} đ/điểm</span>
              </div>

              <ul className="mb-3 flex flex-col gap-1 text-sm">
                {entry.players.map((p) => (
                  <li key={p.name} className="flex justify-between gap-2">
                    <span className="truncate">{p.name}</span>
                    <span className="tabular-nums">
                      {p.score >= 0 ? "+" : ""}
                      {p.score} · {formatMoney(p.money)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(entry)}
                  className="rounded-lg px-3 py-1.5 text-sm hover:bg-foreground/10"
                >
                  {copiedId === entry.id ? "Đã copy" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  className="rounded-lg px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10"
                >
                  Xoá
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-base hover:bg-foreground/10"
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
}
