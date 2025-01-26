import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { Undo2 } from 'lucide-react';
import { type ComponentProps, useState } from 'react';
import { toast } from 'sonner';

import { userSearchParamsSchema } from '@/common/types/api/user';
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

export function ManageDeletedUsersPage() {
  const searchParams = userSearchParamsSchema.parse(
    useSearch({ from: '/_non-auth-layout/users/deleted/' }),
  );

  const { data: res, isLoading } = useQuery({
    queryKey: ['deleted-users', searchParams],
    queryFn: () => userHttpClient.getAllDeletedUsers(searchParams),
  });

  const [selectedUsers, setSelectedUsers] = useState<RowSelectionState>({});
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

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
            header: ({ column }) => (
              <DataTableHeader column={column} title="Deleted At" />
            ),
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

function UserRestoreDialog({
  userIds,
  onRestore,
  ...props
}: UserRestoreDialogProps) {
  const queryClient = useQueryClient();

  const { mutateAsync: triggerRestoreUser } = useMutation({
    mutationFn: (id: string) => userHttpClient.restoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deleted-users'] });
    },
  });

  const handleRestore = async () => {
    const result = await Promise.allSettled(
      userIds.map((id) => triggerRestoreUser(id)),
    );
    const { fulfilled, rejected } = Object.groupBy(result, (r) => r.status);
    toast.info(
      `Result: ${fulfilled?.length || 0} restored, ${rejected?.length || 0} failed`,
    );
    onRestore?.(userIds);
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
