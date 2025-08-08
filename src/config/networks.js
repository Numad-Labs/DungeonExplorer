// Network configuration for DungeonExplorer
export const NETWORKS = {
  somnia: {
    chainId: parseInt(import.meta.env.VITE_SOMNIA_CHAIN_ID),
    chainIdHex: `0x${parseInt(import.meta.env.VITE_SOMNIA_CHAIN_ID).toString(16)}`,
    chainName: 'Somnia Shannon Testnet',
    rpcUrls: [import.meta.env.VITE_SOMNIA_RPC_URL],
    blockExplorerUrls: [import.meta.env.VITE_SOMNIA_EXPLORER_URL],
    nativeCurrency: {
      name: import.meta.env.VITE_SOMNIA_NATIVE_CURRENCY,
      symbol: import.meta.env.VITE_SOMNIA_CURRENCY_SYMBOL,
      decimals: parseInt(import.meta.env.VITE_SOMNIA_CURRENCY_DECIMALS)
    }
  }
};

// Get the default network from environment
export const DEFAULT_NETWORK = import.meta.env.VITE_DEFAULT_NETWORK || 'somnia';

// Get network configuration by name
export const getNetworkConfig = (networkName = DEFAULT_NETWORK) => {
  return NETWORKS[networkName];
};

// Get current network configuration
export const getCurrentNetworkConfig = () => {
  return getNetworkConfig();
};

// Check if the current MetaMask network matches our target network
export const isCorrectNetwork = async () => {
  if (typeof window.ethereum === 'undefined') {
    return false;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const targetNetwork = getCurrentNetworkConfig();
    return chainId === targetNetwork.chainIdHex;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

// Switch to the correct network
export const switchToCorrectNetwork = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  const networkConfig = getCurrentNetworkConfig();

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: networkConfig.chainIdHex }],
    });
    return true;
  } catch (switchError) {
    // If the network doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: networkConfig.chainIdHex,
              chainName: networkConfig.chainName,
              rpcUrls: networkConfig.rpcUrls,
              blockExplorerUrls: networkConfig.blockExplorerUrls,
              nativeCurrency: networkConfig.nativeCurrency,
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding network:', addError);
        throw new Error('Failed to add Somnia testnet to MetaMask');
      }
    } else {
      console.error('Error switching network:', switchError);
      throw new Error('Failed to switch to Somnia testnet');
    }
  }
};

// Network utilities
export const networkUtils = {
  isCorrectNetwork,
  switchToCorrectNetwork,
  getCurrentConfig: getCurrentNetworkConfig,
  getConfig: getNetworkConfig
};