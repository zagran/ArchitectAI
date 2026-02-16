import Link from 'next/link';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function Custom404() {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
          <h1 className="text-6xl font-bold text-secondary-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-secondary-700 mb-6">
            Page Not Found
          </h2>
          <p className="text-secondary-600 mb-8 max-w-md">
            The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
          <div className="space-y-4">
            <Link href="/">
              <Button variant="primary" size="lg">
                <HomeIcon className="h-5 w-5 mr-2" />
                Go Home
              </Button>
            </Link>
            <div>
              <Link href="/projects" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Browse Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
