import { redirect } from "next/navigation";

export default function LoginPage() {
  // Redirect to landing page which now includes login
  return redirect("/");
}
