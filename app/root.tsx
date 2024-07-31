import { cssBundleHref } from "@remix-run/css-bundle";
import { json, SerializeFrom } from "@remix-run/node";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  LiveReload,
  ScrollRestoration,
  useMatches,
} from "@remix-run/react";

import { Layout } from "~/components/layout";
import { getUser, requireUserId } from "~/session.server";
import stylesheet from "~/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ user: await getUser(request) });
};

export const useRootLoaderData = () => {
  const [root] = useMatches();
  return root?.data as SerializeFrom<typeof loader>;
};

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Layout>
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
