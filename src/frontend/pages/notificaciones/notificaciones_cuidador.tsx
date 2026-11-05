import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

type TipoNotificacion = 'solicitud_vinculo' | 'mensaje_chat' | 'alerta_racha';

interface NotificacionCuidador {
  id: number | string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  pacienteId: number | null;
  creadoEn: string;
  leida: boolean;
}

interface RespuestaNotificaciones {
  message?: string;
  notificaciones?: NotificacionCuidador[];
}

const API_BASE = 'http://localhost:3000/acompanante/notificaciones';
const estiloEscala = {
  '--u': 'max(0.55px, calc(min(100vw / 1366, 100vh / 768)))',
} as CSSProperties;

function obtenerDestino(notificacion: NotificacionCuidador) {
  if (notificacion.tipo === 'mensaje_chat') return '/cuidador/reddecontactosmia';
  return '/cuidador/paginagralcuidador';
}

export default function NoticiasCuidador() {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState<NotificacionCuidador[]>([]);
  const [cargando, setCargando] = useState(() => Boolean(localStorage.getItem('token')));
  const [error, setError] = useState<string | null>(() =>
    localStorage.getItem('token') ? null : 'Iniciá sesión para ver tus notificaciones.',
  );
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
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
        console.error('Error al cargar las notificaciones del cuidador:', fallo);
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

  async function abrirNotificacion(notificacion: NotificacionCuidador) {
    const id = String(notificacion.id);
    if (procesandoId !== null) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setMensajeEstado('Tu sesión venció. Iniciá sesión nuevamente.');
      return;
    }

    setProcesandoId(id);
    setMensajeEstado('');
    try {
      const respuesta = await fetch(`${API_BASE}/${id}/leida`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const datos: { message?: string } = await respuesta.json();
      if (!respuesta.ok) {
        throw new Error(datos.message || `El servidor respondió ${respuesta.status}.`);
      }

      setNotificaciones((actuales) =>
        actuales.map((actual) =>
          String(actual.id) === id ? { ...actual, leida: true } : actual,
        ),
      );
      navigate(obtenerDestino(notificacion));
    } catch (fallo) {
      console.error('Error al abrir la notificación del cuidador:', fallo);
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
    <section
      style={estiloEscala}
      className="mx-auto w-[calc(var(--u)*903)] max-w-full font-[Helvetica,Arial,sans-serif]"
    >
      <div className="min-h-[calc(var(--u)*500)] rounded-[calc(var(--u)*10)] bg-[#b3d9e6] px-[calc(var(--u)*24)] py-[calc(var(--u)*40)] shadow-[0_4px_8px_rgba(0,0,0,0.3)] md:pl-[calc(var(--u)*47)] md:pt-[calc(var(--u)*40)]">
        <h1 className="mb-[calc(var(--u)*20)] text-[length:calc(var(--u)*26)] font-bold text-[#18243b]">
          Notificaciones
        </h1>
        {cargando && (
          <p role="status" className="text-[length:calc(var(--u)*22)] text-[#4b5c78]">
            Cargando notificaciones...
          </p>
        )}
        {error && (
          <p role="alert" className="text-[length:calc(var(--u)*22)] text-[#a32020]">
            {error}
          </p>
        )}
        {mensajeEstado && (
          <p role="alert" className="mb-[calc(var(--u)*12)] text-[length:calc(var(--u)*18)] text-[#a32020]">
            {mensajeEstado}
          </p>
        )}
        {!cargando && !error && ordenadas.length === 0 && (
          <p className="text-[length:calc(var(--u)*22)] text-black">No hay notificaciones.</p>
        )}

        {!cargando && !error && (
          <ul className="flex w-[calc(var(--u)*655)] max-w-full flex-col gap-[calc(var(--u)*12)]">
            {ordenadas.map((notificacion) => (
              <li key={notificacion.id}>
                <button
                  type="button"
                  disabled={procesandoId !== null}
                  onClick={() => void abrirNotificacion(notificacion)}
                  className={`flex min-h-[calc(var(--u)*70)] w-full items-center justify-between gap-[calc(var(--u)*12)] rounded-[calc(var(--u)*10)] px-[calc(var(--u)*23)] py-[calc(var(--u)*10)] text-left text-black shadow-[0_3px_4px_rgba(0,0,0,0.3)] disabled:opacity-60 ${
                    notificacion.leida ? 'bg-[#c6d9e9]' : 'bg-[#ddeafd]'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[length:calc(var(--u)*18)] font-bold">
                      {notificacion.titulo}
                    </span>
                    <span className="mt-[calc(var(--u)*6)] block text-[length:calc(var(--u)*15)] leading-tight">
                      {notificacion.mensaje}
                    </span>
                    <time
                      dateTime={notificacion.creadoEn}
                      className="mt-[calc(var(--u)*8)] block text-[length:calc(var(--u)*12)] text-[#4b5c78]"
                    >
                      {new Date(notificacion.creadoEn).toLocaleString()}
                    </time>
                  </span>
                  {!notificacion.leida && (
                    <span className="shrink-0 rounded-full bg-[#079f9e] px-[calc(var(--u)*12)] py-[calc(var(--u)*4)] text-[length:calc(var(--u)*13)] font-bold text-white">
                      Nueva
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
