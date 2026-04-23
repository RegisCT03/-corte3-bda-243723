import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRole } from './_app';
import Layout from '../components/Layout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function VacunacionPage() {
  const { roleKey } = useRole();
  const router = useRouter();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!roleKey) router.push('/');
    else fetchVacunacion();
  }, [roleKey]);

  async function fetchVacunacion() {
    setLoading(true);
    setError(null);
    const t0 = performance.now();
    try {
      const res  = await fetch(`${API}/api/vacunas/pendientes`, {
        headers: { 'X-Role-Key': roleKey },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      const latencia = Math.round(performance.now() - t0);
      const info = {
        source: json.source,
        elapsed_ms: json.elapsed_ms ?? latencia,
        latencia_ui: latencia,
        ts: new Date().toISOString(),
      };

      setData(json.data);
      setCacheInfo(info);
      setHistory(prev => [info, ...prev].slice(0, 5));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const isHit = cacheInfo?.source === 'cache';

  return (
    <Layout>
      <div className="page-header">
        <h1>Vacunación Pendiente</h1>
        <p>Mascotas sin vacunar o con vacuna vencida (+ de 1 año). Resultado cacheado en Redis.</p>
      </div>

      {cacheInfo && (
        <div className={`cache-bar ${isHit ? 'hit' : 'miss'}`}>
          <div className={`dot ${isHit ? 'dot-green' : 'dot-yellow'}`} />
          <strong>{isHit ? '⚡ CACHE HIT' : '🔄 CACHE MISS'}</strong>
          <span>—</span>
          <span>
            {isHit
              ? `Desde Redis · ${cacheInfo.latencia_ui}ms`
              : `Desde BD · ${cacheInfo.elapsed_ms}ms (BD) / ${cacheInfo.latencia_ui}ms (total)`}
          </span>
          <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.65rem' }}>
            {cacheInfo.ts}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={fetchVacunacion} disabled={loading}>
          {loading ? 'Consultando...' : '🔄 Refrescar consulta'}
        </button>
        <div style={{
          flex: 1,
          padding: '0.65rem 1rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          fontSize: '0.72rem',
          fontFamily: 'Space Mono, monospace',
          color: 'var(--text-muted)',
        }}>
          Key Redis: <code style={{ color: 'var(--accent)' }}>clinica:vacunacion_pendiente</code>{' '}
          · TTL: <code style={{ color: 'var(--warn)' }}>300s</code>{' '}
          · Invalidación: al aplicar vacuna
        </div>
      </div>

      {/* Log de requests */}
      {history.length > 1 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Historial de requests (últimas {history.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {history.map((h, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '1rem',
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.72rem',
                padding: '0.4rem 0.5rem',
                borderRadius: 4,
                background: i === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
              }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 24 }}>#{history.length - i}</span>
                <span style={{ color: h.source === 'cache' ? 'var(--accent)' : 'var(--warn)', minWidth: 70 }}>
                  {h.source === 'cache' ? '[HIT]' : '[MISS]'}
                </span>
                <span style={{ color: 'var(--text-muted)', flex: 1 }}>
                  {h.latencia_ui}ms frontend · {h.ts.slice(11, 23)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="error-box" style={{ marginBottom: '1rem' }}>⚠ {error}</div>
      )}

      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}>
          <div style={{ fontWeight: 700 }}>
            {loading ? 'Cargando...' : `${data.length} mascota${data.length !== 1 ? 's' : ''} con vacunación pendiente`}
          </div>
          <span className={`badge ${isHit ? 'badge-green' : 'badge-yellow'}`}>
            {isHit ? 'Redis' : 'PostgreSQL'}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Consultando...
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Sin pendientes 🎉
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mascota</th>
                  <th>Especie</th>
                  <th>Dueño</th>
                  <th>Teléfono</th>
                  <th>Última vacuna</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{row.mascota_nombre}</td>
                    <td>
                      <span className={`badge ${row.especie === 'perro' ? 'badge-blue' : row.especie === 'gato' ? 'badge-purple' : 'badge-yellow'}`}>
                        {row.especie}
                      </span>
                    </td>
                    <td>{row.dueno_nombre}</td>
                    <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {row.dueno_telefono}
                    </td>
                    <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' }}>
                      {row.ultima_vacuna
                        ? new Date(row.ultima_vacuna).toLocaleDateString('es-MX')
                        : <span style={{ color: 'var(--danger)' }}>Nunca</span>}
                    </td>
                    <td>
                      <span className={`badge ${row.ultima_vacuna ? 'badge-yellow' : 'badge-red'}`}>
                        {row.ultima_vacuna ? 'Vencida' : 'Sin vacunar'}
                      </span>
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
        lineHeight: 1.9,
      }}>
        <strong style={{ color: 'var(--accent)' }}>Demo de caché:</strong><br />
        1. Presiona <em>Refrescar</em> → 1er request: MISS (~100-300ms desde BD)<br />
        2. Presiona de nuevo → 2do request: HIT (~5-20ms desde Redis)<br />
        3. Ve a <strong>Citas</strong>, aplica una vacuna → Presiona Refrescar → MISS de nuevo (caché invalidado)<br />
        El código de invalidación está en{' '}
        <code style={{ color: 'var(--warn)' }}>api/src/routes/vacunas.js</code> función{' '}
        <code style={{ color: 'var(--accent)' }}>invalidateVacunacionCache()</code>
      </div>
    </Layout>
  );
}