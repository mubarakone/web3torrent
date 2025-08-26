// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeploymentLib.sol";
import "./Web3TorrentCore.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Web3TorrentFactory
 * @dev Lightweight factory for deploying Web3Torrent systems using DeploymentLib
 * @notice This factory uses a library pattern to stay under the 24KB contract size limit
 */
contract Web3TorrentFactory is Ownable {
    uint256 public deploymentCounter;
    
    // Deployment tracking
    struct Deployment {
        address coreContract;
        address licenseRegistry;
        address bountyManager;
        address networkRebates;
        address deployer;
        uint256 timestamp;
    }
    
    mapping(uint256 => Deployment) public deployments;
    mapping(address => uint256[]) public userDeployments;
    
    // Events
    event SystemDeployed(
        uint256 indexed deploymentId,
        address indexed deployer,
        address indexed coreContract,
        address licenseRegistry,
        address bountyManager,
        address networkRebates
    );
    
    constructor() Ownable(msg.sender) {
        // OpenZeppelin Ownable constructor sets the owner
    }
    
    /**
     * @dev Deploy complete Web3Torrent system using library
     * @return deploymentId Unique identifier for this deployment
     */
    function deploySystem() external returns (uint256) {
        deploymentCounter++;
        uint256 deploymentId = deploymentCounter;
        
        // Use library to deploy contracts (this is where the heavy lifting happens)
        DeploymentLib.DeploymentResult memory result = DeploymentLib.deployWeb3TorrentSystem();
        
        // Validate deployment
        require(
            DeploymentLib.validateDeployment(
                result.coreContract,
                result.licenseRegistry,
                result.bountyManager,
                result.networkRebates
            ),
            "Deployment validation failed"
        );
        
        // Store deployment info
        deployments[deploymentId] = Deployment({
            coreContract: result.coreContract,
            licenseRegistry: result.licenseRegistry,
            bountyManager: result.bountyManager,
            networkRebates: result.networkRebates,
            deployer: msg.sender,
            timestamp: block.timestamp
        });
        
        // Track user deployments
        userDeployments[msg.sender].push(deploymentId);
        
        // Emit event
        emit SystemDeployed(
            deploymentId,
            msg.sender,
            result.coreContract,
            result.licenseRegistry,
            result.bountyManager,
            result.networkRebates
        );
        
        return deploymentId;
    }
    
    /**
     * @dev Get deployment details
     * @param deploymentId ID of the deployment
     * @return deployment Full deployment information
     */
    function getDeployment(uint256 deploymentId) external view returns (Deployment memory) {
        require(deploymentId > 0 && deploymentId <= deploymentCounter, "Invalid deployment ID");
        return deployments[deploymentId];
    }
    
    /**
     * @dev Get core contract address for a deployment
     * @param deploymentId ID of the deployment
     * @return coreContract Address of the core contract
     */
    function getCoreContract(uint256 deploymentId) external view returns (address) {
        require(deploymentId > 0 && deploymentId <= deploymentCounter, "Invalid deployment ID");
        return deployments[deploymentId].coreContract;
    }
    
    /**
     * @dev Get all deployments for a user
     * @param user Address of the user
     * @return deploymentIds Array of deployment IDs
     */
    function getUserDeployments(address user) external view returns (uint256[] memory) {
        return userDeployments[user];
    }
    
    /**
     * @dev Get total number of deployments
     * @return count Total deployment count
     */
    function getTotalDeployments() external view returns (uint256) {
        return deploymentCounter;
    }
    
    /**
     * @dev Check if a deployment exists
     * @param deploymentId ID to check
     * @return exists True if deployment exists
     */
    function deploymentExists(uint256 deploymentId) public view returns (bool) {
        return deploymentId > 0 && deploymentId <= deploymentCounter;
    }
    
    /**
     * @dev Get the owner of a deployed core contract
     * @param deploymentId ID of the deployment
     * @return owner Address of the core contract owner
     */
    function getDeploymentOwner(uint256 deploymentId) external view returns (address) {
        require(deploymentExists(deploymentId), "Invalid deployment ID");
        address coreContract = deployments[deploymentId].coreContract;
        return Web3TorrentCore(coreContract).owner();
    }
} 