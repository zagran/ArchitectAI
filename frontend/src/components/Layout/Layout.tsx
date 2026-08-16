import { ReactNode } from 'react';
import { CpuChipIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
  user?: any;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export default function Layout({ children, user, isAuthenticated, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-secondary-200">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
          aria-label="Global"
        >
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">ArchitectAI</span>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded bg-primary-600 flex items-center justify-center mr-2">
                <CpuChipIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900">ArchitectAI</span>
            </div>
          </Link>

          <div className="flex items-center gap-x-6">
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/history"
                  className="text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
                >
                  History
                </Link>
                <Link
                  href="/app"
                  className="text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-sm text-secondary-400">{user.email}</span>
                <button
                  onClick={onLogout}
                  className="text-sm font-semibold text-secondary-600 hover:text-secondary-900 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/app"
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
