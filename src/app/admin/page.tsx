import { getAdminData } from "./actions"
import AdminPageClient from "./AdminPageClient"

export const revalidate = 30

export default async function AdminPage() {
  const data = await getAdminData()
  return <AdminPageClient initialData={data} />
}