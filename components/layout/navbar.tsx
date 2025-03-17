"use client";

import { ShieldCheck, LogIn, Box, Factory, Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { UserNav } from "@/components/layout/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";

export function Navbar() {
  const { user, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo ve Ana Menü Öğeleri */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <ShieldCheck className="h-6 w-6" />
              <span className="text-xl font-bold">UseSafe</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
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
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Desktop Auth & Theme */}
            <div className="hidden md:flex items-center space-x-2">
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link href="/auth/register">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Factory className="h-4 w-4" />
                Company Registration
              </Button>
            </Link>

            <Link href="/products">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Box className="h-4 w-4" />
                Products
              </Button>
            </Link>

            <Link href="/verify">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Search className="h-4 w-4" />
                Verify Products
              </Button>
            </Link>

            <div className="pt-4 border-t">
              {!isLoading && (
                <>
                  {user ? (
                    <div className="px-2">
                      <UserNav />
                    </div>
                  ) : (
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                  )}
                </>
              )}
              <div className="mt-4 flex justify-end px-2">
                <ModeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}