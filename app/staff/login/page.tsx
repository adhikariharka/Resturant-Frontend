import { redirect } from "next/navigation"

// Login is unified under /login. Keep this URL so existing QR codes / shortcuts
// still work.
export default function StaffLoginPage() {
  redirect("/login")
}
