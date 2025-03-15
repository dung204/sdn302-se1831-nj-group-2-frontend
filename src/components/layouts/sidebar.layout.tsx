import { Link, useLocation } from '@tanstack/react-router';
import { ChevronRight, Gauge, Router, User, UserX, UsersRound } from 'lucide-react';
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
      title: 'Users',
      icon: <User className="size-4" />,
      urls: [
        {
          title: 'Existing users',
          icon: <UsersRound className="size-4" />,
          url: '/users',
        },
        {
          title: 'Deleted users',
          icon: <UserX className="size-4" />,
          url: '/users/deleted',
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
  ],
  [Role.STAFF]: [
    {
      title: 'Dashboard',
      icon: <Gauge className="size-4" />,
      url: '/',
    },
  ],
  [Role.GUEST]: [
    {
      title: 'Dashboard',
      icon: <Gauge className="size-4" />,
      url: '/',
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
                <SidebarMenuSubItem key={item.title}>
                  <SidebarMenuSubButton
                    className="transition-all"
                    asChild
                    isActive={currentPathname === item.url}
                  >
                    <Link to={item.url}>
                      {item.icon}
                      {item.title}
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
