"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <ShieldCheck className="h-6 w-6" />
          <span className="text-xl font-bold">UseSafe</span>
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link href="/manufacturer/register">
            <Button variant="ghost">Manufacturers</Button>
          </Link>
          <Link href="/products">
            <Button variant="ghost">Products</Button>
          </Link>
          <Link href="/verify">
            <Button variant="ghost">Verify Product</Button>
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}