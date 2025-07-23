import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Box,
  Factory,
  ClipboardCheck,
  Settings,
  QrCode,
  FileText,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { type MenuItem } from "@/lib/hooks/use-dashboard-menu";
import { cn } from "@/lib/utils";

// Icon mapping for menu items
const iconMap: Record<string, any> = {
  LayoutDashboard,
  Box,
  Factory,
  ClipboardCheck,
  Settings,
  QrCode,
  FileText,
};

interface MenuItemProps {
  item: MenuItem;
  isSubmenu?: boolean;
  isActive: boolean;
  isSubmenuOpen: boolean;
  onSubmenuToggle: (title: string) => void;
}

export const DashboardMenuItem = ({
  item,
  isSubmenu = false,
  isActive,
  isSubmenuOpen,
  onSubmenuToggle,
}: MenuItemProps) => {
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const visibleSubmenuItems = item.submenu?.filter(subItem => subItem.show === undefined || subItem.show === true) || [];

  const IconComponent = iconMap[item.icon];

  if (hasSubmenu) {
    return (
      <Collapsible
        open={isSubmenuOpen}
        onOpenChange={() => onSubmenuToggle(item.title)}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full h-10 px-4 justify-between hover:bg-secondary/50"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {IconComponent && <IconComponent className="h-4 w-4 shrink-0" />}
              <span className="truncate">{item.title}</span>
            </div>
            {isSubmenuOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1">
          {visibleSubmenuItems.map((subItem) => (
            <DashboardMenuItem
              key={subItem.href}
              item={subItem}
              isSubmenu={true}
              isActive={false} // This will be calculated by parent
              isSubmenuOpen={false} // This will be calculated by parent
              onSubmenuToggle={onSubmenuToggle}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full h-10 px-4 justify-start hover:bg-secondary/50",
        isActive && "bg-secondary",
        isSubmenu && "ml-4"
      )}
      asChild
    >
      <Link href={item.href!}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {IconComponent && <IconComponent className="h-4 w-4 shrink-0" />}
          <span className="truncate">{item.title}</span>
        </div>
      </Link>
    </Button>
  );
}; 