import { useEffect, useRef, useState } from "react";
import DiceBox from "@3d-dice/dice-box";
import DiceBoxModel from "../types/@3d-dice__dice-box"

interface GameDiceProps {
  currentDice: number[];  // or your dice type
  setCurrentDice: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function GameDice({
  currentDice,
  setCurrentDice,
  life,
  setLife,
  currentPlayer,
  resetSignal,
  rolling,
  setRolling,
}: {
  currentDice: GameDiceProps[];
  setCurrentDice: (dice: GameDiceProps[]) => void;
  life: number;
  setLife: (n: number) => void;
  currentPlayer: number;
  resetSignal: number;
  rolling: boolean;
  setRolling: (bool: boolean) => void;
}) {
  const diceBoxRef = useRef<HTMLDivElement>(null);
  const boxInstanceRef = useRef<any | null>(null);
  const isInitializingRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedDice, setLockedDice] = useState<any[]>([]);
  const [rolled, setRolled] = useState(false);
  const [isDiceLoading, setIsDiceLoading] = useState(false);

  // --- DiceBox initialization ---
  useEffect(() => {
    let isMounted = true;

    const initDiceBox = async () => {
      if (boxInstanceRef.current || !diceBoxRef.current || isInitializingRef.current) return;
      isInitializingRef.current = true;
      try {
        const box = new (DiceBox as DiceBoxModel) ("#dice-box", {
          assetPath: "/assets/dice-box/",
    themes: [
        "/assets/dice-box/themes/smooth/",
        "/assets/dice-box/themes/smooth-pip/"
    ],
          scale: 9,
          themeColor: "#ffffff",
        });

        box.onRollComplete = (results: any) => {
          if (isMounted && results?.[0]?.rolls) {
            const newRolls = results[0].rolls;
            const lockedDiceObjects = lockedDice.map((locked) =>
              currentDice.find((d) => d.rollId === locked.rollId) || locked
            );
            const mergedDice = [
              ...lockedDiceObjects,
              ...newRolls.filter(
                (die: any) => !lockedDiceObjects.some((d) => d.rollId === die.rollId)
              ),
            ];
            setCurrentDice(mergedDice);
            setIsDiceLoading(false); // ✅ stop loading after dice update
           setRolling(false) 
          }
        };

        box.init();
        if (isMounted) {
          boxInstanceRef.current = box;
          setIsInitialized(true);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Failed to init dice box");
      } finally {
        isInitializingRef.current = false;
      }
    };

    initDiceBox();
    return () => {
      isMounted = false;
      const container = document.querySelector("#dice-box");
      if (container) container.querySelectorAll("canvas").forEach((c) => c.remove());
      boxInstanceRef.current = null;
      setIsInitialized(false);
    };
  }, []);

  // --- Reset when next player starts ---
  useEffect(() => {
    setRolling(false);
    setRolled(false);
    setLockedDice([]);
    setIsDiceLoading(false);
  }, [resetSignal]);

  // --- Roll handlers ---
  const handleRoll = () => {
    if (!boxInstanceRef.current || !isInitialized || life <= 0) return;
    setRolling(true);
    setRolled(true);
    setIsDiceLoading(true); // ✅ show loading
    boxInstanceRef.current.clear();
    boxInstanceRef.current.roll("5dpip");
    setLife(life - 1);
  };

  useEffect(() => {
  if (!rolling && currentDice.length > 0) {
    const timer = setTimeout(() => setIsDiceLoading(false), 200); // stop gif after a short delay
    return () => clearTimeout(timer);
  }
}, [rolling, currentDice]);


  const handleReroll = () => {
    if (!boxInstanceRef.current || !currentDice || life <= 0) return;
    const unlockedDice = currentDice.filter(
      (die: any) => !lockedDice.some((locked) => locked.rollId === die.rollId)
    );
    if (unlockedDice.length === 0) return;
    setRolling(true);
    setIsDiceLoading(true); // ✅ show loading
    boxInstanceRef.current.reroll(
      unlockedDice.map((die: any) => ({
        groupId: die.groupId,
        rollId: die.rollId,
        sides: die.sides,
      })),
      { remove: true }
    );
    setLife(life - 1);
  };

  const handleLockDie = (die: any) => {
    setLockedDice((prev) =>
      prev.some((d) => d.rollId === die.rollId)
        ? prev.filter((d) => d.rollId !== die.rollId)
        : [...prev, die]
    );
  };

  return (
    <div className="w-full min-h-screen text-gray-200 border-t border-gray-700 ">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-800/80 border border-gray-700 shadow-xl rounded-xl px-6 py-4">
          <h2 className="text-2xl font-bold text-yellow-400 drop-shadow-md">
            👤 Player #{currentPlayer}
          </h2>
          <h2 className="text-lg font-semibold text-yellow-300">
            Rolls Left:{" "}
            <span className="text-yellow-200 font-bold text-xl">{life}</span>
          </h2>
           {currentDice.length > 0 ? (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 justify-items-center">
      {currentDice.map((die: any, i: number) => {
        const isLocked = lockedDice.some((ld: any) => ld.rollId === die.rollId);
        const showRollingGif = rolling && isDiceLoading && !isLocked;
        const dieImage = showRollingGif
          ? "/dice/dice-game.gif"
          : `/dice/${["ace", "two", "three", "four", "five", "six"][die.value - 1]}.png`;

        return (
          <div
            key={i}
            onClick={() => !rolling && handleLockDie(die)}
            className={`group cursor-pointer border-2 rounded-xl aspect-square flex items-center justify-center transition-all shadow-md w-16 sm:w-20 ${
              isLocked
                ? "bg-yellow-400/20 border-yellow-500 hover:bg-yellow-400/30"
                : "bg-gray-800/70 border-gray-600 hover:bg-gray-700/70"
            }`}
          >
            <img
              src={dieImage}
              alt={showRollingGif ? "Rolling..." : `Die ${die.value}`}
              className={`w-16 h-16 object-contain drop-shadow-md rounded-lg transition-transform duration-150 ${
                showRollingGif ? "animate-pulse" : "group-hover:scale-110 bg-amber-50"}`}
            />
          </div>
        );
      })}
    </div>
  ) : (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 justify-items-center">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="border-2 border-gray-700 bg-gray-900/70 rounded-xl aspect-square flex items-center justify-center opacity-60 w-16 sm:w-20"
        >
          <img
            src="/dice/dice-game.gif"
            alt="Placeholder"
            className="w-16 h-16 object-contain rounded-lg opacity-70"
          />
        </div>
      ))}
    </div>
  )}
        </div>


        {/* Dice Box */}
        <div className="relative">
          <div
            id="dice-box"
            ref={diceBoxRef}
            className="w-full h-64 md:h-96 lg:h-[550px] bg-gray-950 border border-gray-700 rounded-xl shadow-2xl transition-all mb-6"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900/40 border border-red-700 text-red-400 rounded-lg">
            <p className="font-semibold">⚠️ Error: {error}</p>
            <p className="text-sm mt-1">Make sure assets exist in /public/assets/dice-box/</p>
          </div>
        )}

        {/* Roll / Reroll Button */}
        <div className="flex justify-center">
          {!rolling && life > 0 && (
            <button
              onClick={rolled ? handleReroll : handleRoll}
              disabled={!isInitialized}
              className="px-10 py-4 text-lg font-bold rounded-xl shadow-lg transition-all bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rolled ? "🎲 Reroll" : "🎲 Roll Dice"}
            </button>
          )}
        </div>
      </div>
  );

}
