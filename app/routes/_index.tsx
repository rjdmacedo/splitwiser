import { redirect } from "@remix-run/node";

export const loader = async () => {
  return redirect("friends");
};

// no-op
export default function AuthIndexPage() {}
