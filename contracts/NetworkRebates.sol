// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LicenseRegistry.sol";

/**
 * @title NetworkRebates
 * @dev Contract for managing P2P network rebates for distributors who seed content
 */
contract NetworkRebates {
    
    struct SeedingActivity {
        address distributor;
        uint256 contentId;
        uint256 totalUploaded; // bytes uploaded
        uint256 uniquePeersServed;
        uint256 lastReportTimestamp;
        uint256 totalEarnings;
        bool isActive;
    }
    
    struct RebatePool {
        uint256 totalPool;
        uint256 distributedAmount;
        uint256 totalSeeders;
        uint256 totalUploadedBytes;
        mapping(address => SeedingActivity) seeders;
        address[] seederList;
    }
    
    // State variables
    address public coreContract;
    LicenseRegistry public licenseRegistry;
    uint256 public reportingPeriod = 1 hours;
    uint256 public minimumUploadThreshold = 1024 * 1024; // 1MB minimum
    
    // Rebate pools per content
    mapping(uint256 => RebatePool) public rebatePools;
    
    // Distributor tracking
    mapping(address => uint256[]) public distributorContent; // distributor => contentIds[]
    mapping(address => uint256) public distributorTotalEarnings;
    
    // Oracle system for upload reporting
    mapping(address => bool) public authorizedOracles;
    mapping(bytes32 => bool) public processedReports; // reportHash => processed
    
    // Events
    event RebatePoolFunded(
        uint256 indexed contentId,
        uint256 amount,
        uint256 totalPool
    );
    
    event SeedingReported(
        uint256 indexed contentId,
        address indexed distributor,
        uint256 uploadedBytes,
        uint256 uniquePeers,
        uint256 timestamp
    );
    
    event RebateDistributed(
        uint256 indexed contentId,
        address indexed distributor,
        uint256 amount
    );
    
    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);
    
    // Modifiers
    modifier onlyCore() {
        require(msg.sender == coreContract, "Only core contract can call");
        _;
    }
    
    modifier onlyOracle() {
        require(authorizedOracles[msg.sender], "Not authorized oracle");
        _;
    }
    
    modifier onlyLicensedDistributor(uint256 contentId) {
        require(
            licenseRegistry.hasValidLicense(contentId, msg.sender),
            "Not a licensed distributor"
        );
        _;
    }
    
    constructor(address _coreContract, address _licenseRegistry) {
        coreContract = _coreContract;
        licenseRegistry = LicenseRegistry(_licenseRegistry);
        
        // Add deployer as initial oracle
        authorizedOracles[msg.sender] = true;
    }
    
    /**
     * @dev Add funds to rebate pool (called by core contract)
     */
    function addToRebatePool(uint256 contentId) external payable onlyCore {
        require(msg.value > 0, "Must send ETH");
        
        rebatePools[contentId].totalPool += msg.value;
        
        emit RebatePoolFunded(contentId, msg.value, rebatePools[contentId].totalPool);
    }
    
    /**
     * @dev Report seeding activity (oracle or self-reporting)
     */
    function reportSeedingActivity(
        uint256 contentId,
        address distributor,
        uint256 uploadedBytes,
        uint256 uniquePeersServed,
        bytes32 reportHash
    ) external {
        require(
            authorizedOracles[msg.sender] || msg.sender == distributor,
            "Not authorized to report"
        );
        require(!processedReports[reportHash], "Report already processed");
        require(
            licenseRegistry.hasValidLicense(contentId, distributor),
            "Distributor not licensed"
        );
        require(uploadedBytes >= minimumUploadThreshold, "Below minimum threshold");
        
        processedReports[reportHash] = true;
        
        RebatePool storage pool = rebatePools[contentId];
        SeedingActivity storage activity = pool.seeders[distributor];
        
        // Initialize if first time
        if (activity.distributor == address(0)) {
            activity.distributor = distributor;
            activity.contentId = contentId;
            activity.isActive = true;
            pool.seederList.push(distributor);
            pool.totalSeeders++;
            
            // Add to distributor tracking
            distributorContent[distributor].push(contentId);
        }
        
        // Update activity
        activity.totalUploaded += uploadedBytes;
        activity.uniquePeersServed = uniquePeersServed; // Latest count
        activity.lastReportTimestamp = block.timestamp;
        
        // Update pool totals
        pool.totalUploadedBytes += uploadedBytes;
        
        emit SeedingReported(
            contentId,
            distributor,
            uploadedBytes,
            uniquePeersServed,
            block.timestamp
        );
    }
    
    /**
     * @dev Calculate rebate for distributor based on contribution
     */
    function calculateRebate(uint256 contentId, address distributor) 
        public 
        view 
        returns (uint256) 
    {
        RebatePool storage pool = rebatePools[contentId];
        SeedingActivity storage activity = pool.seeders[distributor];
        
        if (!activity.isActive || pool.totalUploadedBytes == 0) {
            return 0;
        }
        
        // Calculate share based on uploaded bytes and peer diversity
        uint256 uploadShare = (activity.totalUploaded * 7000) / pool.totalUploadedBytes; // 70% weight
        uint256 peerShare = (activity.uniquePeersServed * 3000) / _getTotalUniquePeers(contentId); // 30% weight
        
        uint256 totalShare = uploadShare + peerShare;
        if (totalShare > 10000) totalShare = 10000; // Cap at 100%
        
        uint256 availablePool = pool.totalPool - pool.distributedAmount;
        return (availablePool * totalShare) / 10000;
    }
    
    /**
     * @dev Distribute rebates to all active seeders for content
     */
    function distributeRebates(uint256 contentId) external {
        RebatePool storage pool = rebatePools[contentId];
        require(pool.totalPool > pool.distributedAmount, "No funds to distribute");
        
        uint256 totalDistributed = 0;
        
        for (uint i = 0; i < pool.seederList.length; i++) {
            address distributor = pool.seederList[i];
            SeedingActivity storage activity = pool.seeders[distributor];
            
            if (activity.isActive) {
                uint256 rebate = calculateRebate(contentId, distributor);
                
                if (rebate > 0 && pool.totalPool >= pool.distributedAmount + rebate) {
                    activity.totalEarnings += rebate;
                    distributorTotalEarnings[distributor] += rebate;
                    pool.distributedAmount += rebate;
                    totalDistributed += rebate;
                    
                    payable(distributor).transfer(rebate);
                    
                    emit RebateDistributed(contentId, distributor, rebate);
                }
            }
        }
    }
    
    /**
     * @dev Claim individual rebate
     */
    function claimRebate(uint256 contentId) external onlyLicensedDistributor(contentId) {
        uint256 rebate = calculateRebate(contentId, msg.sender);
        require(rebate > 0, "No rebate available");
        
        RebatePool storage pool = rebatePools[contentId];
        SeedingActivity storage activity = pool.seeders[msg.sender];
        
        require(pool.totalPool >= pool.distributedAmount + rebate, "Insufficient pool funds");
        
        activity.totalEarnings += rebate;
        distributorTotalEarnings[msg.sender] += rebate;
        pool.distributedAmount += rebate;
        
        payable(msg.sender).transfer(rebate);
        
        emit RebateDistributed(contentId, msg.sender, rebate);
    }
    
    /**
     * @dev Get seeding activity for distributor
     */
    function getSeedingActivity(uint256 contentId, address distributor) 
        external 
        view 
        returns (SeedingActivity memory) 
    {
        return rebatePools[contentId].seeders[distributor];
    }
    
    /**
     * @dev Get rebate pool information
     */
    function getRebatePoolInfo(uint256 contentId) 
        external 
        view 
        returns (
            uint256 totalPool,
            uint256 distributedAmount,
            uint256 totalSeeders,
            uint256 totalUploadedBytes,
            address[] memory seederList
        ) 
    {
        RebatePool storage pool = rebatePools[contentId];
        return (
            pool.totalPool,
            pool.distributedAmount,
            pool.totalSeeders,
            pool.totalUploadedBytes,
            pool.seederList
        );
    }
    
    /**
     * @dev Get distributor's content list
     */
    function getDistributorContent(address distributor) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return distributorContent[distributor];
    }
    
    /**
     * @dev Get distributor's total earnings
     */
    function getDistributorEarnings(address distributor) 
        external 
        view 
        returns (uint256) 
    {
        return distributorTotalEarnings[distributor];
    }
    
    /**
     * @dev Calculate total unique peers across all seeders (internal helper)
     */
    function _getTotalUniquePeers(uint256 contentId) internal view returns (uint256) {
        RebatePool storage pool = rebatePools[contentId];
        uint256 totalPeers = 0;
        
        for (uint i = 0; i < pool.seederList.length; i++) {
            SeedingActivity storage activity = pool.seeders[pool.seederList[i]];
            if (activity.isActive) {
                totalPeers += activity.uniquePeersServed;
            }
        }
        
        return totalPeers > 0 ? totalPeers : 1; // Avoid division by zero
    }
    
    /**
     * @dev Add authorized oracle
     */
    function addOracle(address oracle) external onlyCore {
        authorizedOracles[oracle] = true;
        emit OracleAdded(oracle);
    }
    
    /**
     * @dev Remove authorized oracle
     */
    function removeOracle(address oracle) external onlyCore {
        authorizedOracles[oracle] = false;
        emit OracleRemoved(oracle);
    }
    
    /**
     * @dev Update reporting period
     */
    function updateReportingPeriod(uint256 newPeriod) external onlyCore {
        reportingPeriod = newPeriod;
    }
    
    /**
     * @dev Update minimum upload threshold
     */
    function updateMinimumUploadThreshold(uint256 newThreshold) external onlyCore {
        minimumUploadThreshold = newThreshold;
    }
    
    /**
     * @dev Deactivate seeder (for inactive distributors)
     */
    function deactivateSeeder(uint256 contentId, address distributor) external onlyCore {
        rebatePools[contentId].seeders[distributor].isActive = false;
    }
    
    /**
     * @dev Emergency withdrawal (owner only)
     */
    function emergencyWithdraw(uint256 contentId, uint256 amount) external onlyCore {
        RebatePool storage pool = rebatePools[contentId];
        uint256 availableAmount = pool.totalPool - pool.distributedAmount;
        require(availableAmount >= amount, "Insufficient available funds");
        
        pool.distributedAmount += amount;
        payable(msg.sender).transfer(amount);
    }
} 