import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase/client";
import { doc, getDoc } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, Crown } from "lucide-react";

export default function Navbar() {
  const [userInitial, setUserInitial] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fullName = docSnap.data().fullName || "";
          setUserName(fullName);
          setUserInitial(fullName.charAt(0).toUpperCase());
        }
      } else {
        setIsAuthenticated(false);
        setUserInitial("");
        setUserName("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserInitial("");
      setUserName("");
      setIsAuthenticated(false);
      setIsMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gray-950/95 backdrop-blur-lg border-b border-gray-800/50 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="group flex items-center space-x-2"
            >
              <div className="relative">
                <Crown className="h-8 w-8 text-violet-400 group-hover:text-violet-300 transition-all duration-300 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-violet-400/20 blur-xl rounded-full group-hover:bg-violet-300/30 transition-all duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-violet-300 group-hover:via-purple-300 group-hover:to-indigo-300 transition-all duration-300">
                MockAI
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-violet-300"
                    : "text-gray-300 hover:text-violet-300 hover:bg-gray-800/50"
                }`
              }
            >
              Home
            </NavLink>
            
            <NavLink
              to="/interview"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-violet-300"
                    : "text-gray-300 hover:text-violet-300 hover:bg-gray-800/50"
                }`
              }
            >
              Interview
            </NavLink>

            {!isAuthenticated ? (
              <div className="flex items-center space-x-3 ml-6">
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "text-violet-300"
                        : "text-gray-300 hover:text-violet-300 hover:bg-gray-800/50"
                    }`
                  }
                >
                  Login
                </NavLink>
                <Button asChild className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 transform hover:scale-105">
                  <NavLink to="/register">Register</NavLink>
                </Button>
              </div>
            ) : (
              <div className="ml-6 cursor-pointer ">
                <DropdownMenu className="cursor-pointer">
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="cursor-pointer relative h-11 w-11 rounded-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-violet-500/50 transition-all duration-300 group ">
                      <Avatar className="h-9 w-9 cursor-pointer">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-sm group-hover:from-violet-400 group-hover:to-purple-500 transition-all duration-300">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 shadow-2xl shadow-black/50" align="end" forceMount>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-t-lg cursor-pointer">
                      <Avatar className="h-10 w-10 cursor-pointer">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold cursor-pointer">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="font-semibold text-sm text-gray-100">{userName}</p>
                        <p className="text-xs text-gray-400 truncate w-40">
                          {auth.currentUser?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-700/50" />
                    <DropdownMenuItem
                    onClick={()=>navigate("/profile")}
                     className="cursor-pointer text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 focus:bg-gray-800/50 focus:text-gray-100 transition-colors duration-200">
                      <User className="mr-3 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                   
                    <DropdownMenuSeparator className="bg-gray-700/50" />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300 transition-colors duration-200"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="text-gray-300 hover:text-violet-300 hover:bg-gray-800/50 border border-gray-700/50 hover:border-violet-500/50 transition-all duration-300 rounded-xl"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="h-6 w-6 transition-transform duration-300" />
              )}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-16 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800/50 shadow-2xl animate-in slide-in-from-top-2 duration-300 z-40">
            <div className="px-4 py-6 space-y-1">
              <NavLink
                to="/"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                    isActive
                      ? "text-violet-300"
                      : "text-gray-300 hover:text-violet-300 hover:bg-gray-800/50"
                  }`
                }
              >
                Home
              </NavLink>
              
              <NavLink
                to="/profile"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                    isActive
                      ? "text-violet-300"
                      : "text-gray-300 hover:text-violet-300 hover:bg-gray-800/50"
                  }`
                }
              >
                Profile
              </NavLink>

              {!isAuthenticated ? (
                <div className="space-y-2 pt-4 border-t border-gray-800/50">
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                        isActive
                          ? "text-violet-300"
                          : "text-gray-300 hover:text-violet-300 hover:bg-gray-800/50"
                      }`
                    }
                  >
                    Login
                  </NavLink>
                  <div className="px-2">
                    <Button asChild className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-300">
                      <NavLink to="/register" onClick={closeMenu}>
                        Register
                      </NavLink>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-800/50">
                  <div className="flex items-center px-4 py-3 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl mb-2">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-100">{userName}</span>
                      <span className="text-xs text-gray-400">{auth.currentUser?.email}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}