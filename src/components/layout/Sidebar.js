"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Users, ShoppingBag, List, Package, Zap, User, Settings, LogOut, Image, Smartphone, PartyPopper, Store, Tv, ChartNoAxesCombined, LayoutDashboard, 
  Terminal,
  BookCopy,
  DollarSign,
  Pencil
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Orders", icon: Package, href: "/dashboard/orders" },
  { name: "Teams", icon: Users, href: "/dashboard/users" },
  { name: "Categories", icon: List, href: "/dashboard/categories" },
  { name: "Products", icon: ShoppingBag, href: "/dashboard/products" },
  { name: "Reviews", icon: Pencil, href: "/dashboard/reviews"},
  { name: "Promotions", icon: PartyPopper, href: "/dashboard/promotions" },
  { name: "Reports", icon: ChartNoAxesCombined, href: "/dashboard/reports" },
  
  { name: "Banners", icon: Image, href: "/dashboard/banners" },
//  { name: "Live Settings", icon: Tv, href: "/dashboard/live_settings" },
  { name: "App Settings", icon: Smartphone, href: "/dashboard/app_settings" },
  { name: "Store Settings", icon: Store, href: "/dashboard/store_settings" },
  { name: "Sales Terminal", icon: Terminal, href:"/pos_terminal"}
]

export default function Sidebar() {
  const pathname = usePathname()
  const [appSettings, setAppSettings] = useState(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store/settings`)
        if (!res.ok) throw new Error("Failed to fetch settings")
        const data = await res.json()
        setAppSettings(data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchSettings()
  }, [])

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen overflow-y-auto">
      
      {/* Header */}
      <div className="px-6 py-8 flex-shrink-0">
       <div className="flex items-center gap-3">
  {appSettings?.appLogo ? (
    <img 
      src={appSettings.appLogo} 
      alt="App Logo" 
      className="h-9 w-auto object-contain"
    />
  ) : (
    <Zap className="h-6 w-6 text-gray-900" />
  )}
  <div>
    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
      {appSettings?.appName || "Entsuki"}
    </h1>
    <p className="text-sm text-gray-500 font-medium">
      Admin Dashboard
    </p>
  </div>
</div>
      </div>

      {/* User Profile */}
      <div className="px-6 pb-6 flex-shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold text-sm">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              John Doe
            </p>
            <p className="text-xs text-gray-500 truncate font-medium">
              Administrator
            </p>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full ring-2 ring-green-100"></div>
        </div>
      </div>

      <Separator className="mx-6 flex-shrink-0" />

      {/* Navigation */}
      <nav className="flex-1 px-6 py-6 min-h-0 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-11 px-3 text-sm font-medium transition-all duration-200 relative group",
                    isActive
                      ? "bg-gray-900 text-white hover:bg-gray-800 hover:text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 w-full",
                      isActive && "relative z-10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                        isActive ? "text-white group-hover:text-white" : "text-gray-500 group-hover:text-gray-700"
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {isActive && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-white rounded-r-sm"></div>
                  )}
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>

      <Separator className="mx-6 flex-shrink-0" />

      {/* Settings & Logout */}
      <div className="px-6 py-6 space-y-1 flex-shrink-0">
        {/* <Button
          variant="ghost"
          className="w-full justify-start h-11 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
        >
          <Settings className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
          <span>Settings</span>
        </Button>
         */}
        <Button
          variant="ghost"
          className="w-full justify-start h-11 px-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 group"
        >
          <LogOut className="h-5 w-5 text-gray-500 group-hover:text-red-600 mr-3 flex-shrink-0 transition-colors duration-200" />
          <span>Sign out</span>
        </Button>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
        <p className="text-xs text-gray-500 text-center">
          Version {appSettings?.appVersion || "1.0.0"} - {appSettings?.enviroment || "development"}
        </p>
      </div>
    </aside>
  )
}
