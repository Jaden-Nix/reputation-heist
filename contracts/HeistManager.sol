// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HeistManager
 * @notice The "Steel & Logic" core of Reputation Heist.
 * @dev Implements Identity Isolation, Tiered Resolution (AI Confidence), and Ethos Reputation Integration.
 */
contract HeistManager is Ownable, ReentrancyGuard {

    // --- Configuration & Constants ---
    uint256 public constant LISTING_FEE = 0.001 ether;
    uint256 public constant HOUSE_VIG_PERCENT = 2; // 2%
    uint256 public constant SLASH_RECYCLE_PERCENT = 10; // 10% of slashed funds go to community pool
    uint256 public constant DISPUTE_WINDOW = 24 hours;
    uint256 public constant CONFIDENCE_THRESHOLD = 80; // Out of 100. < 80 triggers Escrow.
    uint256 public constant CIRCUIT_BREAKER_WINDOW = 5 minutes;
    uint256 public constant CIRCUIT_BREAKER_ODDS_SWING = 50; 

    address public heistMaster; // The AI Oracle
    address public treasury;    // Where fees go
    address public communityPool; // Where recycled slashed funds go

    // --- State Variables ---
    uint256 public heistCount;
    bool public circuitBreakerActive;
    uint256 public lastCircuitCheck;
    
    // Identity Isolation: Simple tracking for now (in production, use a Graph)
    // mapping(address => mapping(address => bool)) public trustGraph; // Placeholder

    // Ethos Reputation Integration
    mapping(address => uint256) public credibilityScores; // Mock Cred Score

    // Betting Mappings: heistId => user => amount
    mapping(uint256 => mapping(address => uint256)) public betsP1;
    mapping(uint256 => mapping(address => uint256)) public betsP2;

    enum HeistStatus { CREATED, JUDGING, SETTLED, ESCROW, DISPUTED }
    enum Tier { UNTRUSTED, NEUTRAL, EXEMPLARY, REVERED }

    struct Heist {
        uint256 id;
        address player1; // Challenger
        address player2; // Daredevil
        uint256 bounty;  // Total ETH staked
        string dareType;
        HeistStatus status;
        address winner;
        string verdict;
        uint256 confidenceScore; // 0-100
        uint256 createdAt;
        uint256 disputeEndTime;
        address disputer;
        uint256 disputeStake;
        uint256 collateral; // Amount Daredevil must stake to join
        uint256 totalBetsP1;
        uint256 totalBetsP2;
    }

    mapping(uint256 => Heist) public heists;

    // --- Events ---
    event HeistCreated(uint256 indexed heistId, address indexed p1, address indexed p2, uint256 bounty, uint256 collateral, string dareType);
    event HeistJoined(uint256 indexed heistId, address indexed daredevil);
    event ProofSubmitted(uint256 indexed heistId, string proofUrl, address indexed submitter);
    event VerdictReported(uint256 indexed heistId, address indexed winner, string verdict, uint256 confidence);
    event DisputeStarted(uint256 indexed heistId, address indexed disputer);
    event HeistSettled(uint256 indexed heistId, address indexed winner, uint256 payout, string resolutionType);
    event BetPlaced(uint256 indexed heistId, address indexed better, bool supportP1, uint256 amount);
    event WinningsClaimed(uint256 indexed heistId, address indexed better, uint256 amount);

    // --- Modifiers ---
    modifier onlyHeistMaster() {
        require(msg.sender == heistMaster, "Not Heist Master");
        _;
    }

    modifier inStatus(uint256 _id, HeistStatus _status) {
        require(heists[_id].status == _status, "Invalid Status");
        _;
    }

    constructor(address _heistMaster, address _treasury, address _communityPool) Ownable(msg.sender) {
        heistMaster = _heistMaster;
        treasury = _treasury;
        communityPool = _communityPool;
    }

    // --- 1. Identity & Access Control ---

    function updateCredibility(address _user, uint256 _score) external onlyOwner {
        credibilityScores[_user] = _score;
    }

    function getTier(address _user) public view returns (Tier) {
        uint256 score = credibilityScores[_user];
        if (score < 800) return Tier.UNTRUSTED;
        if (score < 1600) return Tier.NEUTRAL;
        if (score < 2400) return Tier.EXEMPLARY;
        return Tier.REVERED;
    }

    // --- 2. Core Gameplay ---

    function createHeist(address _opponent, uint256 _collateral, string memory _dareType) external payable nonReentrant {
        require(msg.value >= LISTING_FEE, "Listing fee required");
        require(_opponent != msg.sender, "Self-daring forbidden");
        
        Tier p1Tier = getTier(msg.sender);
        require(p1Tier != Tier.UNTRUSTED, "Untrusted cannot create heists");

        // Take Listing Fee
        uint256 stake = msg.value - LISTING_FEE;
        (bool feeSent, ) = treasury.call{value: LISTING_FEE}("");
        require(feeSent, "Fee transfer failed");

        heistCount++;
        heists[heistCount] = Heist({
            id: heistCount,
            player1: msg.sender,
            player2: _opponent,
            bounty: stake,
            collateral: _collateral,
            dareType: _dareType,
            status: HeistStatus.CREATED,
            winner: address(0),
            verdict: "",
            confidenceScore: 0,
            createdAt: block.timestamp,
            disputeEndTime: 0,
            disputer: address(0),
            disputeStake: 0,
            totalBetsP1: 0,
            totalBetsP2: 0
        });

        emit HeistCreated(heistCount, msg.sender, _opponent, stake, _collateral, _dareType);
    }

    function submitProof(uint256 _heistId, string memory _proofUrl) external inStatus(_heistId, HeistStatus.CREATED) {
        Heist storage h = heists[_heistId];
        require(msg.sender == h.player1 || msg.sender == h.player2, "Not involved");
        
        h.status = HeistStatus.JUDGING;
        emit ProofSubmitted(_heistId, _proofUrl, msg.sender);
    }

    function joinHeist(uint256 _heistId) external payable inStatus(_heistId, HeistStatus.CREATED) {
        Heist storage h = heists[_heistId];
        require(h.player2 == address(0), "Heist already has an opponent");
        require(msg.sender != h.player1, "Cannot join your own heist");
        require(msg.value == h.collateral, "Must stake exact collateral amount");

        h.player2 = msg.sender;
        emit HeistJoined(_heistId, msg.sender);
    }

    // --- 3. The "Court of Appeals" (AI + Tiered Resolution) ---

    function reportVerdict(
        uint256 _heistId, 
        address _winner, 
        string memory _verdict, 
        uint256 _confidence
    ) external onlyHeistMaster inStatus(_heistId, HeistStatus.JUDGING) {
        Heist storage h = heists[_heistId];
        
        h.winner = _winner;
        h.verdict = _verdict;
        h.confidenceScore = _confidence;

        if (_confidence < CONFIDENCE_THRESHOLD) {
            h.status = HeistStatus.ESCROW;
            h.disputeEndTime = block.timestamp + DISPUTE_WINDOW;
            emit VerdictReported(_heistId, _winner, _verdict, _confidence); // Emits but waits in Escrow
        } else {
            _finalizeHeist(_heistId, _winner, "AI_INSTANT");
        }
    }

    function disputeVerdict(uint256 _heistId) external payable inStatus(_heistId, HeistStatus.ESCROW) nonReentrant {
        Heist storage h = heists[_heistId];
        require(block.timestamp < h.disputeEndTime, "Dispute window closed");
        require(msg.value >= 0.05 ether, "Dispute bond required"); // Fixed bond for now

        h.status = HeistStatus.DISPUTED;
        h.disputer = msg.sender;
        h.disputeStake = msg.value;

        emit DisputeStarted(_heistId, msg.sender);
    }

    function resolveDispute(uint256 _heistId, address _finalWinner) external onlyOwner inStatus(_heistId, HeistStatus.DISPUTED) {
         _finalizeHeist(_heistId, _finalWinner, "JURY_RULING");
    }

    function claimUndisputed(uint256 _heistId) external inStatus(_heistId, HeistStatus.ESCROW) {
        Heist storage h = heists[_heistId];
        require(block.timestamp >= h.disputeEndTime, "Still in dispute window");
        
        _finalizeHeist(_heistId, h.winner, "AI_DEFAULT");
    }

    // --- 4. Side Betting Logic ---

    function placeBet(uint256 _heistId, bool _supportP1) external payable nonReentrant inStatus(_heistId, HeistStatus.CREATED) {
        require(msg.value > 0, "Bet must be > 0");
        Heist storage h = heists[_heistId];

        if (_supportP1) {
            betsP1[_heistId][msg.sender] += msg.value;
            h.totalBetsP1 += msg.value;
        } else {
            betsP2[_heistId][msg.sender] += msg.value;
            h.totalBetsP2 += msg.value;
        }

        emit BetPlaced(_heistId, msg.sender, _supportP1, msg.value);
    }

    function claimBetWinnings(uint256 _heistId) external nonReentrant {
        Heist storage h = heists[_heistId];
        require(h.status == HeistStatus.SETTLED, "Heist not settled");
        
        uint256 userBet = 0;
        uint256 winningPool = 0;
        uint256 losingPool = 0;

        bool p1Won = (h.winner == h.player1);
        
        if (p1Won) {
            userBet = betsP1[_heistId][msg.sender];
            winningPool = h.totalBetsP1;
            losingPool = h.totalBetsP2;
            betsP1[_heistId][msg.sender] = 0; // Prevent Re-entrancy/Double Claim
        } else {
            userBet = betsP2[_heistId][msg.sender];
            winningPool = h.totalBetsP2;
            losingPool = h.totalBetsP1;
            betsP2[_heistId][msg.sender] = 0;
        }

        require(userBet > 0, "No winning bet found");

        // Logic: Return Stake + Share of Losers
        // Share = (UserBet / WinningPool) * LosingPool
        uint256 profit = (userBet * losingPool) / winningPool;
        uint256 totalPayout = userBet + profit;

        payable(msg.sender).transfer(totalPayout);
        emit WinningsClaimed(_heistId, msg.sender, totalPayout);
    }

    // --- Internal Settlement Logic ---

    function _finalizeHeist(uint256 _heistId, address _winner, string memory _resolutionType) internal {
        Heist storage h = heists[_heistId];
        h.status = HeistStatus.SETTLED;
        h.winner = _winner;

        uint256 totalPot = h.bounty;
        
        // Handle Disputer Stake
        if (h.disputeStake > 0) {
            if (_winner != h.winner) { // AI was wrong, disputer was right 
               payable(h.disputer).transfer(h.disputeStake); 
            } else {
                payable(communityPool).transfer(h.disputeStake);
            }
        }

        // Calculate House Vig on MAIN BOUNTY ONLY (Bets are P2P)
        uint256 vig = (totalPot * HOUSE_VIG_PERCENT) / 100;
        uint256 payout = totalPot - vig;

        // Apply Ethos Yield Multiplier 
        Tier winnerTier = getTier(_winner);
        if (winnerTier == Tier.EXEMPLARY || winnerTier == Tier.REVERED) {
             uint256 discount = vig / 2;
             vig -= discount;
             payout += discount;
        }

        // Distribute Bounty
        payable(treasury).transfer(vig);
        
        // Payout = Bounty (minus vig) + Collateral (from P2)
        // If P1 wins: Returns Bounty + Gets P2 Collateral
        // If P2 wins: Gets Bounty + Returns P2 Collateral
        uint256 finalPayout = payout + h.collateral; 
        
        payable(_winner).transfer(finalPayout);

        emit HeistSettled(_heistId, _winner, payout, _resolutionType);
    }

    // --- Admin ---
    function setHeistMaster(address _newMaster) external onlyOwner {
        heistMaster = _newMaster;
    }
}
