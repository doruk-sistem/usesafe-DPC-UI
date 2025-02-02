"use client";
 
import { ShieldCheck, LogIn, Box, Factory, Search } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/lib/hooks/use-auth";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";

export function Navbar() {
  const { user, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-6 md:px-8 mx-auto flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2 mr-8">
          <ShieldCheck className="h-6 w-6" />
          <span className="text-xl font-bold">UseSafe</span>
        </Link>
        
        <nav className="flex items-center space-x-4 flex-1">
          <Link href="/auth/register">
            <Button variant="ghost" className="gap-2">
              <Factory className="h-4 w-4" /> 
              Company Registration
            </Button>
          </Link>

          <Link href="/products">
            <Button variant="ghost" className="gap-2">
              <Box className="h-4 w-4" />
              Products
            </Button>
          </Link>

          <Link href="/verify">
            <Button variant="ghost" className="gap-2">
              <Search className="h-4 w-4" />
              Verify Products
            </Button>
          </Link>
        </nav>

        <div className="flex items-center space-x-2 ml-4">
          {!isLoading && (
            <>
              {user ? (
                <UserNav />
              ) : (
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}