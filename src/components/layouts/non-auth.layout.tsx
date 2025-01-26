import { Outlet } from '@tanstack/react-router';

import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import '@/styles/globals.css';

import { HeaderLayout } from './header.layout';
import { SidebarLayout } from './sidebar.layout';

export function NonAuthLayout() {
  return (
    <SidebarProvider>
      <SidebarLayout />
      <SidebarInset>
        <HeaderLayout />
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <main className="p-4">
            <Outlet />
          </main>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
