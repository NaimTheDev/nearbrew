import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-16 text-center">
      <img
        src="/404_not_found.png"
        alt="Page not found illustration"
        className="max-w-lg w-full mb-10 drop-shadow-lg"
      />


      <h1 className="text-4xl font-semibold mb-4">Whoops, We can&rsquo;t find that page</h1>
      <p className="text-muted-foreground max-w-2xl mb-10">
        Let&rsquo;s take you back to finding your next coffee shop.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium shadow transition hover:bg-primary/90"
      >
        Return home
      </Link>
    </main>
  );
}

export default NotFoundPage;
