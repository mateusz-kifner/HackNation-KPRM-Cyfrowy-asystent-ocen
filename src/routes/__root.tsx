import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TooltipProvider } from "#/components/ui/tooltip";
import Header from "../components/Header";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "BlueVoid",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const lang = pathname === "/pl" || pathname.startsWith("/pl/") ? "pl" : "en";
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/** biome-ignore lint/security/noDangerouslySetInnerHtml: this is required */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="min-h-dvh flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
        >
          Skip to content
        </a>
        <div className="gradient-bg">
          <div className="base" />
          <div className="treatment" />
          <div className="glow" />
          <div className="vignette" />
          <div className="noise" />
        </div>
        <div className="flex min-h-dvh flex-col">
          <TooltipProvider>
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            {/*<Footer />*/}
          </TooltipProvider>
        </div>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />

        <Scripts />
      </body>
    </html>
  );
}
