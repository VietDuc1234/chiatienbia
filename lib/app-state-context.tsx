"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { isValidAppState, type AppState } from "./types";

const SAVE_DEBOUNCE_MS = 350;
const LS_KEY = "chiatienbia-state";

function readFromLocalStorage(): AppState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidAppState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeToLocalStorage(state: AppState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded hoặc private mode — bỏ qua
  }
}

interface AppStateContextValue {
  state: AppState | null;
  setState: Dispatch<SetStateAction<AppState | null>>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(() => readFromLocalStorage());
  const skipNextSave = useRef(state !== null);
  const hadLocalDataOnMount = useRef(state !== null);

  // localStorage là nguồn dữ liệu chính của thiết bị này (ghi đồng bộ, không qua mạng).
  // Chỉ lấy từ server khi máy này CHƯA có dữ liệu local nào (máy mới/lần đầu dùng) —
  // server không bao giờ ghi đè dữ liệu local đã có, nên đóng trình duyệt trước khi
  // server lưu xong sẽ không làm mất điểm vừa ghi.
  useEffect(() => {
    if (hadLocalDataOnMount.current) return;
    let active = true;
    fetch("/api/state")
      .then((res) => res.json())
      .then((data: AppState) => {
        if (!active) return;
        skipNextSave.current = true;
        setState(data);
      })
      .catch(() => {
        // Offline hoặc API lỗi — giữ trạng thái mặc định
      });
    return () => {
      active = false;
    };
  }, []);

  // Đồng bộ giữa các tab cùng trình duyệt: tab khác ghi localStorage → tab này cập nhật theo
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key !== LS_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (isValidAppState(parsed)) {
          skipNextSave.current = true;
          setState(parsed);
        }
      } catch {
        // dữ liệu hỏng từ tab khác — bỏ qua
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Save: localStorage ngay lập tức (nguồn chính) + API debounce (chỉ để backup máy mới)
  useEffect(() => {
    if (state === null) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    writeToLocalStorage(state);

    const timer = setTimeout(() => {
      fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      }).catch(() => {
        // API lỗi — localStorage đã lưu rồi, không cần xử lý thêm
      });
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [state]);

  return <AppStateContext.Provider value={{ state, setState }}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState phải dùng trong AppStateProvider");
  return ctx;
}

