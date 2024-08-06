import { useMatches } from "@remix-run/react";

/**
 * Collects data under a certain key from useMatches
 * @param dataKey - The key in `event.data` to collect data from
 * @returns A merged object of the specified key
 *
 * @example
 * ```tsx
 * import {
 *   useDataFromMatches
 * } from '@shopify/hydrogen';
 *
 * export async function loader({request, context}: LoaderFunctionArgs) {
 *   return defer({
 *     analytics: {
 *       shopId: 'gid://shopify/Shop/1',
 *     },
 *   });
 * }
 *
 * export default function App() {
 *   const analytics = useDataFromMatches('analytics');
 *
 *   console.log(analytics);
 *   // {
 *   //   shopId: 'gid://shopify/Shop/1',
 *   // }
 * ```
 **/
export function useDataFromMatches(dataKey: string): Record<string, unknown> {
  const matches = useMatches();
  const data: Record<string, unknown> = {};

  matches.forEach((event) => {
    const eventData = event?.data;
    if (eventData && eventData[dataKey]) {
      Object.assign(data, eventData[dataKey]);
    }
  });

  return data;
}
