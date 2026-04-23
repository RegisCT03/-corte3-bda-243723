import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRole } from './_app';
import Layout from '../components/Layout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CitasPage() {
  const { roleKey } = useRole();
  const router = useRouter();

  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    mascota_id: '', veterinario_id: '', fecha_hora: '', motivo: '',
  });

  useEffect(() => {
    if (!roleKey) router.push('/');
    else fetchCitas();
  }, [roleKey]);

  async function fetchCitas() {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/citas`, { headers: { 'X-Role-Key': roleKey } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCitas(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAgendar(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res  = await fetch(`${API}/api/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Role-Key': roleKey },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSuccess('Cita agendada exitosamente');
      setForm({ mascota_id: '', veterinario_id: '', fecha_hora: '', motivo: '' });
      fetchCitas();
    } catch (e) {
      setError(e.message);
    }
  }

  const isVet = roleKey?.startsWith('vet_');

  const estadoBadge = {
    AGENDADA: 'badge-blue',
    COMPLETADA: 'badge-green',
    CANCELADA: 'badge-red',
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Citas</h1>
        <p>{isVet ? '🔒 RLS activo — solo ves citas donde eres el veterinario asignado' : 'Todas las citas del sistema'}</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Agendar nueva cita
        </div>
        <form onSubmit={handleAgendar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input
            className="input"
            type="number"
            placeholder="ID Mascota"
            value={form.mascota_id}
            onChange={e => setForm(f => ({ ...f, mascota_id: e.target.value }))}
            required
          />
          <input
            className="input"
            type="number"
            placeholder="ID Veterinario"
            value={form.veterinario_id}
            onChange={e => setForm(f => ({ ...f, veterinario_id: e.target.value }))}
            required
          />
          <input
            className="input"
            type="datetime-local"
            value={form.fecha_hora}
            onChange={e => setForm(f => ({ ...f, fecha_hora: e.target.value }))}
            required
          />
          <input
            className="input"
            type="text"
            placeholder="Motivo de la cita"
            value={form.motivo}
            onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
          />
          <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>
            Agendar cita
          </button>
        </form>

        {error   && <div className="error-box" style={{ marginTop: '0.75rem' }}>⚠ {error}</div>}
        {success && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.65rem 1rem',
            background: 'rgba(0,229,160,0.08)',
            border: '1px solid rgba(0,229,160,0.2)',
            borderRadius: 6,
            color: 'var(--accent)',
            fontSize: '0.85rem',
            fontFamily: 'Space Mono, monospace',
          }}>
            ✓ {success}
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: '1rem' }}>
          {loading ? 'Cargando...' : `${citas.length} cita${citas.length !== 1 ? 's' : ''}`}
          {isVet && <span className="badge badge-blue" style={{ marginLeft: '0.75rem' }}>RLS activo</span>}
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Consultando...
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mascota</th>
                  <th>Veterinario</th>
                  <th>Fecha y hora</th>
                  <th>Motivo</th>
                  <th>Costo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {citas.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)' }}>#{c.id}</td>
                    <td style={{ fontWeight: 700 }}>{c.mascota_nombre}</td>
                    <td>{c.vet_nombre}</td>
                    <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' }}>
                      {new Date(c.fecha_hora).toLocaleString('es-MX')}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.motivo || '—'}</td>
                    <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.85rem' }}>
                      {c.costo ? `$${parseFloat(c.costo).toLocaleString('es-MX')}` : '—'}
                    </td>
                    <td>
                      <span className={`badge ${estadoBadge[c.estado] || 'badge-yellow'}`}>
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}