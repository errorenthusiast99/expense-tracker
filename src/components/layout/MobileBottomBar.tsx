"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BarChart3,
  HandCoins,
  LayoutDashboard,
  Plus,
  Repeat2,
  Tag,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const primaryItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/recurring", label: "Repetitive", icon: Repeat2 },
];

const moreItems = [
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/financial-items", label: "Financial Items", icon: Wallet },
  { href: "/lend-borrow", label: "Lend / Borrow", icon: HandCoins },
];

interface Props {
  onAddTransaction: () => void;
}

export function MobileBottomBar({ onAddTransaction }: Props) {
  const pathname = usePathname();
  const isMoreActive = moreItems.some(({ href }) => pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <Button
        onClick={onAddTransaction}
        size="icon"
        className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full shadow-lg md:hidden"
        aria-label="Add transaction"
      >
        <Plus className="h-7 w-7" />
      </Button>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {primaryItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} className="flex flex-col items-center gap-1 rounded-md py-2">
                <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-[11px]", active ? "text-primary" : "text-muted-foreground")}>{label}</span>
              </Link>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn("flex flex-col items-center gap-1 rounded-md py-2", isMoreActive ? "text-primary" : "text-muted-foreground")}
              >
                <Wallet className="h-5 w-5" />
                <span className="text-[11px]">Others</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="mb-2 w-52">
              {moreItems.map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
}
