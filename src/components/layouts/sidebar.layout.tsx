import { Link, useLocation } from '@tanstack/react-router';
import {
  ChevronRight,
  Computer,
  Gauge,
  LandPlot,
  LayoutGrid,
  MapPin,
  MonitorSpeaker,
  Receipt,
  Router,
  Truck,
  Users,
  UsersRound,
  Utensils,
} from 'lucide-react';
import { type ComponentProps, type ReactNode } from 'react';

import { useAuth } from '@/common/hooks';
import { Role } from '@/common/types/api/user';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import type { FileRoutesByTo } from '@/routeTree.gen';

type NavUrl = {
  title: string;
  icon?: ReactNode;
  url: keyof FileRoutesByTo;
};

type NavGroup = {
  title: string;
  icon?: ReactNode;
  urls: NavUrl[];
};

type NavItem = NavUrl | NavGroup;

export const navItems: Record<Role, NavItem[]> = {
  [Role.OWNER]: [
    {
      title: 'Dashboard',
      icon: <Gauge className="size-4" />,
      url: '/',
    },
    {
      title: 'Branches',
      icon: <MapPin className="size-4" />,
      url: '/branches',
    },
    {
      title: 'Peripherals',
      icon: <MonitorSpeaker className="size-4" />,
      url: '/peripherals',
    },
    {
      title: 'Providers',
      icon: <Truck className="size-4" />,
      url: '/providers',
    },
    {
      title: 'Services',
      icon: <Utensils className="size-4" />,
      urls: [
        {
          title: 'Services',
          icon: <Utensils className="size-4" />,
          url: '/services',
        },
        {
          title: 'Service Categories',
          icon: <LayoutGrid className="size-4" />,
          url: '/service-categories',
        },
      ],
    },
    {
      title: 'Bills',
      icon: <Receipt className="size-4" />,
      url: '/bills',
    },
    {
      title: 'Usage Tracking',
      icon: <Utensils className="size-4" />,
      urls: [
        {
          title: 'Usage Tracking',
          icon: <Utensils className="size-4" />,
          url: '/usage-tracking',
        },
      ],
    },
  ],
  [Role.BRANCH_ADMIN]: [
    {
      title: 'Dashboard',
      icon: <Gauge className="size-4" />,
      url: '/',
    },
    {
      title: 'Guests',
      icon: <UsersRound className="size-4" />,
      url: '/guests',
    },
    {
      title: 'Staffs',
      icon: <Users className="size-4" />,
      url: '/staffs',
    },
    {
      title: 'Positions',
      icon: <LandPlot />,
      url: '/positions',
    },
    {
      title: 'Computers',
      icon: <Computer className="size-4" />,
      url: '/computers',
    },
    {
      title: 'Peripherals',
      icon: <MonitorSpeaker className="size-4" />,
      url: '/peripherals',
    },
    {
      title: 'Services',
      icon: <Utensils className="size-4" />,
      urls: [
        {
          title: 'Services',
          icon: <Utensils className="size-4" />,
          url: '/services',
        },
        {
          title: 'Service Categories',
          icon: <LayoutGrid className="size-4" />,
          url: '/service-categories',
        },
      ],
    },
    {
      title: 'Usage Tracking',
      url: '/usage-tracking',
    },
    {
      title: 'Bills',
      icon: <Receipt className="size-4" />,
      url: '/bills',
    },
  ],
  [Role.STAFF]: [
    {
      title: 'Dashboard',
      icon: <Gauge className="size-4" />,
      url: '/',
    },
    {
      title: 'Guests',
      icon: <UsersRound className="size-4" />,
      url: '/guests',
    },
    {
      title: 'Services',
      icon: <Utensils className="size-4" />,
      url: '/services',
    },
    {
      title: 'Bills',
      icon: <Receipt className="size-4" />,
      url: '/bills',
    },
  ],
  [Role.GUEST]: [
    {
      title: 'Dashboard',
      icon: <Gauge className="size-4" />,
      url: '/',
    },
    {
      title: 'Services',
      icon: <Utensils className="size-4" />,
      url: '/services',
    },
    {
      title: 'Computers',
      icon: <Computer className="size-4" />,
      url: '/computers',
    },
    {
      title: 'My bills',
      icon: <Receipt className="size-4" />,
      url: '/bills',
    },
  ],
};

export function SidebarLayout({ ...props }: ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="transition-all data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Router className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Internet café</span>
            {user?.role !== Role.OWNER && (
              <span className="font-semibold">Branch: {user?.branch?.name}</span>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {navItems[user!.role].map((item) => renderNavItem(item, location.pathname))}
      </SidebarContent>
    </Sidebar>
  );
}

function renderNavItem(item: NavItem, currentPathname: string) {
  if ('url' in item) {
    return (
      <SidebarGroup key={item.title}>
        <SidebarMenuButton
          asChild
          className="p-2 transition-all"
          isActive={currentPathname === item.url}
        >
          <Link to={item.url}>
            {item.icon}
            {item.title}
          </Link>
        </SidebarMenuButton>
      </SidebarGroup>
    );
  }

  return (
    <Collapsible key={item.title} title={item.title} defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel
          asChild
          className="group/label text-sm text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <CollapsibleTrigger title="Toggle sidebar">
            {item.icon}
            <span className="ml-1">{item.title}</span>
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenuSub>
              {item.urls.map((item) => (
                <SidebarMenuSubItem key={item.title} title={item.title}>
                  <SidebarMenuSubButton
                    className="transition-all"
                    asChild
                    isActive={currentPathname === item.url}
                  >
                    <Link to={item.url}>
                      <span className="flex items-center gap-2">
                        {item.icon}
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
