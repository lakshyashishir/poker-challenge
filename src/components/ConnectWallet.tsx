
import { useState } from 'react';
import { Wallet, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ConnectWallet = () => {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState(0);

  const mockConnect = () => {
    setConnected(true);
    const mockAddress = '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6);
    setWalletAddress(mockAddress);
    setBalance(parseFloat((Math.random() * 100).toFixed(2)));
  };

  const disconnect = () => {
    setConnected(false);
    setWalletAddress('');
    setBalance(0);
  };

  if (!connected) {
    return (
      <Button 
        onClick={mockConnect} 
        className="poker-button-primary flex items-center gap-2"
      >
        <Wallet size={18} />
        <span>Connect Wallet</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-secondary/50 border border-primary/10 hover:bg-secondary"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-medium">{walletAddress}</span>
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 backdrop-blur-md bg-white/90 dark:bg-gray-800/90">
        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-3">
          <div className="text-sm text-muted-foreground mb-1">Balance</div>
          <div className="text-xl font-bold flex items-center gap-2">
            {balance.toFixed(2)} <span className="text-sm font-medium">APT</span>
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
