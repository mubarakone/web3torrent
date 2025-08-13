// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Web3TorrentCore.sol";
import "./LicenseRegistry.sol";
import "./BountyManager.sol";
import "./NetworkRebates.sol";

/**
 * @title Web3TorrentFactory
 * @dev Minimal factory for deploying Web3Torrent system
 */
contract Web3TorrentFactory {
    address public owner;
    uint256 public deploymentCounter;
    
    mapping(uint256 => address) public coreContracts;
    mapping(address => uint256[]) public userDeployments;
    
    event SystemDeployed(uint256 indexed deploymentId, address indexed deployer, address coreContract);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Deploy Web3Torrent system
     */
    function deploySystem() external returns (uint256) {
        deploymentCounter++;
        uint256 deploymentId = deploymentCounter;
        
        // Deploy core first
        Web3TorrentCore core = new Web3TorrentCore();
        
        // Deploy supporting contracts
        LicenseRegistry registry = new LicenseRegistry(address(core));
        BountyManager bounty = new BountyManager(address(core), address(registry));
        NetworkRebates rebates = new NetworkRebates(address(core), address(registry));
        
        // Initialize
        core.initialize(address(registry), address(bounty), address(rebates));
        
        // Store
        coreContracts[deploymentId] = address(core);
        userDeployments[msg.sender].push(deploymentId);
        
        emit SystemDeployed(deploymentId, msg.sender, address(core));
        
        return deploymentId;
    }
    
    /**
     * @dev Get core contract address
     */
    function getCoreContract(uint256 deploymentId) external view returns (address) {
        return coreContracts[deploymentId];
    }
    
    /**
     * @dev Get user deployments
     */
    function getUserDeployments(address user) external view returns (uint256[] memory) {
        return userDeployments[user];
    }
} 