import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/test/")({
  component: TestIndex,
});

function TestIndex() {
  const modules = import.meta.glob("./**/*.tsx", { eager: true });
  const pages = Object.keys(modules)
    .filter((p) => !p.endsWith("index.tsx"))
    .map((p) => {
      const file = p.replace("./", "").replace(".tsx", "");
      const to = `/test/${file}`;
      const title = file
        .split(/[-_/]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return { file, to, title };
    });

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Tests</h1>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pages.map(({ to, title }) => (
          <li key={to}>
            <Link
              to={to}
              className="block rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors"
            >
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
