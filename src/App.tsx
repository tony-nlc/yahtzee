import { useEffect, useRef, useState } from "react";
import GameDice from "./component/GameDice";
import YahtzeeScoreCard from "./component/YahtzeeScoreCard";

export default function App() {
  const [scorecardWidth, setScorecardWidth] = useState(800);
  const [currentDice, setCurrentDice] = useState<any[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [life, setLife] = useState(3);
  const [round] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [scores] = useState<{ [key: string]: number | null }>({});
  const isResizingRef = useRef(false);
  const lastXRef = useRef(0);

  // --- Handle resizing sidebar ---
  const startResize = (e: React.MouseEvent) => {
    isResizingRef.current = true;
    lastXRef.current = e.clientX;
    e.preventDefault();
  };

  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (isResizingRef.current) {
        const diff = e.clientX - lastXRef.current;
        setScorecardWidth((prev) =>
          Math.max(250, Math.min(800, prev + diff))
        );
        lastXRef.current = e.clientX;
      }
    };
    const stopResize = () => (isResizingRef.current = false);
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", stopResize);
    };
  }, []);

  // --- End turn and switch player ---
  const handleEndTurn = () => {
    if (currentPlayer === 1) {
      setCurrentPlayer(2);
      setLife(3);
      setResetSignal((n) => n + 1);
    } else {
      setCurrentPlayer(1);
      setRound((r) => r + 1);
      setLife(3);
      setResetSignal((n) => n + 1);
    }
  };

  const calculatePlayerTotal = (player: number) => {
    const upperLabels = ["Aces", "Twos", "Threes", "Fours", "Fives", "Sixes"];
    const lowerLabels = [
      "Three of a Kind", "Four of a Kind", "Full House",
      "Sm Straight", "Lg Straight", "Yahtzee", "Chance"
    ];
    const upper = upperLabels.reduce(
      (sum, label) => sum + (scores[`${label}-game${player}`] ?? 0), 0
    );
    const lower = lowerLabels.reduce(
      (sum, label) => sum + (scores[`${label}-game${player}`] ?? 0), 0
    );
    const bonus = upper >= 63 ? 35 : 0;
    return upper + lower + bonus;
  };

  // 🏁 End game check
  useEffect(() => {
    if (round >= 13) {
      const total1 = calculatePlayerTotal(1);
      const total2 = calculatePlayerTotal(2);
      const winner = total1 > total2 ? 1 : total2 > total1 ? 2 : null;
      console.log("🏁 Game over!");
      if (winner)
        console.log(`🎉 Player ${winner} wins! (${Math.max(total1, total2)} points)`);
      else console.log("🤝 It's a tie!");
    }
  }, [round]);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <div className="py-6 text-center text-5xl font-extrabold tracking-widest text-yellow-400 drop-shadow-lg">
        YAHTZEE
      </div>

      {/* --- Main Content (Scorecard + Dice Area) --- */}
      <div className="flex flex-1 overflow-hidden pt-4"> {/* ← adds top space evenly */}        {/* Scorecard */}
        <div
          className="bg-gray-800 flex flex-col justify-start items-stretch shrink-0 overflow-hidden"
          style={{ width: `${scorecardWidth}px`, height: "100%" }}
        >
          <YahtzeeScoreCard
            currentDice={currentDice}
            setCurrentDice={setCurrentDice}
            currentPlayer={currentPlayer}
            endTurn={handleEndTurn}
            rolling={rolling}
          />
        </div>

        {/* Resizer */}
        <div
          className="w-1 bg-gray-600 hover:bg-gray-500 cursor-ew-resize shrink-0 transition-colors"
          onMouseDown={startResize}
        />

        {/* Dice Area */}
        <div className="bg-gray-800 flex flex-col justify-start items-stretch shrink-0  flex-1 overflow-hidden">
          <GameDice
            currentDice={currentDice}
            setCurrentDice={setCurrentDice}
            life={life}
            setLife={setLife}
            currentPlayer={currentPlayer}
            resetSignal={resetSignal}
            setRolling={setRolling}
            rolling={rolling}
          />
        </div>
      </div>
    </div>
  );
}
