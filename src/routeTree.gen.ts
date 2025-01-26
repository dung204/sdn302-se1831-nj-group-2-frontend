/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols
// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.
import { createFileRoute } from '@tanstack/react-router';

// Import Routes

import { Route as rootRoute } from './routes/__root';
import { Route as NonAuthLayoutImport } from './routes/_non-auth-layout';

// Create Virtual Routes

const LoginIndexLazyImport = createFileRoute('/login/')();
const NonAuthLayoutIndexLazyImport = createFileRoute('/_non-auth-layout/')();
const NonAuthLayoutUsersIndexLazyImport = createFileRoute(
  '/_non-auth-layout/users/',
)();
const NonAuthLayoutUsersDeletedIndexLazyImport = createFileRoute(
  '/_non-auth-layout/users/deleted/',
)();

// Create/Update Routes

const NonAuthLayoutRoute = NonAuthLayoutImport.update({
  id: '/_non-auth-layout',
  getParentRoute: () => rootRoute,
} as any);

const LoginIndexLazyRoute = LoginIndexLazyImport.update({
  id: '/login/',
  path: '/login/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/login/index.lazy').then((d) => d.Route));

const NonAuthLayoutIndexLazyRoute = NonAuthLayoutIndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => NonAuthLayoutRoute,
} as any).lazy(() =>
  import('./routes/_non-auth-layout/index.lazy').then((d) => d.Route),
);

const NonAuthLayoutUsersIndexLazyRoute =
  NonAuthLayoutUsersIndexLazyImport.update({
    id: '/users/',
    path: '/users/',
    getParentRoute: () => NonAuthLayoutRoute,
  } as any).lazy(() =>
    import('./routes/_non-auth-layout/users/index.lazy').then((d) => d.Route),
  );

const NonAuthLayoutUsersDeletedIndexLazyRoute =
  NonAuthLayoutUsersDeletedIndexLazyImport.update({
    id: '/users/deleted/',
    path: '/users/deleted/',
    getParentRoute: () => NonAuthLayoutRoute,
  } as any).lazy(() =>
    import('./routes/_non-auth-layout/users/deleted/index.lazy').then(
      (d) => d.Route,
    ),
  );

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_non-auth-layout': {
      id: '/_non-auth-layout';
      path: '';
      fullPath: '';
      preLoaderRoute: typeof NonAuthLayoutImport;
      parentRoute: typeof rootRoute;
    };
    '/_non-auth-layout/': {
      id: '/_non-auth-layout/';
      path: '/';
      fullPath: '/';
      preLoaderRoute: typeof NonAuthLayoutIndexLazyImport;
      parentRoute: typeof NonAuthLayoutImport;
    };
    '/login/': {
      id: '/login/';
      path: '/login';
      fullPath: '/login';
      preLoaderRoute: typeof LoginIndexLazyImport;
      parentRoute: typeof rootRoute;
    };
    '/_non-auth-layout/users/': {
      id: '/_non-auth-layout/users/';
      path: '/users';
      fullPath: '/users';
      preLoaderRoute: typeof NonAuthLayoutUsersIndexLazyImport;
      parentRoute: typeof NonAuthLayoutImport;
    };
    '/_non-auth-layout/users/deleted/': {
      id: '/_non-auth-layout/users/deleted/';
      path: '/users/deleted';
      fullPath: '/users/deleted';
      preLoaderRoute: typeof NonAuthLayoutUsersDeletedIndexLazyImport;
      parentRoute: typeof NonAuthLayoutImport;
    };
  }
}

// Create and export the route tree

interface NonAuthLayoutRouteChildren {
  NonAuthLayoutIndexLazyRoute: typeof NonAuthLayoutIndexLazyRoute;
  NonAuthLayoutUsersIndexLazyRoute: typeof NonAuthLayoutUsersIndexLazyRoute;
  NonAuthLayoutUsersDeletedIndexLazyRoute: typeof NonAuthLayoutUsersDeletedIndexLazyRoute;
}

const NonAuthLayoutRouteChildren: NonAuthLayoutRouteChildren = {
  NonAuthLayoutIndexLazyRoute: NonAuthLayoutIndexLazyRoute,
  NonAuthLayoutUsersIndexLazyRoute: NonAuthLayoutUsersIndexLazyRoute,
  NonAuthLayoutUsersDeletedIndexLazyRoute:
    NonAuthLayoutUsersDeletedIndexLazyRoute,
};

const NonAuthLayoutRouteWithChildren = NonAuthLayoutRoute._addFileChildren(
  NonAuthLayoutRouteChildren,
);

export interface FileRoutesByFullPath {
  '': typeof NonAuthLayoutRouteWithChildren;
  '/': typeof NonAuthLayoutIndexLazyRoute;
  '/login': typeof LoginIndexLazyRoute;
  '/users': typeof NonAuthLayoutUsersIndexLazyRoute;
  '/users/deleted': typeof NonAuthLayoutUsersDeletedIndexLazyRoute;
}

export interface FileRoutesByTo {
  '/': typeof NonAuthLayoutIndexLazyRoute;
  '/login': typeof LoginIndexLazyRoute;
  '/users': typeof NonAuthLayoutUsersIndexLazyRoute;
  '/users/deleted': typeof NonAuthLayoutUsersDeletedIndexLazyRoute;
}

export interface FileRoutesById {
  __root__: typeof rootRoute;
  '/_non-auth-layout': typeof NonAuthLayoutRouteWithChildren;
  '/_non-auth-layout/': typeof NonAuthLayoutIndexLazyRoute;
  '/login/': typeof LoginIndexLazyRoute;
  '/_non-auth-layout/users/': typeof NonAuthLayoutUsersIndexLazyRoute;
  '/_non-auth-layout/users/deleted/': typeof NonAuthLayoutUsersDeletedIndexLazyRoute;
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths: '' | '/' | '/login' | '/users' | '/users/deleted';
  fileRoutesByTo: FileRoutesByTo;
  to: '/' | '/login' | '/users' | '/users/deleted';
  id:
    | '__root__'
    | '/_non-auth-layout'
    | '/_non-auth-layout/'
    | '/login/'
    | '/_non-auth-layout/users/'
    | '/_non-auth-layout/users/deleted/';
  fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
  NonAuthLayoutRoute: typeof NonAuthLayoutRouteWithChildren;
  LoginIndexLazyRoute: typeof LoginIndexLazyRoute;
}

const rootRouteChildren: RootRouteChildren = {
  NonAuthLayoutRoute: NonAuthLayoutRouteWithChildren,
  LoginIndexLazyRoute: LoginIndexLazyRoute,
};

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_non-auth-layout",
        "/login/"
      ]
    },
    "/_non-auth-layout": {
      "filePath": "_non-auth-layout.tsx",
      "children": [
        "/_non-auth-layout/",
        "/_non-auth-layout/users/",
        "/_non-auth-layout/users/deleted/"
      ]
    },
    "/_non-auth-layout/": {
      "filePath": "_non-auth-layout/index.lazy.tsx",
      "parent": "/_non-auth-layout"
    },
    "/login/": {
      "filePath": "login/index.lazy.tsx"
    },
    "/_non-auth-layout/users/": {
      "filePath": "_non-auth-layout/users/index.lazy.tsx",
      "parent": "/_non-auth-layout"
    },
    "/_non-auth-layout/users/deleted/": {
      "filePath": "_non-auth-layout/users/deleted/index.lazy.tsx",
      "parent": "/_non-auth-layout"
    }
  }
}
ROUTE_MANIFEST_END */
