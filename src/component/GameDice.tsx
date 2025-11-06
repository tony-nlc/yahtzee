import { useEffect, useRef, useState } from "react";
import DiceBox from "@3d-dice/dice-box";

export default function GameDice() {
  const diceBoxRef = useRef<HTMLDivElement>(null);
  const boxInstanceRef = useRef<DiceBox | null>(null);
  const isInitializingRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rolledDice, setRolledDice] = useState<any[]>([]);
  const [life, setLife] = useState<number>(3);
  const [lockedDice, setLockedDice] = useState<any[]>([]);
  const [rolling, setRolling] = useState<boolean>(false);
  const [rolled, setRolled] = useState<boolean>(false);
  const [round, setRound] = useState<number>(26);
  const [end, setEnd] = useState<boolean>(false);


  // ---------- Dice Box Initialization ----------
  useEffect(() => {
    let isMounted = true;

    const initDiceBox = async () => {
      if (boxInstanceRef.current || !diceBoxRef.current || isInitializingRef.current) return;

      isInitializingRef.current = true;
      try {
        const box = new DiceBox("#dice-box", {
          assetPath: "/assets/dice-box/",
          scale: 9,
          lightIntensity: 1,
          theme: "smooth-pip",
          themeColor: "#ffffff",
        });

        box.onRollComplete = (results: any) => {
          if (isMounted && results?.[0]?.rolls) {
            const newRolls = results[0].rolls;
            const lockedDiceObjects = lockedDice.map((locked) =>
              rolledDice.find((d) => d.rollId === locked.rollId) || locked
            );

            const mergedDice = [
              ...lockedDiceObjects,
              ...newRolls.filter(
                (die: any) => !lockedDiceObjects.some((d) => d.rollId === die.rollId)
              ),
            ];
            setRolledDice(mergedDice);
            setRolling(false);
            if (round === 0) setEnd(true);
          }
        };

        await box.init();
        if (isMounted) {
          boxInstanceRef.current = box;
          setIsInitialized(true);
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : "Failed to initialize");
        }
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
      isInitializingRef.current = false;
      setIsInitialized(false);
    };
  }, []);

  // ---------- Dice Handlers ----------
  const handleRoll = () => {
    if (!boxInstanceRef.current || !isInitialized) return;
    setRolling(true);
    setRolled(true);
    boxInstanceRef.current.clear();
    setLife(life - 1);
    boxInstanceRef.current.roll("5dpip");
  };

  const handleReroll = () => {
    if (!boxInstanceRef.current || !rolledDice) return;
    const unlockedDice = rolledDice.filter(
      (die: any) => !lockedDice.some((locked: any) => locked.rollId === die.rollId)
    );
    if (unlockedDice.length === 0) return;
    setRolling(true);
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

  // ---------- UI ----------
  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Results:</h3>
          <div className="grid grid-cols-5 gap-3">
            {rolledDice.map((die: any, i: number) => {
              const isLocked = lockedDice.some((ld: any) => ld.rollId === die.rollId);
              const dieImage = `../src/assets/${["ace", "two", "three", "four", "five", "six"][die.value - 1]}.png`;
              return (
                <div
                  key={i}
                  onClick={() => handleLockDie(die)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors
                    ${isLocked ? "bg-yellow-300 border-yellow-400" : "bg-blue-50 border-blue-200 hover:bg-blue-100"}`}
                >
                  <img src={dieImage} alt={`Die ${die.value}`} className="w-10 h-10" />
                </div>
              );
            })}
          </div>
        </div>

        <div
          id="dice-box"
          ref={diceBoxRef}
          className="w-full h-64 md:h-96 lg:h-[600px] bg-white border-2 border-gray-300 rounded-lg shadow-lg mb-6"
        />

        {error && (
          <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-semibold">Error: {error}</p>
            <p className="text-sm mt-2">Make sure you've copied the assets to public/assets/dice-box/</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 mb-6">
          {!rolling && !rolled && (
            <button
              onClick={handleRoll}
              disabled={!isInitialized}
              className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-300"
            >
              Start
            </button>
          )}
          {!rolling && rolled && (
            <button
              onClick={handleReroll}
              disabled={!isInitialized}
              className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-300"
            >
              Reroll
            </button>
          )}
        </div>

        {!isInitialized && !error && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-600">Loading dice...</p>
          </div>
        )}
      </div>
    </div>
  );
}
