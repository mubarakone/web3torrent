// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Web3TorrentCore.sol";
import "./LicenseRegistry.sol";
import "./BountyManager.sol";
import "./NetworkRebates.sol";

/**
 * @title DeploymentLib
 * @dev Library containing deployment logic for Web3Torrent system contracts
 * @notice This library handles the complex deployment process to reduce factory contract size
 */
library DeploymentLib {
    
    /**
     * @dev Struct to return deployment addresses
     */
    struct DeploymentResult {
        address coreContract;
        address licenseRegistry;
        address bountyManager;
        address networkRebates;
    }
    
    /**
     * @dev Deploy complete Web3Torrent system
     * @return result Struct containing all deployed contract addresses
     */
    function deployWeb3TorrentSystem() external returns (DeploymentResult memory result) {
        // Deploy core contract first
        Web3TorrentCore core = new Web3TorrentCore();
        
        // Deploy supporting contracts with core contract address
        LicenseRegistry registry = new LicenseRegistry(address(core));
        BountyManager bounty = new BountyManager(address(core), address(registry));
        NetworkRebates rebates = new NetworkRebates(address(core), address(registry));
        
        // Initialize core contract with supporting contract addresses
        core.initialize(address(registry), address(bounty), address(rebates));
        
        // Transfer ownership to the actual user who called deploySystem()
        // tx.origin is the original caller (user), not the factory contract
        core.transferOwnership(tx.origin);
        
        // Return all addresses
        result = DeploymentResult({
            coreContract: address(core),
            licenseRegistry: address(registry),
            bountyManager: address(bounty),
            networkRebates: address(rebates)
        });
        
        return result;
    }
    
    /**
     * @dev Validate deployment addresses (helper function)
     * @param core Address of core contract
     * @param registry Address of license registry
     * @param bounty Address of bounty manager
     * @param rebates Address of network rebates
     * @return isValid True if all addresses are non-zero
     */
    function validateDeployment(
        address core,
        address registry, 
        address bounty,
        address rebates
    ) external pure returns (bool isValid) {
        return (
            core != address(0) &&
            registry != address(0) &&
            bounty != address(0) &&
            rebates != address(0)
        );
    }
} 