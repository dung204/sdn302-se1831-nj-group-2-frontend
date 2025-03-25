import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { EyeIcon, Undo2 } from 'lucide-react';
import { type ComponentProps, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import type { SuccessResponse } from '@/common/types';
import { type Branch, branchSearchParamsSchema } from '@/common/types/api/branch';
import { Role } from '@/common/types/api/user';
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
import { BranchDataTable, DataTableHeader } from '@/components/ui/data-table';
import { branchHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/branches/deleted/');

export function ManageDeletedBranchesPage() {
  const { user } = useAuth();
  const searchParams = branchSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();

  const { data: res, isLoading } = useQuery({
    queryKey: ['deleted-branches', 'all', searchParams],
    queryFn: () => branchHttpClient.getAllDeletedBranches(searchParams),
  });

  const [selectedBranches, setSelectedBranches] = useState<RowSelectionState>({});
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === Role.OWNER) {
      document.title = 'Deleted branches | Internet Cafe Management';
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
      <div className="flex items-center justify-end gap-4">
        {Object.keys(selectedBranches).length > 0 && (
          <Button onClick={() => setIsRestoreDialogOpen(true)}>
            <Undo2 className="size-4" /> Restore selected
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate({ to: '/branches' })}>
          <EyeIcon className="size-4" /> View non-deleted branches
        </Button>
      </div>
      <BranchDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        onRowSelectionChange={setSelectedBranches}
        state={{
          rowSelection: selectedBranches,
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
      <BranchRestoreDialog
        open={isRestoreDialogOpen}
        onOpenChange={setIsRestoreDialogOpen}
        branchIds={Object.keys(selectedBranches)}
        onRestore={() => setSelectedBranches({})}
      />
    </div>
  );
}

interface BranchRestoreDialogProps extends ComponentProps<typeof AlertDialog> {
  branchIds: string[];
  onRestore?: (restoredBranchIds: string[]) => void;
}

function BranchRestoreDialog({ branchIds, onRestore, ...props }: BranchRestoreDialogProps) {
  const searchParams = branchSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerRestoreBranches } = useMutation({
    mutationFn: async (branchIds: string[]) => {
      const result = await Promise.allSettled(
        branchIds.map((id) => branchHttpClient.restoreBranch(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({
        queryKey: ['deleted-branches', 'all'],
      });
      const res = queryClient.getQueryData<SuccessResponse<Branch[]>>([
        'deleted-branches',
        'all',
        searchParams,
      ]);
      if (res!.meta.pagination.page > res!.meta.pagination.totalPage) {
        navigate({
          to: '/branches/deleted',
          search: {
            ...searchParams,
            page: res!.meta.pagination.totalPage,
          },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} deleted, ${rejected?.length || 0} failed`);
      onRestore?.(branchIds);
    },
  });

  const handleRestore = async () => {
    await triggerRestoreBranches(branchIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure to restore {branchIds.length} deleted branch(s)?
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
