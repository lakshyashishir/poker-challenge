
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ConnectWallet from './ConnectWallet';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 blur-backdrop' : 'py-5'
      }`}
    >
      <div className="container px-4 mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-bold font-display flex items-center"
        >
          <img 
            src="/logo.png"
            alt="PokerChallenge Logo"
            className="mr-2"
            width={24}
            height={24}
          />
          <span className="text-gradient">PokerChallenge</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" active={location.pathname === '/'}>
            Home
          </NavLink>
          <NavLink to="/game" active={location.pathname === '/game'}>
            Play
          </NavLink>
          <NavLink to="/leaderboard" active={location.pathname === '/leaderboard'}>
            Leaderboard
          </NavLink>
          <NavLink to="/history" active={location.pathname === '/history'}>
            History
          </NavLink>
          <ConnectWallet />
        </nav>

        <button 
          className="md:hidden text-foreground"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 blur-backdrop animate-fade-in">
          <div className="container px-4 mx-auto py-4 flex flex-col space-y-4">
            <MobileNavLink 
              to="/" 
              active={location.pathname === '/'} 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </MobileNavLink>
            <MobileNavLink 
              to="/game" 
              active={location.pathname === '/game'} 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Play
            </MobileNavLink>
            <MobileNavLink 
              to="/leaderboard" 
              active={location.pathname === '/leaderboard'} 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Leaderboard
            </MobileNavLink>
            <MobileNavLink 
              to="/history" 
              active={location.pathname === '/history'} 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              History
            </MobileNavLink>
            <div className="pt-2">
              <ConnectWallet />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

interface NavLinkProps {
  children: React.ReactNode;
  to: string;
  active: boolean;
}

const NavLink = ({ children, to, active }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={`font-medium transition-all duration-200 relative ${
        active 
          ? 'text-primary' 
          : 'text-foreground/80 hover:text-foreground'
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full transform -translate-y-1"></span>
      )}
    </Link>
  );
};

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

const MobileNavLink = ({ children, to, active, onClick }: MobileNavLinkProps) => {
  return (
    <Link
      to={to}
      className={`block py-2 px-4 rounded-md transition-colors duration-200 ${
        active 
          ? 'bg-primary/10 text-primary' 
          : 'text-foreground/80 hover:bg-secondary hover:text-foreground'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default Header;
