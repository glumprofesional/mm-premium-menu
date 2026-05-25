import { getAdminData } from './actions'
import AdminPageClient from './AdminPageClient'

export const metadata = {
  title: 'Administración — M&M Multiespacio',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const data = await getAdminData()

  return (
    <AdminPageClient
      initialCategories={data.categories}
      initialProducts={data.products}
    />
  )
}
