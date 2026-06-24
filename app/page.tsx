import Board from "@/components/Board";
import { AppStateProvider } from "@/lib/app-state-context";

export default function Home() {
  return (
    <AppStateProvider>
      <Board />
    </AppStateProvider>
  );
}
