type Die = { value: number };

const countDice = (dice: Die[]) => {
  const counts: Record<number, number> = {};
  for (const d of dice) {
    counts[d.value] = (counts[d.value] || 0) + 1;
  }
  return counts;
};

const isStraight = (values: number[], length: number) => {
  const uniqueSorted = Array.from(new Set(values)).sort((a, b) => a - b);
  let longest = 1;
  let current = 1;
  for (let i = 1; i < uniqueSorted.length; i++) {
    if (uniqueSorted[i] === uniqueSorted[i - 1] + 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest >= length;
};

export default function calculateScoreForCategory(label: string, rolledDice: Die[]) {
  if (rolledDice.length === 0) return 0;

  const counts = countDice(rolledDice);
  const values = Object.keys(counts).map(Number);
  const countArr = Object.values(counts);
  const total = values.reduce((a, b) => a + b * counts[b], 0);

  switch (label) {
    // --- UPPER SECTION ---
    case "Aces":   return (counts[1] || 0) * 1;
    case "Twos":   return (counts[2] || 0) * 2;
    case "Threes": return (counts[3] || 0) * 3;
    case "Fours":  return (counts[4] || 0) * 4;
    case "Fives":  return (counts[5] || 0) * 5;
    case "Sixes":  return (counts[6] || 0) * 6;

    // --- LOWER SECTION ---
    case "Three of a Kind":
      return countArr.includes(3) ? total : 0;
    case "Four of a Kind":
      return countArr.includes(4) ? total : 0;
    case "Full House":
      return countArr.includes(3) && countArr.includes(2) ? 25 : 0;
    case "Small Straight":
    case "Sm Straight":
      return isStraight(values, 4) ? 30 : 0;
    case "Large Straight":
    case "Lg Straight":
      return isStraight(values, 5) ? 40 : 0;
    case "Yahtzee":
      return countArr.includes(5) ? 50 : 0;
    case "Chance":
      return total;
    default:
      return 0;
  }
}
