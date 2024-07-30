import { redirect } from "@remix-run/node";

export const loader = async () => {
  return redirect("/auth/friends");
};

export default function AuthIndexPage() {}
