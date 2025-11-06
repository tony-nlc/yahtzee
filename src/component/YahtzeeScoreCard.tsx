import { useState } from "react";
import calculateScoreForCategory from "../utils/calculateScoreForCategory";
export default function YahtzeeScoreCard({
  currentDice,
  setCurrentDice,
  currentPlayer,
  endTurn,
  rolling,
}: {
  currentDice: any[];
  setCurrentDice: (dice: any[]) => void;
  currentPlayer: number;
  endTurn: () => void;
  rolling: boolean;
}) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [scores, setScores] = useState<{ [key: string]: number | null }>({});

  const handleCellClick = (id: string) => {
    if (currentDice.length === 0 || rolling) return;
    const player = parseInt(id.split("game")[1]);
    if (player !== currentPlayer) return;
    if (scores[id] !== undefined && scores[id] !== null) return;

    setSelectedCell(id);
    const category = id.split("-game")[0];
    const scoreValue = calculateScoreForCategory(category, currentDice);
    setScores((prev) => ({ ...prev, [id]: scoreValue }));
    setCurrentDice([]);
    setSelectedCell("");
    endTurn();
  };

  const upperSection = [
    { label: "Aces", desc: "Count and add only Aces" },
    { label: "Twos", desc: "Count and add only Twos" },
    { label: "Threes", desc: "Count and add only Threes" },
    { label: "Fours", desc: "Count and add only Fours" },
    { label: "Fives", desc: "Count and add only Fives" },
    { label: "Sixes", desc: "Count and add only Sixes" },
  ];

  const lowerSection = [
    { label: "Three of a Kind", desc: "Add total of all dice" },
    { label: "Four of a Kind", desc: "Add total of all dice" },
    { label: "Full House", desc: "Score 25" },
    { label: "Sm Straight", desc: "Sequence of 4 - Score 30" },
    { label: "Lg Straight", desc: "Sequence of 5 - Score 40" },
    { label: "Yahtzee", desc: "5 of a Kind - Score 50" },
    { label: "Chance", desc: "Score total of all 5 dice" },
  ];

  const players = [1, 2];

  // Preview scores for hover effect
  const previewScores: { [key: string]: number } = {};
  if (currentDice.length > 0 && !rolling) {
    [...upperSection, ...lowerSection].forEach((row) => {
      players.forEach((p) => {
        const id = `${row.label}-game${p}`;
        if (p === currentPlayer && (scores[id] === undefined || scores[id] === null)) {
          previewScores[id] = calculateScoreForCategory(row.label, currentDice);
        }
      });
    });
  }

  // Totals
  const calculateUpperTotal = (player: number) =>
    upperSection.reduce((sum, row) => sum + (scores[`${row.label}-game${player}`] ?? 0), 0);

  const calculateLowerTotal = (player: number) =>
    lowerSection.reduce((sum, row) => sum + (scores[`${row.label}-game${player}`] ?? 0), 0);

  const calculateBonus = (player: number) => (calculateUpperTotal(player) >= 63 ? 35 : 0);

  const calculateGrandTotal = (player: number) =>
    calculateUpperTotal(player) + calculateBonus(player) + calculateLowerTotal(player);

  // Highlight totals by who’s leading
  const player1Total = calculateGrandTotal(1);
  const player2Total = calculateGrandTotal(2);

  const getTotalColor = (player: number) => {
    if (player1Total === player2Total) return "text-yellow-300"; // tie
    if (player === 1) {
      return player1Total > player2Total ? "text-green-400 font-bold" : "text-red-400";
    } else {
      return player2Total > player1Total ? "text-green-400 font-bold" : "text-red-400";
    }
  };

  const cellClass = (id: string) => {
    const player = parseInt(id.split("game")[1]);
    const isCurrentPlayer = player === currentPlayer;
    const isScored = scores[id] !== undefined && scores[id] !== null;

    return `
      border border-gray-700 text-center py-2 px-2 transition-all duration-200
      ${isScored ? "cursor-default text-white-800" : ""}
      ${!isScored && isCurrentPlayer && !rolling
        ? "cursor-pointer hover:bg-yellow-600/30 hover:text-yellow-300"
        : "opacity-50 cursor-not-allowed"}
      ${selectedCell === id ? "bg-yellow-600/30 text-yellow-300 font-semibold shadow-inner shadow-yellow-500" : ""}
    `;
  };

  return (
    <div className="text-gray-200 p-6 border border-gray-700 shadow-xl rounded-xl h-full">
      {/* Header */}
      <div className="text-center mb-3">
        <h1 className="text-4xl font-extrabold text-yellow-400 drop-shadow-lg tracking-widest">
          Scorecard
        </h1>
      </div>

      <div
        className={`transition-opacity ${currentDice.length === 0 || rolling
          ? "opacity-50 pointer-events-none"
          : "opacity-100"
          }`}
      >
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-800 text-yellow-300">
            <tr>
              <th className="border border-gray-700 p-2">Category</th>
              <th className="border border-gray-700 p-2">How to Score</th>
              {players.map((g) => (
                <th key={g} className="border border-gray-700 p-2">
                  Player #{g}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900">
            {/* Upper Section */}
            {upperSection.map((row, i) => (
              <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                <td className="border border-gray-700 p-2 text-yellow-200 font-medium text-center">
                  {row.label}
                </td>
                <td className="border border-gray-700 p-2 text-gray-400">{row.desc}</td>
                {players.map((g) => {
                  const id = `${row.label}-game${g}`;
                  const value = scores[id];
                  const preview = previewScores[id];
                  const canScore = g === currentPlayer && (value === undefined || value === null);
                  return (
                    <td key={id} className={cellClass(id)} onClick={() => handleCellClick(id)}>
                      {value !== undefined && value !== null ? (
                        value
                      ) : canScore && preview ? (
                        <span className="text-white-700 font-medium select-none">{preview}</span>
                      ) : (
                        <span className="text-white-700 select-none">0</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Upper Totals */}
            <tr className="bg-gray-800 text-yellow-400 font-semibold">
              <td className="border border-gray-700 p-2" colSpan={2}>
                Upper Total
              </td>
              {players.map((g) => (
                <td key={g} className="border border-gray-700 p-2 text-center">
                  {calculateUpperTotal(g)}
                </td>
              ))}
            </tr>
            <tr className="bg-gray-800 text-yellow-400 font-semibold">
              <td className="border border-gray-700 p-2" colSpan={2}>
                Bonus (≥63)
              </td>
              {players.map((g) => (
                <td key={g} className="border border-gray-700 p-2 text-center">
                  {calculateBonus(g)}
                </td>
              ))}
            </tr>

            {/* Lower Section */}
            {lowerSection.map((row, i) => (
              <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                <td className="border border-gray-700 p-2 text-yellow-200 font-medium text-center">
                  {row.label}
                </td>
                <td className="border border-gray-700 p-2 text-gray-400">{row.desc}</td>
                {players.map((g) => {
                  const id = `${row.label}-game${g}`;
                  const value = scores[id];
                  const preview = previewScores[id];
                  const canScore = g === currentPlayer && (value === undefined || value === null);
                  return (
                    <td key={id} className={cellClass(id)} onClick={() => handleCellClick(id)}>
                      {value !== undefined && value !== null ? (
                        value
                      ) : canScore && preview ? (
                        <span className="text-white-700 font-medium select-none">{preview}</span>
                      ) : (
                        <span className="text-white-700 select-none">0</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Lower Total */}
            <tr className="bg-gray-800 text-yellow-400 font-semibold">
              <td className="border border-gray-700 p-2" colSpan={2}>
                Lower Total
              </td>
              {players.map((g) => (
                <td key={g} className="border border-gray-700 p-2 text-center">
                  {calculateLowerTotal(g)}
                </td>
              ))}
            </tr>

            {/* Grand Total with color highlighting */}
            <tr className="bg-gray-900 font-bold text-lg">
              <td className="border border-gray-700 p-2 text-yellow-300" colSpan={2}>
                GRAND TOTAL
              </td>
              {players.map((g) => (
                <td
                  key={g}
                  className={`border border-gray-700 p-2 text-center ${getTotalColor(g)}`}
                >
                  {calculateGrandTotal(g)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
