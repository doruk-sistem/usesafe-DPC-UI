"use client";

import Link from "next/link";
import { ShieldCheck, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <ShieldCheck className="h-6 w-6" />
          <span className="text-xl font-bold">UseSafe</span>
        </Link>
        
        <nav className="flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">Manufacturers</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/auth/register">Register Company</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/products">View Products</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/verify">
            <Button variant="ghost">Verify Product</Button>
          </Link>

          <div className="flex items-center space-x-2">
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <ModeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}