import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { EyeIcon, Undo2 } from 'lucide-react';
import { type ComponentProps, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/common/hooks';
import type { SuccessResponse } from '@/common/types';
import {
  type ServiceCategory,
  serviceCategorySearchParamsSchema,
} from '@/common/types/api/service-category';
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
import { DataTableHeader, ServiceCategoryDataTable } from '@/components/ui/data-table';
import { serviceCategoryHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/service-categories/deleted/');

export function ManageDeletedServiceCategoriesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const searchParams = serviceCategorySearchParamsSchema.parse(route.useSearch());

  const { data: res, isLoading } = useQuery({
    queryKey: ['deleted-service-categories', 'all', searchParams],
    queryFn: () => serviceCategoryHttpClient.getAllDeletedServiceCategories(searchParams),
  });

  const [selectedCategories, setSelectedCategories] = useState<RowSelectionState>({});
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === Role.OWNER) {
      document.title = 'Deleted Service Categories | Internet Cafe Management';
    }
  }, [user]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-4">
        {Object.keys(selectedCategories).length > 0 && (
          <Button variant="danger" onClick={() => setIsRestoreDialogOpen(true)}>
            <Undo2 className="size-4" /> Restore selected
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate({ to: '/service-categories' })}>
          <EyeIcon className="size-4" /> View non-deleted categories
        </Button>
      </div>
      <ServiceCategoryDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        onRowSelectionChange={setSelectedCategories}
        state={{
          rowSelection: selectedCategories,
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
      <ServiceCategoryRestoreDialog
        open={isRestoreDialogOpen}
        onOpenChange={setIsRestoreDialogOpen}
        categoryIds={Object.keys(selectedCategories)}
        onRestore={() => setSelectedCategories({})}
      />
    </div>
  );
}

interface ServiceCategoryRestoreDialogProps extends ComponentProps<typeof AlertDialog> {
  categoryIds: string[];
  onRestore?: (restoredCategoryIds: string[]) => void;
}

function ServiceCategoryRestoreDialog({
  categoryIds,
  onRestore,
  ...props
}: ServiceCategoryRestoreDialogProps) {
  const searchParams = serviceCategorySearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: triggerRestoreCategories, isPending } = useMutation({
    mutationFn: async (categoryIds: string[]) => {
      const result = await Promise.allSettled(
        categoryIds.map((id) => serviceCategoryHttpClient.restoreServiceCategory(id)),
      );
      return Object.groupBy(result, (r) => r.status);
    },
    onSuccess: async ({ fulfilled, rejected }) => {
      await queryClient.invalidateQueries({
        queryKey: ['deleted-service-categories', 'all'],
      });
      const res = queryClient.getQueryData<SuccessResponse<ServiceCategory[]>>([
        'deleted-service-categories',
        'all',
        searchParams,
      ]);
      if (res && res.meta.pagination && res.meta.pagination.page > res.meta.pagination.totalPage) {
        navigate({
          to: '/service-categories/deleted',
          search: {
            ...searchParams,
            page: res.meta.pagination.totalPage,
          },
        });
      }
      toast.info(`Result: ${fulfilled?.length || 0} restored, ${rejected?.length || 0} failed`);
      onRestore?.(categoryIds);
    },
    onError: (error) => {
      toast.error(`Failed to restore service categories: ${error.message}`);
    },
  });

  const handleRestore = async () => {
    await triggerRestoreCategories(categoryIds);
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure to restore {categoryIds.length} deleted service categor
            {categoryIds.length > 1 ? 'ies' : 'y'}?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore} disabled={isPending}>
            Restore
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
