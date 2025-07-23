import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { useAuth } from '@/lib/hooks/use-auth';
import { CompanyType } from '@/lib/types/company';

export interface MenuItem {
  title: string;
  href?: string;
  icon: any;
  show?: boolean;
  submenu?: MenuItem[];
}

export const useDashboardMenu = () => {
  const pathname = usePathname();
  const { company } = useAuth();
  const t = useTranslations('dashboard');
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);

  const sidebarItems = useMemo((): MenuItem[] => [
    {
      title: t('menu.dashboard'),
      href: "/dashboard",
      icon: "LayoutDashboard",
    },
    {
      title: t('menu.productManagement'),
      icon: "Box",
      submenu: [
        {
          title: t('menu.products'),
          href: "/dashboard/products",
          icon: "Box",
        },
      ],
    },
    {
      title: t('menu.supplyChainManagement'),
      icon: "Factory",
      submenu: [
        {
          title: t('menu.suppliers'),
          href: "/dashboard/suppliers",
          icon: "Factory",
        },
        {
          title: t('menu.myProducts'),
          href: "/dashboard/pending-products",
          icon: "ClipboardCheck",
          show: company?.companyType === CompanyType.MANUFACTURER
        },
      ],
    },
    {
      title: t('menu.settings'),
      href: "/dashboard/settings",
      icon: "Settings",
    },
  ], [t, company]);

  // Auto-expand submenus when a child item is active
  const autoExpandSubmenus = useMemo(() => {
    const expanded: string[] = [];
    sidebarItems.forEach(item => {
      if (item.submenu) {
        const hasActiveChild = item.submenu.some(subItem => 
          subItem.href && pathname === subItem.href
        );
        if (hasActiveChild) {
          expanded.push(item.title);
        }
      }
    });
    return expanded;
  }, [sidebarItems, pathname]);

  const handleSubmenuToggle = (menuTitle: string) => {
    setOpenSubmenus(prev => 
      prev.includes(menuTitle) 
        ? prev.filter(item => item !== menuTitle)
        : [...prev, menuTitle]
    );
  };

  // Combine manual opens with auto-expanded
  const allOpenSubmenus = useMemo(() => {
    return [...new Set([...openSubmenus, ...autoExpandSubmenus])];
  }, [openSubmenus, autoExpandSubmenus]);

  const visibleItems = useMemo(() => {
    return sidebarItems.filter(item => {
      if (item.submenu) {
        const visibleSubmenuItems = item.submenu.filter(subItem => subItem.show === undefined || subItem.show === true);
        return visibleSubmenuItems.length > 0;
      }
      return item.show === undefined || item.show === true;
    });
  }, [sidebarItems]);

  const isSubmenuOpen = (menuTitle: string) => {
    return allOpenSubmenus.includes(menuTitle);
  };

  const isActive = (href?: string) => {
    return href ? pathname === href : false;
  };

  return {
    sidebarItems,
    visibleItems,
    openSubmenus: allOpenSubmenus,
    handleSubmenuToggle,
    isSubmenuOpen,
    isActive,
  };
}; 