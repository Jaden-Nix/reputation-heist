// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BaseHeist
 * @notice A high-stakes reputation wagering game on Base.
 * @dev Implements an atomic flow where proof submission triggers an event for an off-chain Oracle (Heist Master) to settle.
 */
contract BaseHeist {
    // --- State Variables ---
    address public heistMaster; // The Server-Side Oracle
    uint256 public heistCount;

    struct Heist {
        uint256 id;
        address player1;
        address player2;
        uint256 bounty;      // Total ETH at stake
        uint256 stakedRep;   // Reputation points staked by creator
        uint256 duration;    // Time limit for the dare (in seconds)
        uint256 startTime;   // When the opponent accepts
        string dareType;
        HeistStatus status;
        address winner;
        string verdict;      // "Balls: 10/10. You Cooked."
        bool isVow;          // New field for self-challenges
        uint256 createdAt;
        uint256 totalBetsP1;
        uint256 totalBetsP2;
    }

    enum HeistStatus { CREATED, ACTIVE, JUDGING, SETTLED }

    mapping(uint256 => Heist) public heists;
    mapping(uint256 => mapping(address => uint256)) public betsP1;
    mapping(uint256 => mapping(address => uint256)) public betsP2;

    // --- Events ---
    event HeistCreated(uint256 indexed heistId, address indexed p1, address indexed p2, uint256 bounty, uint256 stakedRep, uint256 duration, string dareType, bool isVow);
    event ProofSubmitted(uint256 indexed heistId, string proofUrl, address indexed submitter);
    event RepStaked(uint256 indexed heistId, address indexed player, uint256 amount);
    event RepSlashed(uint256 indexed heistId, address indexed player, uint256 amount);
    event HeistSettled(uint256 indexed heistId, address indexed winner, string verdict, uint256 payout);
    event BetPlaced(uint256 indexed heistId, address indexed better, bool supportP1, uint256 amount);

    // --- Modifiers ---
    modifier onlyHeistMaster() {
        require(msg.sender == heistMaster, "Only the Heist Master can judge.");
        _;
    }

    modifier inStatus(uint256 _heistId, HeistStatus _status) {
        require(heists[_heistId].status == _status, "Invalid Heist Status");
        _;
    }

    constructor(address _heistMaster) {
        heistMaster = _heistMaster; // Set initial Oracle
    }

    // --- Core Gameplay ---

    /**
     * @notice Create a new Heist with an opponent.
     * @param _opponent Address of the player you are challenging.
     * @param _dareType The type of dare (e.g., "GM_ROULETTE").
     * @param _stakedRep The amount of reputation points the creator is staking (optimistic).
     * @dev Msg.value determines the bounty pool. For V1, creator puts up the whole bounty to incentivize joining.
     */
    function createHeist(address _opponent, string memory _dareType, uint256 _stakedRep, uint256 _duration) external payable {
        require(msg.value > 0, "Stakes must be > 0");
        require(_opponent != address(0), "Invalid Opponent Address");
        
        bool isVow = (msg.sender == _opponent);

        heistCount++;
        uint256 newId = heistCount;

        heists[newId] = Heist({
            id: newId,
            player1: msg.sender,
            player2: _opponent,
            bounty: msg.value,
            stakedRep: _stakedRep,
            duration: _duration,
            startTime: isVow ? block.timestamp : 0,
            dareType: _dareType,
            status: isVow ? HeistStatus.ACTIVE : HeistStatus.CREATED,
            winner: address(0),
            verdict: "",
            isVow: isVow,
            createdAt: block.timestamp,
            totalBetsP1: 0,
            totalBetsP2: 0
        });

        emit HeistCreated(newId, msg.sender, _opponent, msg.value, _stakedRep, _duration, _dareType, isVow);
        if (_stakedRep > 0) {
            emit RepStaked(newId, msg.sender, _stakedRep);
        }
    }

    /**
     * @notice Opponent accepts the dare and stakes matching reputation.
     */
    function joinHeist(uint256 _heistId) external inStatus(_heistId, HeistStatus.CREATED) {
        Heist storage heist = heists[_heistId];
        
        // Validation
        if (heist.player2 != address(0)) {
            require(msg.sender == heist.player2, "Not the targeted opponent");
        } else {
            heist.player2 = msg.sender; // Open Bounty accepted
        }
        require(msg.sender != heist.player1, "Cannot join own heist");

        // Staking Logic (Optimistic)
        if (heist.stakedRep > 0) {
            emit RepStaked(_heistId, msg.sender, heist.stakedRep);
        }
        
        heist.startTime = block.timestamp;
        heist.status = HeistStatus.ACTIVE;
    }

    /**
     * @notice Spectators place bets on who they think will win.
     */
    function placeBet(uint256 _heistId, bool _supportP1) external payable inStatus(_heistId, HeistStatus.CREATED) {
        require(msg.value > 0, "Bet must be > 0");
        Heist storage heist = heists[_heistId];
        
        if (_supportP1) {
            betsP1[_heistId][msg.sender] += msg.value;
            heist.totalBetsP1 += msg.value;
        } else {
            betsP2[_heistId][msg.sender] += msg.value;
            heist.totalBetsP2 += msg.value;
        }

        emit BetPlaced(_heistId, msg.sender, _supportP1, msg.value);
    }

    /**
     * @notice Atomic action: Submit proof -> Trigger Judging Status.
     * @dev This moves the state to JUDGING. The UI should instantly show the "Thinking" animation.
     */
    function submitProofAndJudge(uint256 _heistId, string memory _proofUrl) external inStatus(_heistId, HeistStatus.CREATED) {
        Heist storage heist = heists[_heistId];
        require(msg.sender == heist.player1 || msg.sender == heist.player2, "Not a participant");

        heist.status = HeistStatus.JUDGING;
        emit ProofSubmitted(_heistId, _proofUrl, msg.sender);
    }

    /**
     * @notice The Oracle (Heist Master) settles the bet.
     * @param _heistId The ID of the heist to settle.
     * @param _winner The address declared winner.
     * @param _verdict The funny/brutal reason string.
     */
    function settleHeist(uint256 _heistId, address _winner, string memory _verdict) external onlyHeistMaster inStatus(_heistId, HeistStatus.JUDGING) {
        Heist storage heist = heists[_heistId];
        require(_winner == heist.player1 || _winner == heist.player2, "Winner must be a player");

        heist.winner = _winner;
        heist.verdict = _verdict; // Store the "Money Shot" line on-chain
        heist.status = HeistStatus.SETTLED;

        // Payout
        // Payout
        uint256 payout = heist.bounty;
        // In a real version, we might take a fee here. For hackathon -> 100% to winner.
        (bool sent, ) = _winner.call{value: payout}("");
        require(sent, "Failed to send Bounty");

        emit HeistSettled(_heistId, _winner, _verdict, payout);

        // Slash the loser's rep (mock/event-based)
        address loser = (_winner == heist.player1) ? heist.player2 : heist.player1;
        // If the creator (player1) staked rep, and they lost, slash 'em. 
        // If player2 lost, we could slash them too if they had staked rep (future scope). 
        // For now, let's just emit a slash event for the loser proportional to the stakes/severity.
        // We'll use the stakedRep value if it was the creator who lost, or a base amount for the opponent.
        uint256 slashAmount = heist.stakedRep > 0 ? heist.stakedRep : 100; 
        
        emit RepSlashed(_heistId, loser, slashAmount);
    }

    // --- Admin (Hackathon Safety) ---
    function claimWinnings(uint256 _heistId) external {
        Heist storage heist = heists[_heistId];
        require(heist.status == HeistStatus.SETTLED, "Not settled");
        
        bool winnerIsP1 = heist.winner == heist.player1;
        uint256 userBet;
        uint256 totalWinningSide;
        uint256 totalLosingSide;

        if (winnerIsP1) {
            userBet = betsP1[_heistId][msg.sender];
            totalWinningSide = heist.totalBetsP1;
            totalLosingSide = heist.totalBetsP2;
            betsP1[_heistId][msg.sender] = 0; 
        } else {
            userBet = betsP2[_heistId][msg.sender];
            totalWinningSide = heist.totalBetsP2;
            totalLosingSide = heist.totalBetsP1;
             betsP2[_heistId][msg.sender] = 0;
        }

        require(userBet > 0, "No winning bet");
        require(totalWinningSide > 0, "Math error");

        // Payout = Your Bet + (Your Share of Losers Pool)
        uint256 winnings = userBet + (totalLosingSide * userBet / totalWinningSide);
        (bool sent, ) = msg.sender.call{value: winnings}("");
        require(sent, "Payout failed");
    }
}
