import React, { useState } from "react";
import calculateScoreForCategory from "../utils/calculateScoreForCategory";

export default function YahtzeeScoreCard(currentDice) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [scores, setScores] = useState<{ [key: string]: number | null }>({});

  const handleCellClick = (id: string) => {
    setSelectedCell(id);
    const category = id.split("-game")[0];
    const scoreValue = calculateScoreForCategory(category, currentDice);
    setScores((prev) => ({ ...prev, [id]: scoreValue }));
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

  // Calculation helpers
  const calculateUpperTotal = (player: number) => {
    const upperLabels = upperSection.map((r) => r.label);
    return upperLabels.reduce((sum, label) => {
      const val = scores[`${label}-game${player}`] ?? 0;
      return sum + val;
    }, 0);
  };

  const calculateLowerTotal = (player: number) => {
    const lowerLabels = lowerSection.map((r) => r.label);
    return lowerLabels.reduce((sum, label) => {
      const val = scores[`${label}-game${player}`] ?? 0;
      return sum + val;
    }, 0);
  };

  const calculateBonus = (player: number) => {
    const total = calculateUpperTotal(player);
    return total >= 63 ? 35 : 0;
  };

  const calculateGrandTotal = (player: number) => {
    return (
      calculateUpperTotal(player) +
      calculateBonus(player) +
      calculateLowerTotal(player)
    );
  };

  const cellClass = (id: string) =>
    `border border-gray-600 text-center py-2 cursor-pointer transition-colors duration-150 
     ${selectedCell === id ? "bg-yellow-300 text-black font-semibold" : "hover:bg-gray-700/60"}
    `;

  return (
    <div className="overflow-x-auto bg-gray-900 text-gray-200 h-full p-4">
      <div className="text-center text-3xl font-extrabold mb-2 text-yellow-400 drop-shadow-md">
        YAHTZEE
      </div>
      <div className="text-center text-base font-medium mb-4 text-gray-300">
        Score Card
      </div>

      {/* Upper Section */}
      <table className="w-full border-collapse text-xs shadow-xl rounded-lg overflow-hidden mb-6">
        <thead className="bg-gray-800 text-yellow-300">
          <tr>
            <th className="border border-gray-700 p-2">UPPER SECTION</th>
            <th className="border border-gray-700 p-2">HOW TO SCORE</th>
            {players.map((g) => (
              <th key={g} className="border border-gray-700 p-2">
                Player #{g}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-850">
          {upperSection.map((row, i) => (
            <tr key={i} className="hover:bg-gray-800/40">
              <td className="border border-gray-700 p-2 font-medium text-yellow-200">
                {row.label}
              </td>
              <td className="border border-gray-700 p-2 text-gray-300">
                {row.desc}
              </td>
              {players.map((g) => {
                const id = `${row.label}-game${g}`;
                return (
                  <td
                    key={id}
                    className={cellClass(id)}
                    onClick={() => handleCellClick(id,)}
                  >
                    {scores[id] ?? ""}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Upper totals and bonus */}
          <tr className="bg-gray-800 text-yellow-300 font-semibold">
            <td className="border border-gray-700 p-2" colSpan={2}>
              Upper Total
            </td>
            {players.map((g) => (
              <td key={`upper-total-${g}`} className="border border-gray-700 p-2 text-center">
                {calculateUpperTotal(g)}
              </td>
            ))}
          </tr>

          <tr className="bg-gray-800 text-yellow-300 font-semibold">
            <td className="border border-gray-700 p-2" colSpan={2}>
              Bonus (≥63)
            </td>
            {players.map((g) => (
              <td key={`bonus-${g}`} className="border border-gray-700 p-2 text-center">
                {calculateBonus(g)}
              </td>
            ))}
          </tr>

          <tr className="bg-gray-900 text-yellow-400 font-bold">
            <td className="border border-gray-700 p-2" colSpan={2}>
              Upper Section Total
            </td>
            {players.map((g) => (
              <td key={`upper-section-total-${g}`} className="border border-gray-700 p-2 text-center">
                {calculateUpperTotal(g) + calculateBonus(g)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Lower Section */}
      <table className="w-full border-collapse text-xs shadow-xl rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-yellow-300">
          <tr>
            <th className="border border-gray-700 p-2">LOWER SECTION</th>
            <th className="border border-gray-700 p-2">HOW TO SCORE</th>
            {players.map((g) => (
              <th key={g} className="border border-gray-700 p-2">
                Player #{g}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lowerSection.map((row, i) => (
            <tr key={i} className="hover:bg-gray-800/40">
              <td className="border border-gray-700 p-2 font-medium text-yellow-200">
                {row.label}
              </td>
              <td className="border border-gray-700 p-2 text-gray-300">
                {row.desc}
              </td>
              {players.map((g) => {
                const id = `${row.label}-game${g}`;
                return (
                  <td
                    key={id}
                    className={cellClass(id)}
                    onClick={() => handleCellClick(id)}
                  >
                    {scores[id] ?? ""}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Lower total */}
          <tr className="bg-gray-800 text-yellow-300 font-semibold">
            <td className="border border-gray-700 p-2" colSpan={2}>
              Lower Total
            </td>
            {players.map((g) => (
              <td key={`lower-total-${g}`} className="border border-gray-700 p-2 text-center">
                {calculateLowerTotal(g)}
              </td>
            ))}
          </tr>

          {/* Grand total */}
          <tr className="bg-gray-900 text-yellow-400 font-bold">
            <td className="border border-gray-700 p-2" colSpan={2}>
              GRAND TOTAL
            </td>
            {players.map((g) => (
              <td key={`grand-total-${g}`} className="border border-gray-700 p-2 text-center">
                {calculateGrandTotal(g)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
