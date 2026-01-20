import { Heist, HeistCategory } from './types';

// Mock avatars or just use blockies in UI
const PLAYERS = [
  { name: "Vitalik", address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", ethosScore: 9999 },
  { name: "DegenSpartan", address: "0x4E...59", ethosScore: 1337 },
  { name: "Cobie", address: "0x12...34", ethosScore: 8888 },
  { name: "SBF_Ghost", address: "0x00...00", ethosScore: 0 },
  { name: "Brian Armstrong", address: "0xBA...BA", ethosScore: 5555 },
  { name: "Base God", address: "0x84...53", ethosScore: 8453 },
  { name: "Jesse Pollak", address: "0xBA...5E", ethosScore: 9000 },
];

function randomPlayer() {
  return PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
}

export const LEGENDARY_HEISTS: Heist[] = [
  // SOCIAL
  {
    id: "h-1",
    player1: PLAYERS[6], // Jesse
    player2: PLAYERS[0], // Vitalik
    dare: "Get Elon to reply 'Based'",
    category: 'SOCIAL',
    bounty: "5.0 ETH",
    status: 'LIVE',
    heistMasterMood: 'cooking',
    timestamp: "2m ago",
    winner: "",
    verdict: ""
  },
  {
    id: "h-2",
    player1: PLAYERS[1],
    player2: PLAYERS[2],
    dare: "Ratio a sitting Senator",
    category: 'SOCIAL',
    bounty: "1.5 ETH",
    status: 'SETTLED',
    winner: PLAYERS[1].name,
    heistMasterMood: 'brutal',
    verdict: "Balls: 10/10. Senator deleted account. FLANLESS VICTORY.",
    timestamp: "1h ago"
  },
  // IRL
  {
    id: "h-3",
    player1: PLAYERS[5],
    player2: { name: "Anon", address: "0x...", ethosScore: 10 },
    dare: "Touch grass at Area 51",
    category: 'IRL',
    bounty: "0.420 ETH",
    status: 'JUDGING',
    heistMasterMood: 'cooking',
    timestamp: "5m ago",
    winner: "", verdict: ""
  },
  {
    id: "h-4",
    player1: { name: "GymBro", address: "0x...", ethosScore: 50 },
    player2: { name: "Nerd", address: "0x...", ethosScore: 900 },
    dare: "Bench press 225lbs on livestream",
    category: 'IRL',
    bounty: "0.1 ETH",
    status: 'SETTLED',
    winner: "Nerd",
    heistMasterMood: 'impressed',
    verdict: "Unexpected strength. Form was shaky but lock-out was valid.",
    timestamp: "3h ago"
  },
  // DEGEN & ON-CHAIN
  {
    id: "h-5",
    player1: PLAYERS[3],
    player2: PLAYERS[5],
    dare: "Buy $BALD at ATH and profit",
    category: 'DEGEN',
    bounty: "100 ETH",
    status: 'SETTLED',
    winner: PLAYERS[5].name,
    heistMasterMood: 'disappointed',
    verdict: "SBF_Ghost got rugged. Balance: 0. REKT.",
    timestamp: "1y ago"
  },
  {
    id: "h-6",
    player1: PLAYERS[0],
    player2: PLAYERS[6],
    dare: "Bridge 1000 ETH to Base in 1 tx",
    category: 'ON_CHAIN',
    bounty: "10 ETH",
    status: 'SETTLED',
    winner: PLAYERS[0].name,
    heistMasterMood: 'impressed',
    verdict: "Transaction confirmed in block 129381. Smooth.",
    timestamp: "4h ago"
  }
];

export function generateLiveHeist(): Heist {
  const p1 = randomPlayer();
  const p2 = randomPlayer();
  const actions = [
    "Chug a raw egg",
    "Tweet your seed phrase (fake)",
    "Deploy a rugpull",
    "Get blocked by @cz_binance"
  ];
  return {
    id: `live-${Date.now()}`,
    player1: p1,
    player2: p2,
    dare: actions[Math.floor(Math.random() * actions.length)],
    category: 'DEGEN',
    bounty: (Math.random() * 5).toFixed(2) + " ETH",
    status: 'LIVE',
    heistMasterMood: 'cooking',
    timestamp: "Just now",
    winner: "",
    verdict: "",
    totalBetsP1: "0.0",
    totalBetsP2: "0.0"
  }
}
