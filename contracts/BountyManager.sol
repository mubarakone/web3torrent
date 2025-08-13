// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LicenseRegistry.sol";

/**
 * @title BountyManager
 * @dev Contract for managing bounty submissions and rewards for copyright enforcement
 */
contract BountyManager {
    
    struct BountySubmission {
        uint256 submissionId;
        address hunter;
        uint256 contentId;
        string platform;
        string platformContentId;
        string contentUrl;
        bytes zkTLSProof;
        uint256 submissionTimestamp;
        BountyStatus status;
        string rejectionReason;
        uint256 rewardAmount;
    }
    
    enum BountyStatus {
        Pending,
        Verified,
        Rejected,
        Rewarded
    }
    
    // State variables
    address public coreContract;
    LicenseRegistry public licenseRegistry;
    uint256 public submissionCounter;
    uint256 public verificationPeriod = 7 days;
    uint256 public minimumStake = 0.01 ether;
    
    // Bounty pools per content
    mapping(uint256 => uint256) public bountyPools; // contentId => pool amount
    mapping(uint256 => uint256) public totalVerifiedTakedowns; // contentId => count
    
    // Submissions tracking
    mapping(uint256 => BountySubmission) public submissions; // submissionId => BountySubmission
    mapping(uint256 => uint256[]) public contentSubmissions; // contentId => submissionIds[]
    mapping(address => uint256[]) public hunterSubmissions; // hunter => submissionIds[]
    mapping(address => uint256) public hunterStats; // hunter => verified takedowns count
    mapping(address => uint256) public hunterEarnings; // hunter => total earnings
    
    // Verification
    mapping(address => bool) public verifiers; // Authorized verifiers
    mapping(uint256 => mapping(address => bool)) public submissionVotes; // submissionId => verifier => voted
    mapping(uint256 => uint256) public verificationVotes; // submissionId => positive votes
    mapping(uint256 => uint256) public rejectionVotes; // submissionId => negative votes
    
    // Events
    event BountySubmitted(
        uint256 indexed submissionId,
        uint256 indexed contentId,
        address indexed hunter,
        string platform,
        string platformContentId
    );
    
    event BountyVerified(
        uint256 indexed submissionId,
        address indexed verifier,
        bool approved
    );
    
    event BountyRewarded(
        uint256 indexed submissionId,
        address indexed hunter,
        uint256 rewardAmount
    );
    
    event BountyPoolFunded(
        uint256 indexed contentId,
        uint256 amount,
        uint256 totalPool
    );
    
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);
    
    // Modifiers
    modifier onlyCore() {
        require(msg.sender == coreContract, "Only core contract can call");
        _;
    }
    
    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Not authorized verifier");
        _;
    }
    
    modifier validSubmission(uint256 submissionId) {
        require(submissionId > 0 && submissionId <= submissionCounter, "Invalid submission");
        _;
    }
    
    constructor(address _coreContract, address _licenseRegistry) {
        coreContract = _coreContract;
        licenseRegistry = LicenseRegistry(_licenseRegistry);
        submissionCounter = 0;
        
        // Add deployer as initial verifier
        verifiers[msg.sender] = true;
    }
    
    /**
     * @dev Add funds to bounty pool (called by core contract)
     */
    function addToBountyPool(uint256 contentId) external payable onlyCore {
        require(msg.value > 0, "Must send ETH");
        
        bountyPools[contentId] += msg.value;
        
        emit BountyPoolFunded(contentId, msg.value, bountyPools[contentId]);
    }
    
    /**
     * @dev Submit bounty for unauthorized content
     */
    function submitBounty(
        uint256 contentId,
        string calldata platform,
        string calldata platformContentId,
        string calldata contentUrl,
        bytes calldata zkTLSProof
    ) external payable returns (uint256) {
        require(msg.value >= minimumStake, "Insufficient stake");
        require(bountyPools[contentId] > 0, "No bounty pool for content");
        require(zkTLSProof.length > 0, "zkTLS proof required");
        
        // Check if content is already registered by licensed distributor
        (bool isRegistered, ) = licenseRegistry.isContentRegisteredOnPlatform(
            contentId,
            platform,
            platformContentId
        );
        require(!isRegistered, "Content is legitimately registered");
        
        submissionCounter++;
        uint256 submissionId = submissionCounter;
        
        BountySubmission storage submission = submissions[submissionId];
        submission.submissionId = submissionId;
        submission.hunter = msg.sender;
        submission.contentId = contentId;
        submission.platform = platform;
        submission.platformContentId = platformContentId;
        submission.contentUrl = contentUrl;
        submission.zkTLSProof = zkTLSProof;
        submission.submissionTimestamp = block.timestamp;
        submission.status = BountyStatus.Pending;
        
        // Add to tracking arrays
        contentSubmissions[contentId].push(submissionId);
        hunterSubmissions[msg.sender].push(submissionId);
        
        emit BountySubmitted(
            submissionId,
            contentId,
            msg.sender,
            platform,
            platformContentId
        );
        
        return submissionId;
    }
    
    /**
     * @dev Verify bounty submission (verifiers only)
     */
    function verifyBounty(
        uint256 submissionId,
        bool approved,
        string calldata reason
    ) external onlyVerifier validSubmission(submissionId) {
        require(!submissionVotes[submissionId][msg.sender], "Already voted");
        require(
            submissions[submissionId].status == BountyStatus.Pending,
            "Submission not pending"
        );
        
        submissionVotes[submissionId][msg.sender] = true;
        
        if (approved) {
            verificationVotes[submissionId]++;
        } else {
            rejectionVotes[submissionId]++;
            if (bytes(reason).length > 0) {
                submissions[submissionId].rejectionReason = reason;
            }
        }
        
        emit BountyVerified(submissionId, msg.sender, approved);
        
        // Check if we have enough votes to finalize
        _checkFinalization(submissionId);
    }
    
    /**
     * @dev Internal function to check if submission can be finalized
     */
    function _checkFinalization(uint256 submissionId) internal {
        uint256 totalVerifiers = _getVerifierCount();
        uint256 requiredVotes = (totalVerifiers / 2) + 1;
        
        if (verificationVotes[submissionId] >= requiredVotes) {
            _approveSubmission(submissionId);
        } else if (rejectionVotes[submissionId] >= requiredVotes) {
            _rejectSubmission(submissionId);
        }
    }
    
    /**
     * @dev Approve and reward bounty submission
     */
    function _approveSubmission(uint256 submissionId) internal {
        BountySubmission storage submission = submissions[submissionId];
        uint256 contentId = submission.contentId;
        
        submission.status = BountyStatus.Verified;
        totalVerifiedTakedowns[contentId]++;
        hunterStats[submission.hunter]++;
        
        // Calculate reward (will be distributed later)
        submission.rewardAmount = _calculateReward(contentId, submission.hunter);
        
        // Refund stake
        payable(submission.hunter).transfer(minimumStake);
    }
    
    /**
     * @dev Reject bounty submission
     */
    function _rejectSubmission(uint256 submissionId) internal {
        submissions[submissionId].status = BountyStatus.Rejected;
        // Stake is forfeited for rejected submissions
    }
    
    /**
     * @dev Calculate reward for hunter based on their contribution
     */
    function _calculateReward(uint256 contentId, address hunter) internal view returns (uint256) {
        uint256 totalPool = bountyPools[contentId];
        uint256 totalTakedowns = totalVerifiedTakedowns[contentId];
        
        if (totalTakedowns == 0) return 0;
        
        // Base reward is equal share
        uint256 baseReward = totalPool / totalTakedowns;
        
        // Bonus for active hunters (those with more verified takedowns)
        uint256 hunterTakedowns = hunterStats[hunter];
        uint256 bonusMultiplier = (hunterTakedowns * 100) / totalTakedowns; // Max 100% bonus
        uint256 bonus = (baseReward * bonusMultiplier) / 100;
        
        return baseReward + bonus;
    }
    
    /**
     * @dev Distribute rewards to verified bounty hunters
     */
    function distributeRewards(uint256 contentId) external {
        require(bountyPools[contentId] > 0, "No bounty pool");
        
        uint256[] memory contentSubs = contentSubmissions[contentId];
        uint256 totalDistributed = 0;
        
        for (uint i = 0; i < contentSubs.length; i++) {
            BountySubmission storage submission = submissions[contentSubs[i]];
            
            if (submission.status == BountyStatus.Verified && submission.rewardAmount > 0) {
                uint256 reward = submission.rewardAmount;
                
                if (bountyPools[contentId] >= reward) {
                    bountyPools[contentId] -= reward;
                    hunterEarnings[submission.hunter] += reward;
                    totalDistributed += reward;
                    
                    submission.status = BountyStatus.Rewarded;
                    payable(submission.hunter).transfer(reward);
                    
                    emit BountyRewarded(submission.submissionId, submission.hunter, reward);
                }
            }
        }
    }
    
    /**
     * @dev Get submission details
     */
    function getSubmission(uint256 submissionId) 
        external 
        view 
        validSubmission(submissionId) 
        returns (BountySubmission memory) 
    {
        return submissions[submissionId];
    }
    
    /**
     * @dev Get submissions for content
     */
    function getContentSubmissions(uint256 contentId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return contentSubmissions[contentId];
    }
    
    /**
     * @dev Get hunter submissions
     */
    function getHunterSubmissions(address hunter) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return hunterSubmissions[hunter];
    }
    
    /**
     * @dev Get hunter statistics
     */
    function getHunterStats(address hunter) 
        external 
        view 
        returns (uint256 verifiedTakedowns, uint256 totalEarnings) 
    {
        return (hunterStats[hunter], hunterEarnings[hunter]);
    }
    
    /**
     * @dev Add verifier (owner only)
     */
    function addVerifier(address verifier) external onlyCore {
        verifiers[verifier] = true;
        emit VerifierAdded(verifier);
    }
    
    /**
     * @dev Remove verifier (owner only)
     */
    function removeVerifier(address verifier) external onlyCore {
        verifiers[verifier] = false;
        emit VerifierRemoved(verifier);
    }
    
    /**
     * @dev Update verification period
     */
    function updateVerificationPeriod(uint256 newPeriod) external onlyCore {
        verificationPeriod = newPeriod;
    }
    
    /**
     * @dev Update minimum stake
     */
    function updateMinimumStake(uint256 newStake) external onlyCore {
        minimumStake = newStake;
    }
    
    /**
     * @dev Get total number of verifiers
     */
    function _getVerifierCount() internal pure returns (uint256) {
        // Return a fixed number of required verifiers for now
        // In production, this could be configurable
        return 3;
    }
    
    /**
     * @dev Emergency withdrawal (owner only)
     */
    function emergencyWithdraw(uint256 contentId, uint256 amount) external onlyCore {
        require(bountyPools[contentId] >= amount, "Insufficient pool balance");
        bountyPools[contentId] -= amount;
        payable(msg.sender).transfer(amount);
    }
} 