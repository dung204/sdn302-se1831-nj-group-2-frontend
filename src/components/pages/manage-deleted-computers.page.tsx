import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { Undo2 } from 'lucide-react';
import { type ComponentProps, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import type { SuccessResponse } from '@/common/types';
import type { Computer } from '@/common/types/api/computer';
import { Role } from '@/common/types/api/user';
// Giả sử bạn đã có ComputerDataTable
import { computerSearchParamsSchema } from '@/common/types/api/user/computer-search-param.type';
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
import { ComputerDataTable, DataTableHeader } from '@/components/ui/data-table';
import { computerHttpClient } from '@/lib/http/computer.http';

const route = getRouteApi('/_non-auth-layout/computers/deleted/');
export function ManageDeletedComputersPage() {
  const { user } = useAuth();
  const [selectedComputers, setSelectedComputers] = useState<RowSelectionState>({});
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const searchParams = computerSearchParamsSchema.parse(route.useSearch());
  const { data: res, isLoading } = useQuery({
    queryKey: ['deleted-computers', 'all', searchParams],
    queryFn: () => computerHttpClient.getAllDeletedComputers(searchParams),
  });

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (![Role.BRANCH_ADMIN, Role.STAFF].includes(user.role)) {
    return <Navigate to="/" />;
  }
  return (
    <div className="flex flex-col gap-4">
      {Object.keys(selectedComputers).length === 0 || (
        <div className="flex justify-end">
          <Button onClick={() => setIsRestoreDialogOpen(true)}>
            <Undo2 className="size-4" /> Restore
          </Button>
        </div>
      )}
      <ComputerDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        onRowSelectionChange={setSelectedComputers}
        state={{
          rowSelection: selectedComputers,
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
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                title="Select this row"
              />
            ),
            enableSorting: false,
            enableHiding: false,
            enableResizing: false,
          },
          ...existingColumns,
          {
            accessorKey: 'deleteTimestamp',
            header: ({ column }) => <DataTableHeader column={column} title="Deleted At" />,
            cell: ({ row }) => {
              const date = new Date(row.getValue<string>('deleteTimestamp'));
              const formattedDate = new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'long',
              }).format(date);
              return <span>{formattedDate}</span>;
            },
          },
        ]}
      />
      <ComputerRestoreDialog
        open={isRestoreDialogOpen}
        onOpenChange={setIsRestoreDialogOpen}
        computerIds={Object.keys(selectedComputers)}
        onRestore={() => setSelectedComputers({})}
      />
    </div>
  );
}

interface ComputerRestoreDialogProps extends ComponentProps<typeof AlertDialog> {
  computerIds: string[];
  onRestore?: (restoredComputerIds: string[]) => void;
}

function ComputerRestoreDialog({ computerIds, onRestore, ...props }: ComputerRestoreDialogProps) {
  const searchParams = computerSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerRestoreComputers } = useMutation({
    mutationFn: async (computerIds: string[]) => {
      const result = await Promise.allSettled(
        computerIds.map((id) => computerHttpClient.restoreComputer(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({
        queryKey: ['deleted-computers', 'all'],
      });
      const res = queryClient.getQueryData<SuccessResponse<Computer[]>>([
        'deleted-computers',
        'all',
        searchParams,
      ]);
      if (res!.meta.pagination.page > res!.meta.pagination.totalPage) {
        navigate({
          to: '/computers/deleted',
          search: {
            ...searchParams,
            page: res!.meta.pagination.totalPage,
          },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} restored, ${rejected?.length || 0} failed`);
      onRestore?.(computerIds);
    },
  });

  const handleRestore = async () => {
    await triggerRestoreComputers(computerIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure to restore {computerIds.length} deleted computer(s)?
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
