import { Link } from '@tanstack/react-router';
import { useEffect } from 'react';

export function NotFoundPage() {
  useEffect(() => {
    document.title = '404 Not Found | Internet Cafe Management';
  }, []);

  return (
    <div className="flex h-svh w-full flex-col items-center justify-center gap-8">
      <h1 className="text-9xl font-extrabold">404</h1>
      <p className="text-lg">The page you're looking for is not found.</p>
      <Link className="text-lg text-blue-500 underline" to="/" reloadDocument>
        Back to dashboard
      </Link>
    </div>
  );
}
