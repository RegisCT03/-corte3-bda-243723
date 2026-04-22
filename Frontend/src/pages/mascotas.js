import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRole } from './_app';
import Layout from '../components/Layout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function MascotasPage() {
  const { roleKey } = useRole();
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedWith, setSearchedWith] = useState('');

  useEffect(() => {
    if (!roleKey) router.push('/');
  }, [roleKey]);

  useEffect(() => {
    if (roleKey) fetchMascotas('');
  }, [roleKey]);

  async function fetchMascotas(nombre) {
    setLoading(true);
    setError(null);
    try {
      const params = nombre ? `?nombre=${encodeURIComponent(nombre)}` : '';
      const res = await fetch(`${API}/api/mascotas${params}`, {
        headers: { 'X-Role-Key': roleKey },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setMascotas(json.data);
      setSearchedWith(nombre);
    } catch (e) {
      setError(e.message);
      setMascotas([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchMascotas(busqueda);
  }

  const isVet = roleKey?.startsWith('vet_');

  return (
    <Layout>
      <div className="page-header">
        <h1>Mascotas</h1>
        <p>
          {isVet
            ? '🔒 RLS activo — solo ves las mascotas que tienes asignadas'
            : 'Vista completa — todas las mascotas del sistema'}
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{
          fontFamily:'Space Mono, monospace',
          fontSize:'0.7rem',
          color:'var(--text-muted)',
          marginBottom:'0.75rem',
          letterSpacing:'0.08em',
          textTransform:'uppercase',
        }}>
          🎯 Superficie de prueba · SQL Injection
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="input"
            placeholder="Buscar mascota... (prueba: ' OR '1'='1)"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}/>
          <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            Buscar
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => { setBusqueda(''); fetchMascotas(''); }}>
            Limpiar
          </button>
        </form>

        {searchedWith && (
          <div style={{
            marginTop:'0.75rem',
            fontFamily:'Space Mono, monospace',
            fontSize:'0.72rem',
            color:'var(--text-muted)',
          }}>
            Búsqueda:{' '}
            <span style={{ color: 'var(--accent)', background: 'rgba(0,229,160,0.08)', padding: '0.1rem 0.4rem', borderRadius: 3 }}>
              {searchedWith || '(todos)'}
            </span>
            {' '}— input enviado como parámetro <code style={{ color: 'var(--warn)' }}>$1</code> al driver pg, nunca concatenado
          </div>
        )}
      </div>

      <div style={{
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>
          Ataques de demo:
        </span>
        {[
          { label:"Quote-escape", val: "' OR '1'='1" },
          { label:"Stacked query", val: "'; DROP TABLE mascotas; --" },
          { label:"UNION-based", val: "' UNION SELECT null,null,null,null,null,null--" },
        ].map(a => (
          <button
            key={a.val}
            className="btn btn-ghost"
            style={{ fontSize: '0.7rem', padding: '0.3rem 0.75rem', fontFamily: 'Space Mono, monospace' }}
            onClick={() => { setBusqueda(a.val); }}>
            {a.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="error-box" style={{ marginBottom: '1rem' }}>
          ⚠ Error del servidor: {error}
        </div>
      )}

      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}>
          <div style={{ fontWeight: 700 }}>
            {loading ? 'Cargando...' : `${mascotas.length} mascota${mascotas.length !== 1 ? 's' : ''}`}
          </div>
          {isVet && (
            <span className="badge badge-blue">RLS · solo asignadas</span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Consultando...
          </div>
        ) : mascotas.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Sin resultados
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Especie</th>
                  <th>Nacimiento</th>
                  <th>Dueño</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {mascotas.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)' }}>
                      #{m.id}
                    </td>
                    <td style={{ fontWeight: 700 }}>{m.nombre}</td>
                    <td>
                      <span className={`badge ${m.especie === 'perro' ? 'badge-blue' : m.especie === 'gato' ? 'badge-purple' : 'badge-yellow'}`}>
                        {m.especie}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' }}>
                      {m.fecha_nacimiento ? new Date(m.fecha_nacimiento).toLocaleDateString('es-MX') : '—'}
                    </td>
                    <td>{m.dueno_nombre}</td>
                    <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {m.telefono}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem 1.25rem',
        background: 'rgba(0,229,160,0.04)',
        border: '1px solid rgba(0,229,160,0.12)',
        borderRadius: 8,
        fontFamily: 'Space Mono, monospace',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        lineHeight: 1.8,
      }}>
        <strong style={{ color: 'var(--accent)' }}>Defensa activa:</strong>{' '}
        El input de búsqueda viaja al backend como string crudo. En{' '}
        <code style={{ color: 'var(--warn)' }}>api/src/routes/mascotas.js:55</code>{' '}
        se ejecuta:<br />
        <code style={{ color: 'var(--text)' }}>
          client.query("SELECT ... WHERE m.nombre ILIKE $1", [`%{'$'}{'{nombre}'}%`])
        </code><br />
        El driver <strong>pg</strong> envía el valor como parámetro separado del SQL.
        PostgreSQL lo recibe como literal — nunca lo interpreta como SQL.
      </div>
    </Layout>
  );
}