import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const mainNavItems = [
  { name: 'Home', path: '/' },
  { name: 'Chat', path: '/chat' },
  { name: 'Coding Practice', path: '/coding-practice' },
  { name: 'Summarize', path: '/summarize' },
  ];

  const toolsNavItems = [
  { name: 'Test Generator', path: '/test-generator', icon: '🧪' },
  { name: 'Test Results', path: '/test-results', icon: '📊' },
  { name: 'Study Plan', path: '/study-plan', icon: '🗓️' },
  { name: 'Pomodoro Timer', path: '/pomodoro', icon: '⏲️' },
  { name: 'EduTube', path: '/edutube', icon: '🎥' },
  ];

  const secondaryNavItems = [
    { name: 'Resources', path: '/resources' },
    { name: 'Profile', path: '/profile' },
  ];

  const handleSignOut = () => {
    navigate('/auth');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="p-2.5 bg-gradient-to-br from-sky-500 via-blue-500 to-purple-600 rounded-xl group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-sky-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Notes Buddy
              </span>
              <div className="text-xs text-gray-500 -mt-1">Smart Learning Assistant</div>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Main Navigation */}
            {mainNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-sky-600 bg-sky-50 shadow-sm'
                      : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50/50'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

            {/* Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-sky-600 hover:bg-sky-50/50">
                  Tools
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 mt-2">
                {toolsNavItems.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <NavLink
                      to={item.path}
                      className="flex items-center space-x-2 w-full px-2 py-2 text-sm cursor-pointer"
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.name}</span>
                    </NavLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Secondary Navigation */}
            {secondaryNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-sky-600 bg-sky-50 shadow-sm'
                      : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50/50'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Desktop Sign Out */}
          <div className="hidden lg:flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2 border-gray-200 hover:border-sky-300 hover:bg-sky-50 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-sky-50 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-md">
            <div className="px-2 pt-4 pb-6 space-y-1">
              {/* Main Navigation */}
              <div className="space-y-1 mb-4">
                {mainNavItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-sky-600 bg-sky-50 shadow-sm'
                          : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50/50'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>

              {/* Tools Section */}
              <div className="border-t border-gray-200/50 pt-4 mb-4">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tools
                </div>
                {toolsNavItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-sky-600 bg-sky-50 shadow-sm'
                          : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50/50'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>

              {/* Secondary Navigation */}
              <div className="border-t border-gray-200/50 pt-4 mb-4">
                {secondaryNavItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-sky-600 bg-sky-50 shadow-sm'
                          : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50/50'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>

              {/* Mobile Sign Out */}
              <div className="border-t border-gray-200/50 pt-4">
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;