"use client";

import { ShieldCheck, LogIn, Box, Factory, Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { UserNav } from "@/components/layout/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";

export function Navbar() {
  const t = useTranslations('navbar');
  const { user, isLoading, signOut } = useAuth();
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
              {!user && (
                <Link href="/auth/register">
                  <Button variant="ghost" className="gap-2">
                    <Factory className="h-4 w-4" />
                    {t('companyRegistration')}
                  </Button>
                </Link>
              )}

              <Link href="/products">
                <Button variant="ghost" className="gap-2">
                  <Box className="h-4 w-4" />
                  {t('products')}
                </Button>
              </Link>

              <Link href="/verify">
                <Button variant="ghost" className="gap-2">
                  <Search className="h-4 w-4" />
                  {t('verifyProducts')}
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
                        {t('signIn')}
                      </Button>
                    </Link>
                  )}
                </>
              )}
              <div className="flex items-center space-x-1 border-l pl-2">
                <LanguageSwitcher />
                <ModeToggle />
              </div>
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
            {!user && (
              <Link href="/auth/register">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Factory className="h-4 w-4" />
                  {t('companyRegistration')}
                </Button>
              </Link>
            )}

            <Link href="/products">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Box className="h-4 w-4" />
                {t('products')}
              </Button>
            </Link>

            <Link href="/verify">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Search className="h-4 w-4" />
                {t('verifyProducts')}
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
                        {t('signIn')}
                      </Button>
                    </Link>
                  )}
                </>
              )}
              <div className="mt-4 flex items-center justify-end space-x-2 px-2">
                <LanguageSwitcher />
                <div className="border-l pl-2">
                  <ModeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}