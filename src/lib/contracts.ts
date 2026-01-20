// TODO: Verified deployment on Base Sepolia
export const BASE_HEIST_ADDRESS = '0xe0759c5257608c4fDc4c9043a425ad4086075C66';

export const BASE_HEIST_ABI = [
    {
        "type": "constructor",
        "inputs": [
            { "name": "_heistMaster", "type": "address", "internalType": "address" },
            { "name": "_treasury", "type": "address", "internalType": "address" },
            { "name": "_communityPool", "type": "address", "internalType": "address" }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "createHeist",
        "inputs": [
            { "name": "_opponent", "type": "address", "internalType": "address" },
            { "name": "_collateral", "type": "uint256", "internalType": "uint256" },
            { "name": "_dareType", "type": "string", "internalType": "string" }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "placeBet",
        "inputs": [
            { "name": "_heistId", "type": "uint256", "internalType": "uint256" },
            { "name": "_supportP1", "type": "bool", "internalType": "bool" }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "submitProof",
        "inputs": [
            { "name": "_heistId", "type": "uint256", "internalType": "uint256" },
            { "name": "_proofUrl", "type": "string", "internalType": "string" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "name": "joinHeist",
        "type": "function",
        "inputs": [
            { "name": "_heistId", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "heists",
        "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "outputs": [
            { "name": "id", "type": "uint256", "internalType": "uint256" },
            { "name": "player1", "type": "address", "internalType": "address" },
            { "name": "player2", "type": "address", "internalType": "address" },
            { "name": "bounty", "type": "uint256", "internalType": "uint256" },
            { "name": "collateral", "type": "uint256", "internalType": "uint256" },
            { "name": "dareType", "type": "string", "internalType": "string" },
            { "name": "status", "type": "uint8", "internalType": "enum HeistManager.HeistStatus" },
            { "name": "winner", "type": "address", "internalType": "address" },
            { "name": "verdict", "type": "string", "internalType": "string" },
            { "name": "confidenceScore", "type": "uint256", "internalType": "uint256" },
            { "name": "createdAt", "type": "uint256", "internalType": "uint256" },
            { "name": "disputeEndTime", "type": "uint256", "internalType": "uint256" },
            { "name": "disputer", "type": "address", "internalType": "address" },
            { "name": "disputeStake", "type": "uint256", "internalType": "uint256" },
            { "name": "totalBetsP1", "type": "uint256", "internalType": "uint256" },
            { "name": "totalBetsP2", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "HeistCreated",
        "inputs": [
            { "name": "heistId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "p1", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "p2", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "bounty", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "collateral", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "dareType", "type": "string", "indexed": false, "internalType": "string" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "BetPlaced",
        "inputs": [
            { "name": "heistId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "better", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "supportP1", "type": "bool", "indexed": false, "internalType": "bool" },
            { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    }
] as const;
