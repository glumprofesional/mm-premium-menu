import { getAdminData, getUserRole } from "./actions"
import AdminPageClient from "./AdminPageClient"

export const revalidate = 30

export default async function AdminPage() {
  const data = await getAdminData()
  const role = await getUserRole()
  return <AdminPageClient initialData={data} role={role} />
}