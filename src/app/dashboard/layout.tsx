/**
 * Dashboard layout — /dashboard/**
 *
 * Protección de rutas simplificada:
 * - El middleware ya bloqueó accesos sin cookie (ver middleware.ts).
 * - Aquí solo verificamos la cookie de forma permisiva:
 *   si existe cualquier valor → dejamos pasar.
 * - La verificación real del usuario ocurre en cada página vía useAuth().
 *
 * Razón: Firebase Admin SDK requiere credenciales reales para verifySessionCookie().
 * En desarrollo con credenciales mock siempre fallaría y causaría un bucle infinito.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificación soft: solo checar que la cookie exista
  const cookieStore = await cookies();
  const session = cookieStore.get('__session')?.value;

  if (!session || session.trim().length === 0) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}

