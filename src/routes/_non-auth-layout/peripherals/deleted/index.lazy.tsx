import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_non-auth-layout/peripherals/deleted/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_non-auth-layout/peripherals/deleted/"!</div>;
}
