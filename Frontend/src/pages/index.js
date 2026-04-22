import { useState } from 'react';
import { useRouter } from 'next/router';
import { useRole } from './_app';

const ROLES = [
  {
    key: 'vet_lopez',
    name: 'Dr. Fernando López',
    sub: 'Veterinario · vet_id = 1',
    desc: 'Ve solo sus mascotas: Firulais, Toby, Max',
    color: 'var(--vet)',
    icon: '🩺',
  },
  {
    key: 'vet_garcia',
    name: 'Dra. Sofía García',
    sub: 'Veterinario · vet_id = 2',
    desc: 'Ve solo sus mascotas: Misifú, Luna, Dante',
    color: 'var(--vet)',
    icon: '🩺',
  },
  {
    key: 'vet_mendez',
    name: 'Dr. Andrés Méndez',
    sub: 'Veterinario · vet_id = 3',
    desc: 'Ve solo sus mascotas: Rocky, Pelusa, Coco, Mango',
    color: 'var(--vet)',
    icon: '🩺',
  },
  {
    key: 'recepcion_user',
    name: 'Recepción',
    sub: 'Personal de recepción',
    desc: 'Ve todas las mascotas y dueños. Sin acceso a vacunas.',
    color: 'var(--rec)',
    icon: '🖥️',
  },
  {
    key: 'admin_user',
    name: 'Administrador',
    sub: 'Acceso total',
    desc: 'Ve y gestiona todo el sistema.',
    color: 'var(--adm)',
    icon: '🔑',
  },
];

export default function LoginPage() {
  const [selected, setSelected] = useState(null);
  const { setRoleKey } = useRole();
  const router = useRouter();

  function handleEnter() {
    if (!selected) return;
    setRoleKey(selected.key);
    router.push('/mascotas');
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.7rem',
            color: 'var(--accent)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}>
            Base de Datos Avanzadas · Corte 3
          </div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: '2.5rem',
            letterSpacing: '-0.03em',
          }}>
            VetSecure
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Selecciona tu rol para iniciar sesión
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {ROLES.map(role => {
            const isSelected = selected?.key === role.key;
            return (
              <div
                key={role.key}
                onClick={() => setSelected(role)}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${isSelected ? role.color : 'var(--border)'}`,
                  borderRadius: 10,
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.15s',
                  transform: isSelected ? 'translateX(4px)' : 'none',
                  boxShadow: isSelected ? `0 0 0 1px ${role.color}22` : 'none',
                }}
              >
                <div style={{
                  fontSize: '1.5rem',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${role.color}15`,
                  borderRadius: 8,
                  flexShrink: 0,
                }}>
                  {role.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{role.name}</div>
                  <div style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '0.65rem',
                    color: role.color,
                    marginTop: '0.15rem',
                  }}>
                    {role.sub}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {role.desc}
                  </div>
                </div>
                {isSelected && (
                  <div style={{ color: role.color, fontSize: '1.2rem' }}>✓</div>
                )}
              </div>
            );
          })}
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem' }}
          onClick={handleEnter}
          disabled={!selected}
        >
          Entrar como {selected ? selected.name : '...'}
        </button>

        <div style={{
          marginTop: '1.5rem',
          padding: '0.75rem 1rem',
          background: 'rgba(0,229,160,0.05)',
          border: '1px solid rgba(0,229,160,0.15)',
          borderRadius: 6,
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}>
          💡 RLS activo: cada veterinario verá solo sus mascotas asignadas.<br/>
          El rol controla acceso a tablas
        </div>
      </div>
    </div>
  );
}