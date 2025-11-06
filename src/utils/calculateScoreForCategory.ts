export default function calculateScoreForCategory(category: string, dice: any[]) {
  if (!dice || dice.length === 0) return 0;
  
  const values = dice.map(d => d.value).sort((a, b) => a - b);
  const counts = values.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const sum = values.reduce((a, b) => a + b, 0);
  
  switch (category) {
    case "Aces": return values.filter(v => v === 1).length * 1;
    case "Twos": return values.filter(v => v === 2).length * 2;
    case "Threes": return values.filter(v => v === 3).length * 3;
    case "Fours": return values.filter(v => v === 4).length * 4;
    case "Fives": return values.filter(v => v === 5).length * 5;
    case "Sixes": return values.filter(v => v === 6).length * 6;
    case "Three of a Kind": 
      return Object.values(counts).some((c) => (c as number) >= 3) ? sum : 0;
    case "Four of a Kind": 
      return Object.values(counts).some((c) => (c as number) >= 4) ? sum : 0;
    case "Full House": {
      const hasTrio = Object.values(counts).includes(3);
      const hasPair = Object.values(counts).includes(2);
      return (hasTrio && hasPair) ? 25 : 0;
    }
    case "Sm Straight": {
      const unique = [...new Set(values)].sort((a, b) => a - b);
      const hasSmall = 
        unique.join('').includes('1234') ||
        unique.join('').includes('2345') ||
        unique.join('').includes('3456');
      return hasSmall ? 30 : 0;
    }
    case "Lg Straight": {
      const unique = [...new Set(values)].sort((a, b) => a - b);
      return (unique.join('') === '12345' || unique.join('') === '23456') ? 40 : 0;
    }
    case "Yahtzee": 
      return Object.values(counts).includes(5) ? 50 : 0;
    case "Chance": 
      return sum;
    default: 
      return 0;
  }
}