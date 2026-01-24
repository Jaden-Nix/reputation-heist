// TODO: Verified deployment on Base Sepolia
export const BASE_HEIST_ADDRESS = '0x93C1E866AD3e30a50067B8B79A78b2D42361c032';

export const BASE_HEIST_ABI = [
    {
        "type": "constructor",
        "inputs": [
            { "name": "_heistMaster", "type": "address", "internalType": "address" }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "createHeist",
        "inputs": [
            { "name": "_opponent", "type": "address", "internalType": "address" },
            { "name": "_dareType", "type": "string", "internalType": "string" },
            { "name": "_stakedRep", "type": "uint256", "internalType": "uint256" },
            { "name": "_duration", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "heists",
        "inputs": [
            { "name": "", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [
            { "name": "id", "type": "uint256", "internalType": "uint256" },
            { "name": "player1", "type": "address", "internalType": "address" },
            { "name": "player2", "type": "address", "internalType": "address" },
            { "name": "bounty", "type": "uint256", "internalType": "uint256" },
            { "name": "stakedRep", "type": "uint256", "internalType": "uint256" },
            { "name": "duration", "type": "uint256", "internalType": "uint256" },
            { "name": "startTime", "type": "uint256", "internalType": "uint256" },
            { "name": "dareType", "type": "string", "internalType": "string" },
            { "name": "status", "type": "uint8", "internalType": "enum BaseHeist.HeistStatus" },
            { "name": "winner", "type": "address", "internalType": "address" },
            { "name": "verdict", "type": "string", "internalType": "string" },
            { "name": "isVow", "type": "bool", "internalType": "bool" },
            { "name": "createdAt", "type": "uint256", "internalType": "uint256" },
            { "name": "totalBetsP1", "type": "uint256", "internalType": "uint256" },
            { "name": "totalBetsP2", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "joinHeist",
        "inputs": [
            { "name": "_heistId", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
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
        "name": "submitProofAndJudge",
        "inputs": [
            { "name": "_heistId", "type": "uint256", "internalType": "uint256" },
            { "name": "_proofUrl", "type": "string", "internalType": "string" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "settleHeist",
        "inputs": [
            { "name": "_heistId", "type": "uint256", "internalType": "uint256" },
            { "name": "_winner", "type": "address", "internalType": "address" },
            { "name": "_verdict", "type": "string", "internalType": "string" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "claimWinnings",
        "inputs": [
            { "name": "_heistId", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "HeistCreated",
        "inputs": [
            { "name": "heistId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "p1", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "p2", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "bounty", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "stakedRep", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "duration", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "dareType", "type": "string", "indexed": false, "internalType": "string" },
            { "name": "isVow", "type": "bool", "indexed": false, "internalType": "bool" }
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
    },
    {
        "type": "event",
        "name": "ProofSubmitted",
        "inputs": [
            { "name": "heistId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "proofUrl", "type": "string", "indexed": false, "internalType": "string" },
            { "name": "submitter", "type": "address", "indexed": true, "internalType": "address" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "HeistSettled",
        "inputs": [
            { "name": "heistId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "winner", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "verdict", "type": "string", "indexed": false, "internalType": "string" },
            { "name": "payout", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "RepStaked",
        "inputs": [
            { "name": "heistId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "player", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "RepSlashed",
        "inputs": [
            { "name": "heistId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "player", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    }
] as const;
