/**
 * Admin layout — /admin/**
 *
 * Protección en dos capas:
 * 1. Middleware ya bloqueó accesos sin cookie __session.
 * 2. Aquí verificamos existencia de cookie (soft check, sin Admin SDK).
 * 3. La verificación de ROL se hace en cada página admin vía useAuth() client-side.
 *
 * ¿Por qué no usamos Admin SDK aquí?
 * verifySessionCookie() requiere credenciales reales de Firebase Admin.
 * En desarrollo con .env.local de mock, siempre falla y crea un bucle.
 * En producción, con credenciales reales, puedes reactivar la verificación completa.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

function AdminSidebarWrapper() {
  return <AdminSidebar />;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('__session')?.value;

  // Sin cookie → redirigir al login
  if (!session || session.trim().length === 0) {
    redirect('/login?callbackUrl=/admin');
  }

  // Con cookie → dejar pasar. Cada página admin usa useAuth() para verificar el rol.
  // Si el usuario logueado no es admin, las páginas admin muestran "sin acceso".
  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(160deg, #F5F7FF 0%, #F5F5F7 100%)' }}>
      <AdminSidebarWrapper />
      <main className="flex-1 min-w-0 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

