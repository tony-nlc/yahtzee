import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import YahtzeeScoreCard from "./component/YahtzeeScoreCard";
import GameDice from "./component/GameDice";

function App() {
  const [scorecardWidth, setScorecardWidth] = useState(400);
  const [currentDice, setCurrentDice] = useState([]);
  const isResizingRef = useRef(false);
  const lastXRef = useRef(0);

  const startResize = (e: React.MouseEvent) => {
    isResizingRef.current = true;
    lastXRef.current = e.clientX;
    e.preventDefault();
  };

  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (isResizingRef.current) {
        const diff = e.clientX - lastXRef.current;
        setScorecardWidth((prevWidth) => Math.max(250, Math.min(800, prevWidth + diff)));
        lastXRef.current = e.clientX;
      }
    };

    const stopResize = () => {
      isResizingRef.current = false;
    };

    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);

    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", stopResize);
    };
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-900">
      {/* Left section (Scorecard) */}
      <div
        className="bg-gray-800 overflow-y-auto overflow-x-hidden flex-shrink-0"
        style={{
          width: `${scorecardWidth}px`,
        }}
      >
        <div className="p-4">
          <YahtzeeScoreCard currentDice={currentDice}/>
        </div>
      </div>

      {/* Resizer */}
      <div
        className="w-1 bg-gray-600 hover:bg-gray-500 cursor-ew-resize flex-shrink-0 transition-colors"
        onMouseDown={startResize}
      />

      {/* Right section (Dice Roller) */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 h-full">
          <GameDice setCurrentDice={setCurrentDice} currentDice={currentDice}/>
        </div>
      </div>
    </div>
  );
}

export default App;
