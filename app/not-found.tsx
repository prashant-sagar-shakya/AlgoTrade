import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold text-primary mb-4 font-mono uppercase tracking-tighter">404 - Space Empty</h1>
      <p className="text-muted-foreground mb-8">The market signal you followed has expired or doesn't exist.</p>
      <Link href="/" className="px-6 py-2 bg-primary text-white rounded-md font-bold uppercase text-xs hover:brightness-110 active:scale-95 transition-all">
        Return to Dashboard
      </Link>
    </div>
  );
}
