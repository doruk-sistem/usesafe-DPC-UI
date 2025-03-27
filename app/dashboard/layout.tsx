"use client";

import {
  QrCode,
  Factory,
  LayoutDashboard,
  Box,
  FileText,
  ShieldCheck,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { ComplateRegistrationForm } from "@/components/dashboard/complate-registration-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { company } = useAuth();
  const t = useTranslations('dashboard');

  const sidebarItems = useMemo(() => [
    {
      title: t('menu.dashboard'),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t('menu.products'),
      href: "/dashboard/products",
      icon: Box,
    },
    {
      title: t('menu.dpps'),
      href: "/dashboard/dpps",
      icon: QrCode,
    },
    {
      title: t('menu.suppliers'),
      href: "/dashboard/suppliers",
      icon: Factory,
    },
    {
      title: t('menu.documents'),
      href: "/dashboard/documents",
      icon: FileText,
    },
    {
      title: t('menu.certifications'),
      href: "/dashboard/certifications",
      icon: ShieldCheck,
    },
  ], [t]);

  return (
    <>
      {!company && (
        <Dialog open={!company} modal={true}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('registration.title')}</DialogTitle>
              <DialogDescription>
                {t('registration.description')}
              </DialogDescription>
            </DialogHeader>
            <ComplateRegistrationForm />
          </DialogContent>
        </Dialog>
      )}

      <div className="flex min-h-screen">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-muted/40">
          <div className="p-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
              <span>UseSafe</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full h-10 px-4 justify-start",
                    pathname === item.href && "bg-secondary"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <LayoutDashboard className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="p-6">
              <SheetTitle className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
                <span>UseSafe</span>
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-5rem)]">
              <div className="space-y-1 p-3">
                {sidebarItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full h-10 px-4 justify-start",
                      pathname === item.href && "bg-secondary"
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b bg-muted/40 px-6">
            <div className="flex-1" />
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </>
  );
}
