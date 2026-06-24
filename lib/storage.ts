import { get, put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";
import { DEFAULT_SCORING } from "./scoring";
import { PLAYER_COLORS, type AppState } from "./types";

const BLOB_PATHNAME = "state.json";
const DATA_FILE = path.join(process.cwd(), "data.json");

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function defaultState(): AppState {
  return {
    currentSession: {
      id: Date.now(),
      startedAt: new Date().toISOString(),
      pricePerPoint: 0,
      players: [
        { id: 1, name: "Thành", score: 0, color: PLAYER_COLORS[0] },
        { id: 2, name: "Đắc", score: 0, color: PLAYER_COLORS[1] },
        { id: 3, name: "Đức", score: 0, color: PLAYER_COLORS[2] },
      ],
    },
    soundOn: true,
    scoring: DEFAULT_SCORING,
    history: [],
  };
}

/** Đọc trạng thái từ Vercel Blob (prod) hoặc data.json (dev). Hỏng/thiếu → trạng thái mặc định (SDD §10). */
export async function readState(): Promise<AppState> {
  if (hasBlobToken()) {
    try {
      const result = await get(BLOB_PATHNAME, { access: "public" });
      if (!result) return defaultState();
      const text = await new Response(result.stream).text();
      return JSON.parse(text) as AppState;
    } catch {
      return defaultState();
    }
  }

  try {
    const text = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(text) as AppState;
  } catch {
    return defaultState();
  }
}

/** Ghi đè toàn bộ trạng thái (SDD §6.1). */
export async function writeState(state: AppState): Promise<void> {
  const json = JSON.stringify(state, null, 2);

  if (hasBlobToken()) {
    await put(BLOB_PATHNAME, json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }

  await fs.writeFile(DATA_FILE, json, "utf-8");
}
