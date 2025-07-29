import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import UserMenu from './UserMenu';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('=== HEADER RENDER ===');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('user:', user);
  console.log('=== END HEADER RENDER ===');

  const handleLogout = () => {
    console.log('Header logout clicked');
    logout();
    navigate('/');
  };

  const [active, setActive] = useState<string>("")
  useEffect(() => {
    setActive(location.pathname)
  }, [navigate])
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            AutoHotkey Generator
          </Link>

          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/instructions" className={`${active === "/instructions" ? "text-gray-700 font-semibold" : "text-gray-600"} hover:text-gray-900`}>
                Instructions
              </Link>
              <Link to="/pricing" className={`${active === "/pricing" ? "text-gray-700 font-semibold" : "text-gray-600"} hover:text-gray-900`}>
                Pricing
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="ghost" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </div>
                <div className="sm:hidden flex flex-col gap-3">
                  <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex items-center">

                      <UserMenu currentUser={user} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}