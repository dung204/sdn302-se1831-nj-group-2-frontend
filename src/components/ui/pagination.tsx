import { Link } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { type ComponentProps } from 'react';

import type { Pagination as PaginationMetadata } from '@/common/types';
import { type ButtonProps, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

interface PaginationProps {
  pagination: PaginationMetadata;
}

export function Pagination({ pagination }: PaginationProps) {
  const { page, pageSize, totalPage, hasNextPage, hasPreviousPage } =
    pagination;

  return (
    <PaginationContainer>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            // @ts-expect-error - `search` prop is not available
            search={{ page: page - 1, pageSize }}
            disabled={!hasPreviousPage}
            className={cn({
              'cursor-not-allowed opacity-60': !hasPreviousPage,
            })}
          />
        </PaginationItem>
        {page <= 1 || (
          <PaginationItem>
            <PaginationLink
              // @ts-expect-error - `search` prop is not available
              search={{ page: 1, pageSize }}
            >
              1
            </PaginationLink>
          </PaginationItem>
        )}
        {page > 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink to="#" isActive className="pointer-events-none">
            {page}
          </PaginationLink>
        </PaginationItem>
        {page < totalPage - 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {page === totalPage || totalPage === 0 || (
          <PaginationItem>
            <PaginationLink
              // @ts-expect-error - `search` prop is not available
              search={{ page: totalPage, pageSize }}
            >
              {totalPage}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            // @ts-expect-error - `search` prop is not available
            search={{ page: page + 1, pageSize }}
            disabled={!hasNextPage}
            className={cn({
              'cursor-not-allowed opacity-60': !hasNextPage,
            })}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationContainer>
  );
}

export function PaginationSkeleton() {
  return (
    <PaginationContainer>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled
            className="pointer-events-none opacity-60"
          />
        </PaginationItem>
        <PaginationItem>
          <Skeleton className="h-9 w-9" />
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis className="opacity-60" />
        </PaginationItem>
        <PaginationItem>
          <Skeleton className="h-9 w-9" />
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis className="opacity-60" />
        </PaginationItem>
        <PaginationItem>
          <Skeleton className="h-9 w-9" />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext disabled className="pointer-events-none opacity-60" />
        </PaginationItem>
      </PaginationContent>
    </PaginationContainer>
  );
}

function PaginationContainer({
  className,
  ...props
}: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}
PaginationContainer.displayName = 'PaginationContainer';

function PaginationContent({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  );
}
PaginationContent.displayName = 'PaginationContent';

function PaginationItem({ className, ...props }: ComponentProps<'li'>) {
  return <li className={cn('', className)} {...props} />;
}
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<typeof Link>;

function PaginationLink({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'select-none',
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}
PaginationLink.displayName = 'PaginationLink';

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn('gap-1 pl-2.5', className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Previous</span>
    </PaginationLink>
  );
}
PaginationPrevious.displayName = 'PaginationPrevious';

function PaginationNext({
  className,
  ...props
}: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn('gap-1 pr-2.5', className)}
      {...props}
    >
      <span>Next</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
}
PaginationNext.displayName = 'PaginationNext';

function PaginationEllipsis({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}
PaginationEllipsis.displayName = 'PaginationEllipsis';
