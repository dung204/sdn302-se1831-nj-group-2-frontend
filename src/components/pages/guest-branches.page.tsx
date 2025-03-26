import { useMutation, useQuery } from '@tanstack/react-query';
import { Navigate, getRouteApi, useNavigate, useRouter } from '@tanstack/react-router';
import { ArrowLeftIcon, ArrowRightIcon, LogOut, MapPin } from 'lucide-react';

import { useAuth, useBranch } from '@/common/hooks';
import { LocalStorageKey } from '@/common/types';
import { branchSearchParamsSchema } from '@/common/types/api/branch';
import { Role } from '@/common/types/api/user';
import { Button } from '@/components/ui/button';
import { ThemeToggler } from '@/components/ui/theme-toggler';
import { cn } from '@/lib/cn';
import { authHttpClient, branchHttpClient } from '@/lib/http';

const route = getRouteApi('/guest/branches/');
const MAX_BRANCHES = 4;

export function GuestBranchesPage() {
  const searchParams = branchSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const router = useRouter();

  const { user, logout } = useAuth();
  const { branch: selectedBranch, setBranchId } = useBranch();

  const { data: res } = useQuery({
    queryKey: ['branches', 'all', { ...searchParams, pageSize: MAX_BRANCHES }],
    queryFn: () => branchHttpClient.getAllBranches({ ...searchParams, pageSize: MAX_BRANCHES }),
  });

  const { mutateAsync: triggerLogout } = useMutation({
    mutationFn: () => authHttpClient.logout(),
    onSuccess: () => {
      logout();
      localStorage.removeItem(LocalStorageKey.BRANCH_ID);
      navigate({ to: '/login', reloadDocument: true });
    },
  });

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== Role.GUEST) {
    return <Navigate to="/" />;
  }

  return (
    <main className="relative flex h-svh w-full">
      <div className="absolute m-auto flex h-svh w-full flex-col items-center justify-around">
        {selectedBranch && (
          <div className="absolute left-6 top-6 z-20 flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => {
                if (router.history.canGoBack()) {
                  router.history.back();
                  return;
                }

                navigate({ to: '/' });
              }}
            >
              <ArrowLeftIcon className="size-4" />
              Back
            </Button>
          </div>
        )}
        <div className="absolute right-6 top-6 z-20 flex items-center gap-4">
          <ThemeToggler />
          <Button variant="danger" onClick={() => triggerLogout()}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
        <div className="z-10 flex flex-col items-center justify-center gap-6">
          <h1 className="text-center text-6xl font-bold">
            Hello, {user.firstName} {user.lastName}
          </h1>
          <p className="text-center text-2xl">
            Welcome to the Internet Cafe. Please select a branch to continue.
          </p>
        </div>
        <div className="flex w-full justify-center gap-4">
          {res?.data.map((branch) => (
            <div
              key={branch.id}
              className={cn(
                'flex aspect-square w-1/4 flex-col items-center justify-center gap-12 rounded-lg border-2 border-gray-200 p-4 transition-all',
                { 'cursor-pointer hover:bg-gray-100/15': selectedBranch?.id !== branch.id },
                { 'bg-success': selectedBranch?.id === branch.id },
              )}
              onClick={() => {
                if (selectedBranch?.id !== branch.id) {
                  setBranchId(branch.id);
                  navigate({ to: '/' });
                }
              }}
            >
              <h2 className="select-none text-4xl font-semibold">{branch.name}</h2>
              <div className="flex select-none items-center gap-2">
                <MapPin className="size-6" />
                <span className="text-xl">{branch.address}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="link"
            className="text-xl"
            disabled={!res?.meta.pagination.hasPreviousPage}
            onClick={() => {
              navigate({
                to: '/guest/branches',
                search: { ...searchParams, page: (res?.meta.pagination.page ?? 2) - 1 },
              });
            }}
          >
            <ArrowLeftIcon className="size-10" />
            Previous
          </Button>
          <Button
            variant="link"
            className="text-xl"
            disabled={!res?.meta.pagination.hasNextPage}
            onClick={() => {
              navigate({
                to: '/guest/branches',
                search: { ...searchParams, page: (res?.meta.pagination.page ?? 0) + 1 },
              });
            }}
          >
            Next
            <ArrowRightIcon className="size-10" />
          </Button>
        </div>
      </div>
    </main>
  );
}
