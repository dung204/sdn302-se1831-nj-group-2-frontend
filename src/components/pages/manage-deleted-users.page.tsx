import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { Undo2 } from 'lucide-react';
import { type ComponentProps, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import type { SuccessResponse } from '@/common/types';
import { Role, type User, userSearchParamsSchema } from '@/common/types/api/user';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DataTableHeader, UserDataTable } from '@/components/ui/data-table';
import { userHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/users/deleted/');

export function ManageDeletedUsersPage() {
  const { user } = useAuth();
  const searchParams = userSearchParamsSchema.parse(route.useSearch());

  const { data: res, isLoading } = useQuery({
    queryKey: ['deleted-users', 'all', searchParams],
    queryFn: () => userHttpClient.getAllDeletedUsers(searchParams),
  });

  const [selectedUsers, setSelectedUsers] = useState<RowSelectionState>({});
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === Role.OWNER) {
      document.title = 'Deleted users | Internet Cafe Management';
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user!.role !== Role.OWNER) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.keys(selectedUsers).length === 0 || (
        <div className="flex justify-end">
          <Button onClick={() => setIsRestoreDialogOpen(true)}>
            <Undo2 className="size-4" /> Restore
          </Button>
        </div>
      )}
      <UserDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        onRowSelectionChange={setSelectedUsers}
        state={{
          rowSelection: selectedUsers,
        }}
        renderColumns={(existingColumns) => [
          ...existingColumns,
          {
            accessorKey: 'deleteTimestamp',
            header: ({ column }) => <DataTableHeader column={column} title="Deleted At" />,
            cell: ({ row }) => {
              const date = new Date(row.getValue<string>('createTimestamp'));
              const formattedDate = new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'long',
              }).format(date);

              return <span>{formattedDate}</span>;
            },
          },
        ]}
      />
      <UserRestoreDialog
        open={isRestoreDialogOpen}
        onOpenChange={setIsRestoreDialogOpen}
        userIds={Object.keys(selectedUsers)}
        onRestore={() => setSelectedUsers({})}
      />
    </div>
  );
}

interface UserRestoreDialogProps extends ComponentProps<typeof AlertDialog> {
  userIds: string[];
  onRestore?: (restoredUserIds: string[]) => void;
}

function UserRestoreDialog({ userIds, onRestore, ...props }: UserRestoreDialogProps) {
  const searchParams = userSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerRestoreUsers } = useMutation({
    mutationFn: async (userIds: string[]) => {
      const result = await Promise.allSettled(userIds.map((id) => userHttpClient.restoreUser(id)));
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({
        queryKey: ['deleted-users', 'all'],
      });
      const res = queryClient.getQueryData<SuccessResponse<User[]>>([
        'deleted-users',
        'all',
        searchParams,
      ]);
      if (res!.meta.pagination.page > res!.meta.pagination.totalPage) {
        navigate({
          to: '/users/deleted',
          search: {
            ...searchParams,
            page: res!.meta.pagination.totalPage,
          },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} deleted, ${rejected?.length || 0} failed`);
      onRestore?.(userIds);
    },
  });

  const handleRestore = async () => {
    await triggerRestoreUsers(userIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure to restore {userIds.length} deleted user(s)?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
