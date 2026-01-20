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
        string dareType;
        HeistStatus status;
        address winner;
        string verdict;      // "Balls: 10/10. You Cooked."
        uint256 createdAt;
    }

    enum HeistStatus { CREATED, JUDGING, SETTLED }

    mapping(uint256 => Heist) public heists;

    // --- Events ---
    event HeistCreated(uint256 indexed heistId, address indexed p1, address indexed p2, uint256 bounty, string dareType);
    event ProofSubmitted(uint256 indexed heistId, string proofUrl, address indexed submitter);
    event HeistSettled(uint256 indexed heistId, address indexed winner, string verdict, uint256 payout);

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
     * @dev Msg.value determines the bounty pool. For V1, creator puts up the whole bounty to incentivize joining.
     */
    function createHeist(address _opponent, string memory _dareType) external payable {
        require(msg.value > 0, "Stakes must be > 0");
        require(_opponent != address(0) && _opponent != msg.sender, "Invalid Opponent");

        heistCount++;
        uint256 newId = heistCount;

        heists[newId] = Heist({
            id: newId,
            player1: msg.sender,
            player2: _opponent,
            bounty: msg.value,
            dareType: _dareType,
            status: HeistStatus.CREATED,
            winner: address(0),
            verdict: "",
            createdAt: block.timestamp
        });

        emit HeistCreated(newId, msg.sender, _opponent, msg.value, _dareType);
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
        uint256 payout = heist.bounty;
        // In a real version, we might take a fee here. For hackathon -> 100% to winner.
        (bool sent, ) = _winner.call{value: payout}("");
        require(sent, "Failed to send Bounty");

        emit HeistSettled(_heistId, _winner, _verdict, payout);
    }

    // --- Admin (Hackathon Safety) ---
    function setHeistMaster(address _newMaster) external onlyHeistMaster {
        heistMaster = _newMaster;
    }
}
