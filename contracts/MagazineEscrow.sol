// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MagazineEscrow
 * @notice Escrow contract for magazine submission payments
 * @dev Holds funds for a magazine issue and releases payments when submissions are approved
 * 
 * Key Features:
 * - Founder deposits funds for bounties
 * - Editors (or founder alone for MVP) vote to approve submissions
 * - Payments auto-release when approved
 * - Founder can withdraw unused funds after deadline
 * 
 * Database Integration:
 * - Maps to `issues` table via issueId
 * - Maps to `submissions` table via submissionId
 * - Maps to `payments` table for payment records
 */
contract MagazineEscrow {
    
    // ============ State Variables ============
    
    /// @notice Magazine founder who created this escrow
    address public founder;
    
    /// @notice Magazine ID from database
    string public magazineId;
    
    /// @notice Issue ID from database
    string public issueId;
    
    /// @notice Deadline timestamp - after this, founder can withdraw unused funds
    uint256 public deadline;
    
    /// @notice Total funds deposited
    uint256 public totalDeposited;
    
    /// @notice Total funds paid out
    uint256 public totalPaidOut;
    
    /// @notice Minimum votes required to approve a payment (1 for MVP with solo founder)
    uint256 public minVotesRequired;
    
    /// @notice List of authorized editors who can vote
    mapping(address => bool) public isEditor;
    
    /// @notice Total number of editors
    uint256 public editorCount;
    
    /// @notice Tracks if a submission has been paid
    mapping(string => bool) public submissionPaid;
    
    /// @notice Tracks votes for each submission: submissionId => editor => hasVoted
    mapping(string => mapping(address => bool)) public hasVoted;
    
    /// @notice Tracks vote count for each submission
    mapping(string => uint256) public voteCount;
    
    /// @notice Tracks payment amount for each submission
    mapping(string => uint256) public submissionBounty;
    
    /// @notice Tracks recipient for each submission
    mapping(string => address) public submissionRecipient;
    
    // ============ Events ============
    
    event FundsDeposited(address indexed depositor, uint256 amount, uint256 newTotal);
    event EditorAdded(address indexed editor);
    event EditorRemoved(address indexed editor);
    event SubmissionRegistered(string indexed submissionId, address indexed recipient, uint256 bounty);
    event VoteCast(string indexed submissionId, address indexed editor, uint256 newVoteCount);
    event PaymentReleased(string indexed submissionId, address indexed recipient, uint256 amount);
    event FundsWithdrawn(address indexed founder, uint256 amount);
    
    // ============ Errors ============
    
    error OnlyFounder();
    error OnlyEditor();
    error DeadlineNotPassed();
    error DeadlinePassed();
    error InsufficientBalance();
    error AlreadyPaid();
    error AlreadyVoted();
    error SubmissionNotRegistered();
    error InvalidAddress();
    error InvalidAmount();
    error TransferFailed();
    
    // ============ Modifiers ============
    
    modifier onlyFounder() {
        if (msg.sender != founder) revert OnlyFounder();
        _;
    }
    
    modifier onlyEditor() {
        if (!isEditor[msg.sender]) revert OnlyEditor();
        _;
    }
    
    modifier beforeDeadline() {
        if (block.timestamp >= deadline) revert DeadlinePassed();
        _;
    }
    
    modifier afterDeadline() {
        if (block.timestamp < deadline) revert DeadlineNotPassed();
        _;
    }
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize the escrow contract
     * @param _magazineId Magazine ID from database
     * @param _issueId Issue ID from database
     * @param _deadline Unix timestamp for submission deadline
     * @param _minVotesRequired Minimum votes needed (1 for solo founder)
     */
    constructor(
        string memory _magazineId,
        string memory _issueId,
        uint256 _deadline,
        uint256 _minVotesRequired
    ) {
        founder = msg.sender;
        magazineId = _magazineId;
        issueId = _issueId;
        deadline = _deadline;
        minVotesRequired = _minVotesRequired;
        
        // Founder is automatically an editor
        isEditor[msg.sender] = true;
        editorCount = 1;
        
        emit EditorAdded(msg.sender);
    }
    
    // ============ Deposit Functions ============
    
    /**
     * @notice Deposit funds into escrow (payable function for ETH/native token)
     * @dev Founder can deposit multiple times before deadline
     */
    function deposit() external payable onlyFounder beforeDeadline {
        if (msg.value == 0) revert InvalidAmount();
        
        totalDeposited += msg.value;
        emit FundsDeposited(msg.sender, msg.value, totalDeposited);
    }
    
    /**
     * @notice Get available balance (deposited - paid out)
     */
    function availableBalance() public view returns (uint256) {
        return totalDeposited - totalPaidOut;
    }
    
    // ============ Editor Management ============
    
    /**
     * @notice Add an editor who can vote on submissions
     * @param editor Address of editor to add
     */
    function addEditor(address editor) external onlyFounder {
        if (editor == address(0)) revert InvalidAddress();
        if (isEditor[editor]) return; // Already an editor
        
        isEditor[editor] = true;
        editorCount++;
        
        emit EditorAdded(editor);
    }
    
    /**
     * @notice Remove an editor (cannot remove founder)
     * @param editor Address of editor to remove
     */
    function removeEditor(address editor) external onlyFounder {
        if (editor == founder) revert OnlyFounder(); // Cannot remove founder
        if (!isEditor[editor]) return; // Not an editor
        
        isEditor[editor] = false;
        editorCount--;
        
        emit EditorRemoved(editor);
    }
    
    // ============ Submission Management ============
    
    /**
     * @notice Register a submission for payment
     * @param submissionId Submission ID from database
     * @param recipient Address to receive payment
     * @param bounty Amount to pay for this submission
     */
    function registerSubmission(
        string memory submissionId,
        address recipient,
        uint256 bounty
    ) external onlyFounder beforeDeadline {
        if (recipient == address(0)) revert InvalidAddress();
        if (bounty == 0) revert InvalidAmount();
        if (submissionRecipient[submissionId] != address(0)) revert AlreadyPaid(); // Already registered
        
        submissionRecipient[submissionId] = recipient;
        submissionBounty[submissionId] = bounty;
        
        emit SubmissionRegistered(submissionId, recipient, bounty);
    }
    
    // ============ Voting & Payment Functions ============
    
    /**
     * @notice Vote to approve a submission
     * @param submissionId Submission ID from database
     * @dev When votes reach threshold, payment auto-releases
     */
    function voteApprove(string memory submissionId) external onlyEditor beforeDeadline {
        if (submissionRecipient[submissionId] == address(0)) revert SubmissionNotRegistered();
        if (submissionPaid[submissionId]) revert AlreadyPaid();
        if (hasVoted[submissionId][msg.sender]) revert AlreadyVoted();
        
        // Record vote
        hasVoted[submissionId][msg.sender] = true;
        voteCount[submissionId]++;
        
        emit VoteCast(submissionId, msg.sender, voteCount[submissionId]);
        
        // Check if we have enough votes to release payment
        if (voteCount[submissionId] >= minVotesRequired) {
            _releasePayment(submissionId);
        }
    }
    
    /**
     * @notice Internal function to release payment
     * @param submissionId Submission ID to pay
     */
    function _releasePayment(string memory submissionId) internal {
        uint256 amount = submissionBounty[submissionId];
        address recipient = submissionRecipient[submissionId];
        
        if (availableBalance() < amount) revert InsufficientBalance();
        
        submissionPaid[submissionId] = true;
        totalPaidOut += amount;
        
        // Transfer funds
        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit PaymentReleased(submissionId, recipient, amount);
    }
    
    // ============ Withdrawal Functions ============
    
    /**
     * @notice Founder can withdraw unused funds after deadline
     */
    function withdrawUnused() external onlyFounder afterDeadline {
        uint256 amount = availableBalance();
        if (amount == 0) revert InsufficientBalance();
        
        totalPaidOut += amount; // Mark as "paid out" to prevent re-withdrawal
        
        (bool success, ) = founder.call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit FundsWithdrawn(founder, amount);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Check if a submission has been paid
     */
    function isSubmissionPaid(string memory submissionId) external view returns (bool) {
        return submissionPaid[submissionId];
    }
    
    /**
     * @notice Get vote count for a submission
     */
    function getVoteCount(string memory submissionId) external view returns (uint256) {
        return voteCount[submissionId];
    }
    
    /**
     * @notice Check if an address has voted for a submission
     */
    function hasEditorVoted(string memory submissionId, address editor) external view returns (bool) {
        return hasVoted[submissionId][editor];
    }
    
    /**
     * @notice Get submission details
     */
    function getSubmissionDetails(string memory submissionId) external view returns (
        address recipient,
        uint256 bounty,
        uint256 votes,
        bool paid
    ) {
        return (
            submissionRecipient[submissionId],
            submissionBounty[submissionId],
            voteCount[submissionId],
            submissionPaid[submissionId]
        );
    }
    
    /**
     * @notice Get contract summary
     */
    function getContractSummary() external view returns (
        address _founder,
        uint256 _totalDeposited,
        uint256 _totalPaidOut,
        uint256 _availableBalance,
        uint256 _deadline,
        uint256 _editorCount,
        uint256 _minVotesRequired
    ) {
        return (
            founder,
            totalDeposited,
            totalPaidOut,
            availableBalance(),
            deadline,
            editorCount,
            minVotesRequired
        );
    }
}

