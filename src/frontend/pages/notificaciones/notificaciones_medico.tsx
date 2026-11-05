import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NotificacionMedico {
  id: number;
  tipo: 'solicitud_vinculo' | 'mensaje_chat' | 'alerta_racha';
  titulo: string;
  mensaje: string;
  pacienteId: number | null;
  creadoEn: string;
  leida: boolean;
}

interface RespuestaNotificaciones {
  message?: string;
  notificaciones?: NotificacionMedico[];
}

const API_BASE = 'http://localhost:3000/doctor/notificaciones';

function obtenerDestino(notificacion: NotificacionMedico) {
  if (notificacion.tipo === 'mensaje_chat') return '/medico/reddecontactosmia';
  if (notificacion.tipo === 'alerta_racha' && notificacion.pacienteId) {
    return `/medico/pacient/${notificacion.pacienteId}/progreso`;
  }
  return '/medico/pacient';
}

export default function NotificacionesMedico() {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState<NotificacionMedico[]>([]);
  const [cargando, setCargando] = useState(() => Boolean(localStorage.getItem('token')));
  const [error, setError] = useState<string | null>(() =>
    localStorage.getItem('token') ? null : 'Iniciá sesión para ver tus notificaciones.',
  );
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [mensajeEstado, setMensajeEstado] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const controlador = new AbortController();
    async function cargarNotificaciones() {
      try {
        const respuesta = await fetch(API_BASE, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controlador.signal,
        });
        const datos: RespuestaNotificaciones = await respuesta.json();
        if (!respuesta.ok) {
          throw new Error(datos.message || `El servidor respondió ${respuesta.status}.`);
        }
        if (!Array.isArray(datos.notificaciones)) {
          throw new Error('El servidor devolvió una lista de notificaciones inválida.');
        }

        setNotificaciones(datos.notificaciones);
        setError(null);
      } catch (fallo) {
        if (controlador.signal.aborted) return;
        console.error('Error al cargar las notificaciones del médico:', fallo);
        setError(
          fallo instanceof Error
            ? fallo.message
            : 'No se pudieron cargar las notificaciones.',
        );
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    void cargarNotificaciones();
    const intervalo = window.setInterval(() => void cargarNotificaciones(), 30_000);
    window.addEventListener('focus', cargarNotificaciones);
    return () => {
      controlador.abort();
      window.clearInterval(intervalo);
      window.removeEventListener('focus', cargarNotificaciones);
    };
  }, []);

  async function abrirNotificacion(notificacion: NotificacionMedico) {
    if (procesandoId !== null) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setMensajeEstado('Tu sesión venció. Iniciá sesión nuevamente.');
      return;
    }

    setProcesandoId(notificacion.id);
    setMensajeEstado('');
    try {
      const respuesta = await fetch(`${API_BASE}/${notificacion.id}/leida`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const datos: { message?: string } = await respuesta.json();
      if (!respuesta.ok) {
        throw new Error(datos.message || `El servidor respondió ${respuesta.status}.`);
      }

      setNotificaciones((actuales) =>
        actuales.map((actual) =>
          actual.id === notificacion.id ? { ...actual, leida: true } : actual,
        ),
      );
      navigate(obtenerDestino(notificacion));
    } catch (fallo) {
      console.error('Error al abrir la notificación:', fallo);
      setMensajeEstado(
        fallo instanceof Error
          ? fallo.message
          : 'No se pudo actualizar la notificación.',
      );
    } finally {
      setProcesandoId(null);
    }
  }

  const ordenadas = [...notificaciones].sort(
    (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(),
  );

  return (
    <section className="mx-auto mt-8 w-full max-w-[903px] px-4 sm:mt-[60px] sm:px-0">
      <div className="h-[501px] max-h-[calc(100vh-140px)] min-h-[320px] rounded-[10px] bg-[#b3d9e6] px-4 py-8 shadow-[0_4px_8px_rgba(0,0,0,0.3)] sm:pl-[47px] sm:pr-6 sm:pt-[40px]">
        <h1 className="mb-5 text-2xl font-bold text-[#18243b]">Notificaciones</h1>
        <div className="h-[calc(100%-56px)] overflow-y-auto pr-3 [scrollbar-color:#d9d9d9_#b3d9e6] [scrollbar-width:thin]">
          {cargando && (
            <p role="status" className="text-lg text-[#4b5c78]">
              Cargando notificaciones...
            </p>
          )}
          {error && <p role="alert" className="text-lg text-red-700">{error}</p>}
          {mensajeEstado && (
            <p role="alert" className="mb-3 text-lg text-red-700">{mensajeEstado}</p>
          )}
          {!cargando && !error && ordenadas.length === 0 && (
            <p className="text-lg text-black">No tenés notificaciones.</p>
          )}

          {!cargando && !error && (
            <ul className="flex w-full flex-col gap-3 pb-4">
              {ordenadas.map((notificacion) => (
                <li key={notificacion.id}>
                  <button
                    type="button"
                    disabled={procesandoId !== null}
                    onClick={() => void abrirNotificacion(notificacion)}
                    className={`flex min-h-[70px] w-full items-center justify-between gap-3 rounded-[10px] px-5 py-3 text-left text-black shadow-[0_3px_4px_rgba(0,0,0,0.3)] disabled:opacity-60 ${
                      notificacion.leida ? 'bg-[#c6d9e9]' : 'bg-[#ddeafd]'
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-bold">{notificacion.titulo}</span>
                      <span className="mt-1 block text-base leading-tight">{notificacion.mensaje}</span>
                      <time
                        dateTime={notificacion.creadoEn}
                        className="mt-2 block text-sm text-[#4b5c78]"
                      >
                        {new Date(notificacion.creadoEn).toLocaleString()}
                      </time>
                    </span>
                    {!notificacion.leida && (
                      <span className="shrink-0 rounded-full bg-[#079f9e] px-3 py-1 text-sm font-bold text-white">
                        Nueva
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
