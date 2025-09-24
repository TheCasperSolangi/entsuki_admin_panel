"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  HelpCircle,
  ChevronDown,
  Plus,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../context/authContext"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Generate breadcrumb from current path
  const generateBreadcrumb = () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    
    // Always start with Home
    const breadcrumbs = [{ name: 'Home', path: '/' }]
    
    // Build breadcrumb path
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Capitalize and format segment name
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      breadcrumbs.push({
        name,
        path: currentPath,
        isLast: index === pathSegments.length - 1
      })
    })
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumb()

  // Helper function to get cookie value
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        
        // Get token from cookies
        const token = getCookie('token'); // Adjust cookie name if different
        
        const headers = {
          'Content-Type': 'application/json',
        };
        
        // Add authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('https://api.entsuki.com/api/auth/me', {
          method: 'GET',
          headers,
          credentials: 'include', // Include cookies
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const userData = await response.json()
        setUser(userData)
      } catch (err) {
        console.error('Failed to fetch user data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleProfileClick = () => {
    router.push("/profile") // Navigate to profile page
  }

  // Get user initials for avatar fallback
  const getUserInitials = (fullName) => {
    if (!fullName) return "U"
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get first name for welcome message
  const getFirstName = (fullName) => {
    if (!fullName) return "User"
    return fullName.split(' ')[0]
  }

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            {loading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading...
              </span>
            ) : error ? (
              "Welcome back"
            ) : (
              `Welcome back, ${getFirstName(user?.full_name)}`
            )}
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center text-sm text-gray-500">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              {crumb.isLast ? (
                <span className="text-gray-900 font-medium">{crumb.name}</span>
              ) : (
                <button
                  onClick={() => router.push(crumb.path)}
                  className="hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {crumb.name}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Add any quick action buttons here */}
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-9 px-2 gap-2 hover:bg-gray-100 transition-colors duration-200"
              disabled={loading}
            >
              <Avatar className="h-7 w-7 ring-2 ring-gray-100">
                <AvatarImage src={user?.profile_picture || "/placeholder-avatar.jpg"} />
                <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-semibold">
                  {loading ? "..." : getUserInitials(user?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900">
                  {loading ? "Loading..." : user?.full_name || "User"}
                </span>
                <span className="text-xs text-gray-500">
                  {loading ? "" : user?.username || "User"}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  {loading ? "Loading..." : user?.full_name || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {loading ? "" : user?.email || ""}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleProfileClick}
            >
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}