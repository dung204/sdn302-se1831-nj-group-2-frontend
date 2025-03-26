import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { EyeIcon, Undo2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableHeader, UserDataTable } from '@/components/ui/data-table';
import { userHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/staffs/deleted/');

export function ManageDeletedStaffsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // default search params object for staff
  const defaultSearchParams = {
    role: [Role.STAFF],
    branch: user?.branch?.id, // Assuming branch has an _id property
  };

  const searchParams = userSearchParamsSchema.parse({
    ...route.useSearch(),
    ...defaultSearchParams,
  });

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

  if (user!.role !== Role.BRANCH_ADMIN) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-4">
        {Object.keys(selectedUsers).length > 0 && (
          <Button onClick={() => setIsRestoreDialogOpen(true)}>
            <Undo2 className="size-4" /> Restore selected
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate({ to: '/staffs' })}>
          <EyeIcon className="size-4" /> View non-deleted staffs
        </Button>
      </div>
      <UserDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        onRowSelectionChange={setSelectedUsers}
        state={{
          rowSelection: selectedUsers,
        }}
        renderColumns={(existingColumns) => [
          {
            id: 'select',
            header: ({ table }) => (
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                title="Select all rows"
              />
            ),
            cell: ({ row }) => {
              if (row.original.id === user.id) {
                return <></>;
              }

              return (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  title="Select this row"
                />
              );
            },
            enableSorting: false,
            enableHiding: false,
            enableResizing: false,
          },
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // default search params object for staff
  const defaultSearchParams = {
    role: [Role.STAFF],
    branch: user?.branch?.id, // Assuming branch has an _id property
  };

  const searchParams = userSearchParamsSchema.parse({
    ...route.useSearch(),
    ...defaultSearchParams,
  });

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
          to: '/staffs/deleted',
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
