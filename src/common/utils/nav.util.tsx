import { Gauge, User, UserX, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';

import type { FileRoutesByTo } from '@/routeTree.gen';

export type NavUrl = {
  title: string;
  icon?: ReactNode;
  url: keyof FileRoutesByTo;
};

export type NavGroup = {
  title: string;
  icon?: ReactNode;
  urls: NavUrl[];
};

export type NavItem = NavUrl | NavGroup;

export const navItems: NavItem[] = [
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
        title: 'Manage users',
        icon: <UsersRound className="size-4" />,
        url: '/users',
      },
      {
        title: 'Manage deleted users',
        icon: <UserX className="size-4" />,
        url: '/users/deleted',
      },
    ],
  },
];

export function getBreadcrumbItems(pathname: string) {
  const foundItems = navItems.find((item) => {
    if ('url' in item) {
      return item.url === pathname;
    }

    return item.urls.some((item) => item.url === pathname);
  });

  if (!foundItems) return [];
  if ('url' in foundItems || foundItems.urls.length === 0)
    return [foundItems.title];

  const subUrl = foundItems.urls.find((item) => item.url === pathname);

  if (!subUrl) return [foundItems.title];
  return [foundItems.title, subUrl.title];
}
