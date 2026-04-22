import { useRole } from '../pages/_app';
import { useRouter } from 'next/router';

const ROLE_META = {
  vet_lopez: { label: 'Dr. López', color: 'var(--vet)', badge: 'Veterinario' },
  vet_garcia: { label: 'Dra. García', color: 'var(--vet)', badge: 'Veterinario' },
  vet_mendez: { label: 'Dr. Méndez', color: 'var(--vet)', badge: 'Veterinario' },
  recepcion_user: { label: 'Recepción', color: 'var(--rec)', badge: 'Recepción' },
  admin_user: { label: 'Administrador', color: 'var(--adm)', badge: 'Admin' },
};

export default function Layout({ children }) {
  const { roleKey } = useRole();
  const router = useRouter();
  const meta = roleKey ? ROLE_META[roleKey] : null;

  const navItems = [
    { href: '/mascotas', icon: '🐾', label: 'Mascotas' },
    { href: '/vacunacion', icon: '💉', label: 'Vacunación' },
    { href: '/citas', icon: '📅', label: 'Citas' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>VetSecure</span>
          Base de Datos Avanzadas · Corte 3
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(item => (
            <button key={item.href} className={`nav-link ${router.pathname === item.href ? 'active' : ''}`} onClick={() => router.push(item.href)} > <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        {meta && (
          <div className="role-badge">
            <div className="label">Sesión activa</div>
            <div className="value" style={{ color: meta.color }}>{meta.label}</div>
            <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)'}}>
              rol: {meta.badge}
            </div>
          </div>
        )}
        <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={() => router.push('/')} >
          ← Cambiar rol
        </button>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}