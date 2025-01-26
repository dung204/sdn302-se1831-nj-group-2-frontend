import { Link, useLocation } from '@tanstack/react-router';
import { ChevronRight, Router } from 'lucide-react';
import * as React from 'react';

import { type NavItem, navItems } from '@/common/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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

export function SidebarLayout({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

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
        {navItems.map((item) => renderNavItem(item, location.pathname))}
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
    <Collapsible
      key={item.title}
      title={item.title}
      defaultOpen
      className="group/collapsible"
    >
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
