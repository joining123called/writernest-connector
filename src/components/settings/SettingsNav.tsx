
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Building2,
  CreditCard,
  Settings2,
  ShieldCheck,
  Users,
  FileText,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

interface SettingsNavProps extends React.HTMLAttributes<HTMLElement> {
  isAdmin: boolean
}

export function SettingsNav({ className, isAdmin }: SettingsNavProps) {
  const { pathname } = useLocation()
  
  const routes = [
    {
      href: `/settings/general`,
      label: "General",
      icon: Settings2,
      active: pathname === "/settings/general",
      adminOnly: false,
    },
    {
      href: `/settings/security`,
      label: "Security",
      icon: ShieldCheck,
      active: pathname === "/settings/security",
      adminOnly: false,
    },
    {
      href: `/settings/payment`,
      label: "Payment Methods",
      icon: CreditCard,
      active: pathname === "/settings/payment",
      adminOnly: false,
    },
    {
      href: `/settings/wallet`,
      label: "Wallet Management",
      icon: CreditCard,
      active: pathname === "/settings/wallet",
      adminOnly: true,
    },
    {
      href: `/settings/organization`,
      label: "Organization",
      icon: Building2,
      active: pathname === "/settings/organization",
      adminOnly: true,
    },
    {
      href: `/settings/users`,
      label: "User Management",
      icon: Users,
      active: pathname === "/settings/users",
      adminOnly: true,
    },
    {
      href: `/settings/assignments`,
      label: "Assignment Settings",
      icon: FileText,
      active: pathname === "/settings/assignments",
      adminOnly: true,
    }
  ]

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
    >
      {routes
        .filter(route => !route.adminOnly || isAdmin)
        .map((route) => (
          <Button
            key={route.href}
            variant={route.active ? "secondary" : "ghost"}
            className={cn(
              "justify-start",
              route.active && "bg-primary/10"
            )}
            asChild
          >
            <Link to={route.href}>
              <route.icon className="mr-2 h-4 w-4" />
              {route.label}
            </Link>
          </Button>
        ))}
    </nav>
  )
}
