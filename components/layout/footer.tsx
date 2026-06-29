import Link from 'next/link';

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/add-company', label: 'Add Company' },
  { href: '/login', label: 'Sign In' },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <Link href="/" className="text-xl font-black tracking-tight">
              Pryro<span className="text-orange-500">.</span>
            </Link>
            <p className="mt-2 text-sm text-zinc-500">
              Verified service reviews for Rwanda.
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 border-t border-zinc-100 pt-6 text-center">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} Pryro Review. Built for Rwanda.
          </p>
        </div>
      </div>
    </footer>
  );
}
