import { Card, PokerHand, CardRank } from "./types";

function getRankValue(rank: CardRank): number {
  const rankMap: { [key in CardRank]: number } = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14
  };
  return rankMap[rank];
}

function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  if (k > arr.length || k <= 0) return result;
  if (k === arr.length) return [arr];
  if (k === 1) return arr.map(a => [a]);
  for (let i = 0; i < arr.length - k + 1; i++) {
    const rest = combinations(arr.slice(i + 1), k - 1);
    for (const comb of rest) {
      result.push([arr[i], ...comb]);
    }
  }
  return result;
}

function evaluateFiveCards(cards: Card[]): PokerHand {
  const suits = new Set(cards.map(card => card.suit));
  const isFlush = suits.size === 1;

  const values = cards.map(card => getRankValue(card.rank)).sort((a, b) => a - b);
  let isStraight = false;
  let straightHigh: CardRank | null = null;
  if (values[4] - values[0] === 4 && new Set(values).size === 5) {
    isStraight = true;
    straightHigh = cards.find(card => getRankValue(card.rank) === values[4])!.rank as CardRank;
  } else if (values[0] === 2 && values[1] === 3 && values[2] === 4 && values[3] === 5 && values[4] === 14) {
    isStraight = true;
    straightHigh = '5';
  }

  if (isFlush && isStraight) {
    if (straightHigh === 'A' && values[0] === 10) {
      return { rank: 9, name: 'Royal Flush', highCard: 'A' };
    } else {
      return { rank: 8, name: 'Straight Flush', highCard: straightHigh! };
    }
  } else if (isFlush) {
    const highCard = cards.reduce((max, card) => getRankValue(card.rank) > getRankValue(max.rank) ? card : max, cards[0]).rank;
    return { rank: 5, name: 'Flush', highCard };
  } else if (isStraight) {
    return { rank: 4, name: 'Straight', highCard: straightHigh! };
  }

  const freq = new Map<CardRank, number>();
  for (const card of cards) {
    freq.set(card.rank, (freq.get(card.rank) || 0) + 1);
  }
  const countList = Array.from(freq.values()).sort((a, b) => b - a);

  if (countList[0] === 4) {
    const fourRank = Array.from(freq.entries()).find(([rank, count]) => count === 4)![0];
    return { rank: 7, name: 'Four of a Kind', highCard: fourRank };
  } else if (countList[0] === 3 && countList[1] === 2) {
    const threeRank = Array.from(freq.entries()).find(([rank, count]) => count === 3)![0];
    return { rank: 6, name: 'Full House', highCard: threeRank };
  } else if (countList[0] === 3) {
    const threeRank = Array.from(freq.entries()).find(([rank, count]) => count === 3)![0];
    return { rank: 3, name: 'Three of a Kind', highCard: threeRank };
  } else if (countList[0] === 2 && countList[1] === 2) {
    const pairs = Array.from(freq.entries()).filter(([rank, count]) => count === 2).map(([rank]) => rank).sort((a, b) => getRankValue(b) - getRankValue(a));
    const highPair = pairs[0];
    return { rank: 2, name: 'Two Pair', highCard: highPair };
  } else if (countList[0] === 2) {
    const pairRank = Array.from(freq.entries()).find(([rank, count]) => count === 2)![0];
    return { rank: 1, name: 'One Pair', highCard: pairRank };
  } else {
    const highCard = cards.reduce((max, card) => getRankValue(card.rank) > getRankValue(max.rank) ? card : max, cards[0]).rank;
    return { rank: 0, name: 'High Card', highCard };
  }
}

export function evaluateHand(cards: Card[]): PokerHand {
  const allCombos = combinations(cards, 5);
  let bestHand: PokerHand | null = null;
  for (const combo of allCombos) {
    const hand = evaluateFiveCards(combo);
    if (!bestHand || hand.rank > bestHand.rank || (hand.rank === bestHand.rank && getRankValue(hand.highCard as CardRank) > getRankValue(bestHand.highCard as CardRank))) {
      bestHand = hand;
    }
  }
  return bestHand!;
}