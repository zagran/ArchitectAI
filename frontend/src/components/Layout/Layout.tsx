import { Fragment, ReactNode, useState } from 'react';
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react';
import {
  ArrowPathIcon,
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  XMarkIcon,
  CloudIcon,
  CpuChipIcon,
  UserIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useRouter } from 'next/router';
import clsx from 'clsx';

const products = [
  { name: 'Architecture Generator', description: 'Create complete AWS architectures from requirements', href: '/projects/new', icon: CloudIcon },
  { name: 'Cost Analysis', description: 'Real-time cost calculation and optimization', href: '/cost-analysis', icon: ChartPieIcon },
  { name: 'Template Library', description: 'Pre-built architecture patterns and templates', href: '/templates', icon: SquaresPlusIcon },
  { name: 'Implementation Planning', description: 'Step-by-step deployment roadmaps', href: '/implementation', icon: CursorArrowRaysIcon },
];

const callsToAction = [
  { name: 'Watch demo', href: '#demo', icon: PlayCircleIcon },
  { name: 'Contact sales', href: '/contact', icon: PhoneIcon },
];

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ children, title, description }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Projects', href: '/projects' },
    { name: 'Templates', href: '/templates' },
    { name: 'Documentation', href: '/docs' },
  ];

  const userNavigation = [
    { name: 'Your Profile', href: '/profile' },
    { name: 'Settings', href: '/settings' },
    { name: 'Sign out', href: '/auth/logout' },
  ];

  const isCurrentPath = (path: string) => {
    if (path === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(path);
  };

  return (
    <div className="bg-white">
      <header className="relative isolate z-10">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">ArchitectAI</span>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded bg-primary-600 flex items-center justify-center mr-2">
                  <CpuChipIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-secondary-900">ArchitectAI</span>
              </div>
            </Link>
          </div>
          
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-secondary-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <Popover.Group className="hidden lg:flex lg:gap-x-12">
            <Popover className="relative">
              <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-secondary-900">
                Solutions
                <ChevronDownIcon className="h-5 w-5 flex-none text-secondary-400" aria-hidden="true" />
              </Popover.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-secondary-900/5">
                  <div className="p-4">
                    {products.map((item) => (
                      <div
                        key={item.name}
                        className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-secondary-50"
                      >
                        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-secondary-50 group-hover:bg-white">
                          <item.icon className="h-6 w-6 text-secondary-600 group-hover:text-primary-600" aria-hidden="true" />
                        </div>
                        <div className="flex-auto">
                          <Link href={item.href} className="block font-semibold text-secondary-900">
                            {item.name}
                            <span className="absolute inset-0" />
                          </Link>
                          <p className="mt-1 text-secondary-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-secondary-900/5 bg-secondary-50">
                    {callsToAction.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-secondary-900 hover:bg-secondary-100"
                      >
                        <item.icon className="h-5 w-5 flex-none text-secondary-400" aria-hidden="true" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>

            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'text-sm font-semibold leading-6 transition-colors',
                  isCurrentPath(item.href)
                    ? 'text-primary-600'
                    : 'text-secondary-900 hover:text-primary-600'
                )}
              >
                {item.name}
              </Link>
            ))}
          </Popover.Group>
          
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6">
            <Link href="/auth/login" className="text-sm font-semibold leading-6 text-secondary-900 hover:text-primary-600">
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/auth/register" className="btn btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </nav>
        
        <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <div className="fixed inset-0 z-10" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-secondary-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">ArchitectAI</span>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded bg-primary-600 flex items-center justify-center mr-2">
                    <CpuChipIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-secondary-900">ArchitectAI</span>
                </div>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-secondary-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-secondary-500/10">
                <div className="space-y-2 py-6">
                  <Disclosure as="div" className="-mx-3">
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-secondary-900 hover:bg-secondary-50">
                          Solutions
                          <ChevronDownIcon
                            className={clsx(open ? 'rotate-180' : '', 'h-5 w-5 flex-none')}
                            aria-hidden="true"
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="mt-2 space-y-2">
                          {[...products, ...callsToAction].map((item) => (
                            <Disclosure.Button
                              key={item.name}
                              as="a"
                              href={item.href}
                              className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-secondary-900 hover:bg-secondary-50"
                            >
                              {item.name}
                            </Disclosure.Button>
                          ))}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-secondary-900 hover:bg-secondary-50"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <Link
                    href="/auth/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-secondary-900 hover:bg-secondary-50"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="mt-2 block btn btn-primary w-full text-center"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>

      <main>
        {children}
      </main>

      <footer className="bg-white" aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-20 sm:pt-24 lg:px-8 lg:pt-32">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="grid grid-cols-2 gap-8 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold leading-6 text-secondary-900">Solutions</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <Link href="/projects/new" className="text-sm leading-6 text-secondary-600 hover:text-secondary-900">
                        Architecture Generator
                      </Link>
                    </li>
                    <li>
                      <Link href="/templates" className="text-sm leading-6 text-secondary-600 hover:text-secondary-900">
                        Template Library
                      </Link>
                    </li>
                    <li>
                      <Link href="/cost-analysis" className="text-sm leading-6 text-secondary-600 hover:text-secondary-900">
                        Cost Analysis
                      </Link>
                    </li>
                    <li>
                      <Link href="/implementation" className="text-sm leading-6 text-secondary-600 hover:text-secondary-900">
                        Implementation Planning
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm font-semibold leading-6 text-secondary-900">Support</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <Link href="/docs" className="text-sm leading-6 text-secondary-600 hover:text-secondary-900">
                        Documentation
                      </Link>
                    </li>
                    <li>
                      <Link href="/guides" className="text-sm leading-6 text-secondary-600 hover:text-secondary-900">
                        Guides
                      </Link>
                    </li>
                    <li>
                      <Link href="/api-reference" className="text-sm leading-6 text-secondary-600 hover:text-secondary-900">
                        API Reference
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold leading-6 text-secondary-900">Company</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <Link href="/about" className="text-sm leading-6 text-secondary-600 hover:text-secondary-900">
                        About
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog" className="text-sm leading-6 text-secondary-600 hover:text-secondary-900">
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link href="/careers" className="text-sm leading-6 text-secondary-600 hover:text-secondary-900">
                        Jobs
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm font-semibold leading-6 text-secondary-900">Legal</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <Link href="/privacy" className="text-sm leading-6 text-secondary-600 hover:text-secondary-900">
                        Privacy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-sm leading-6 text-secondary-600 hover:text-secondary-900">
                        Terms
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-10 xl:mt-0">
              <h3 className="text-sm font-semibold leading-6 text-secondary-900">
                Subscribe to our newsletter
              </h3>
              <p className="mt-2 text-sm leading-6 text-secondary-600">
                The latest news, articles, and resources about AI-powered cloud architecture.
              </p>
              <form className="mt-6 sm:flex sm:max-w-md">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  name="email-address"
                  id="email-address"
                  autoComplete="email"
                  required
                  className="w-full min-w-0 appearance-none rounded-md border-0 bg-white px-3 py-1.5 text-base text-secondary-900 shadow-sm ring-1 ring-inset ring-secondary-300 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:w-64 sm:text-sm sm:leading-6 xl:w-full"
                  placeholder="Enter your email"
                />
                <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="mt-16 border-t border-secondary-900/10 pt-8 sm:mt-20 md:flex md:items-center md:justify-between lg:mt-24">
            <p className="mt-8 text-xs leading-5 text-secondary-500 md:order-1 md:mt-0">
              &copy; 2024 ArchitectAI. Built for the Amazon Nova Hackathon. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
