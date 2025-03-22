import { useState, useEffect, useMemo } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, ChevronDown, LogOut } from 'lucide-react';

const ConnectWallet = () => {
  const { connected, account, connect, disconnect, wallets, network } = useWallet();
  const [balance, setBalance] = useState<bigint | null>(null);

  const aptos = useMemo(() => {
    const networkName = network?.name?.toLowerCase() || "testnet";
    const config = new AptosConfig({ 
      network: networkName === "testnet" ? Network.TESTNET : Network.MAINNET 
    });
    return new Aptos(config);
  }, [network?.name]);

  useEffect(() => {
    let isMounted = true;
    
    if (connected && account) {
      const fetchBalance = async () => {
        try {
          const coinData = await aptos.getAccountCoinsData({
            accountAddress: account.address,
            options: {
              limit: 1,
              orderBy: [{ asset_type: "asc" }]
            }
          });
          
          const aptCoin = coinData.find(coin => 
            coin.asset_type === "0x1::aptos_coin::AptosCoin"
          );
          
          if (aptCoin && isMounted) {
            setBalance(BigInt(aptCoin.amount));
          } else if (isMounted) {
            setBalance(BigInt(0));
          }
        } catch (error) {
          console.error("Error fetching balance:", error);
          if (isMounted) {
            setBalance(null);
          }
        }
      };
      fetchBalance();
    } else {
      setBalance(null);
    }
    
    return () => {
      isMounted = false;
    };
  }, [connected, account, aptos]);

  const handleConnect = () => {
    if (wallets && wallets.length > 0) {
      connect(wallets[0].name);
    } else {
      console.error("No wallets available");
    }
  };

  if (!connected) {
    return (
      <Button 
        onClick={handleConnect} 
        className="poker-button-primary flex items-center gap-2"
      >
        <Wallet size={18} />
        <span>Connect Wallet</span>
      </Button>
    );
  }

  const addressString = account?.address?.toString();
  const displayAddress = addressString 
    ? `${addressString.slice(0, 6)}...${addressString.slice(-4)}` 
    : '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-secondary/50 border border-primary/10 hover:bg-secondary"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-medium">
            {displayAddress}
          </span>
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 backdrop-blur-md bg-white/90 dark:bg-gray-800/90">
        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-3">
          <div className="text-sm text-muted-foreground mb-1">Balance</div>
          <div className="text-xl font-bold flex items-center gap-2">
            {balance ? (Number(balance) / 100_000_000).toFixed(2) : "0.00"} 
            <span className="text-sm font-medium">APT</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={disconnect}
          className="text-red-500 cursor-pointer flex items-center gap-2"
        >
          <LogOut size={16} />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ConnectWallet;
