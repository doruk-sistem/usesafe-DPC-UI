"use client";

import {
  LayoutDashboard,
  ShieldCheck,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';

import { ComplateRegistrationForm } from "@/components/dashboard/complate-registration-form";
import { DashboardMenuItem } from "@/components/dashboard/menu-item";
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
import { useDashboardMenu } from "@/lib/hooks/use-dashboard-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { company } = useAuth();
  const t = useTranslations('dashboard');
  const { visibleItems, handleSubmenuToggle, isSubmenuOpen, isActive } = useDashboardMenu();

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
        <aside className="hidden lg:flex w-72 flex-col border-r bg-muted/40">
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
              {visibleItems.map((item) => (
                <DashboardMenuItem
                  key={item.title}
                  item={item}
                  isActive={isActive(item.href)}
                  isSubmenuOpen={isSubmenuOpen(item.title)}
                  onSubmenuToggle={handleSubmenuToggle}
                />
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
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="p-6">
              <SheetTitle className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
                <span>UseSafe</span>
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-5rem)]">
              <div className="space-y-1 p-3">
                {visibleItems.map((item) => (
                  <DashboardMenuItem
                    key={item.title}
                    item={item}
                    isActive={isActive(item.href)}
                    isSubmenuOpen={isSubmenuOpen(item.title)}
                    onSubmenuToggle={handleSubmenuToggle}
                  />
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
