"use client"

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
  Plus
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../context/authContext" // Assuming you have an auth context

export default function Header() {
  const router = useRouter()
  const { logout } = useAuth() // Assuming your auth context provides a logout function

  const handleLogout = async () => {
    try {
      await logout() // Call the logout function from your auth context
      router.push("/login") // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error)
    }
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
            Welcome back, John
          </p>
        </div>
        
        {/* Breadcrumb */}
        <div className="hidden md:flex items-center text-sm text-gray-500">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Dashboard</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        
        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-2">
        
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-2 gap-2 hover:bg-gray-100 transition-colors duration-200">
              <Avatar className="h-7 w-7 ring-2 ring-gray-100">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900">John Doe</span>
                <span className="text-xs text-gray-500">Admin</span>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">john@entsuki.com</p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
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