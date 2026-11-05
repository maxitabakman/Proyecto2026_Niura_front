import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import ContactoCard from './contactocard';
import { formatearFecha } from '../../utils/funcionparalafecha';

interface ContactoBackend {
  id: number;
  nombre: string;
  apellido?: string;
  foto?: string;
  rol: number;
}

interface MensajeBackend {
  id: number | string;
  contenido: string;
  fecha: string;
  remitente: number;
  receptor: number;
}

interface ChatProps {
  usuario_id: number;
}

interface MensajeSocketResponse {
  ok: boolean;
  error?: string;
}

const API_BASE = 'http://localhost:3000';
const MAX_LARGO_MENSAJE = 2000;

function errorDe(error: unknown, alternativo: string) {
  return error instanceof Error ? error.message : alternativo;
}

export default function ChatSimplificadomiopaciente({ usuario_id }: ChatProps) {
  const [contactos, setContactos] = useState<ContactoBackend[]>([]);
  const [idActivo, setIdActivo] = useState<number | null>(null);
  const [mensajes, setMensajes] = useState<MensajeBackend[]>([]);
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [cargandoContactos, setCargandoContactos] = useState(
    () => Boolean(localStorage.getItem('token')),
  );
  const [errorContactos, setErrorContactos] = useState(
    () => localStorage.getItem('token') ? '' : 'Iniciá sesión para ver tus contactos.',
  );
  const [errorMensajes, setErrorMensajes] = useState('');
  const [errorConexion, setErrorConexion] = useState('');
  const [errorEnvio, setErrorEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);

  const mensajesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const conversacionRef = useRef<{ usuarioId: number; contactoId: number } | null>(null);

  const storedUserId = Number(localStorage.getItem('userId'));
  const currentUserId = Number.isFinite(storedUserId) && storedUserId > 0
    ? storedUserId
    : usuario_id;
  const getToken = () => localStorage.getItem('token') || '';

  useEffect(() => {
    conversacionRef.current = idActivo === null
      ? null
      : { usuarioId: currentUserId, contactoId: idActivo };
  }, [currentUserId, idActivo]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const controller = new AbortController();
    async function cargarContactos() {
      try {
        const respuesta = await fetch(`${API_BASE}/mensajes/contactos`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const cuerpo: { message?: string; contactos?: ContactoBackend[] } = await respuesta.json();
        if (!respuesta.ok) {
          throw new Error(cuerpo.message || `El servidor respondió ${respuesta.status}`);
        }
        if (!Array.isArray(cuerpo.contactos)) {
          throw new Error('El servidor devolvió una lista de contactos inválida.');
        }

        setContactos(cuerpo.contactos);
        setIdActivo((actual) => actual ?? cuerpo.contactos?.[0]?.id ?? null);
        setErrorContactos('');
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Error al cargar contactos:', error);
        setErrorContactos(errorDe(error, 'No se pudieron cargar los contactos.'));
      } finally {
        if (!controller.signal.aborted) setCargandoContactos(false);
      }
    }

    void cargarContactos();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (idActivo === null) return;

    const token = getToken();
    if (!token) return;

    const controller = new AbortController();
    async function cargarHistorial() {
      try {
        const respuesta = await fetch(`${API_BASE}/mensajes/historial/${idActivo}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const cuerpo: { message?: string; mensajes?: MensajeBackend[] } = await respuesta.json();
        if (!respuesta.ok) {
          throw new Error(cuerpo.message || `El servidor respondió ${respuesta.status}`);
        }
        if (!Array.isArray(cuerpo.mensajes)) {
          throw new Error('El servidor devolvió un historial inválido.');
        }

        setMensajes((anteriores) => {
          const porId = new Map(anteriores.map((mensaje) => [String(mensaje.id), mensaje]));
          cuerpo.mensajes?.forEach((mensaje) => porId.set(String(mensaje.id), mensaje));
          return [...porId.values()].sort(
            (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
          );
        });
        setErrorMensajes('');
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Error al cargar mensajes:', error);
        setErrorMensajes(errorDe(error, 'No se pudo cargar el historial.'));
      }
    }

    void cargarHistorial();
    return () => controller.abort();
  }, [idActivo]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = io(API_BASE, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => setErrorConexion(''));
    socket.on('connect_error', (error: Error) => {
      console.error('Error de conexión del chat:', error);
      setErrorConexion('No hay conexión en tiempo real. Revisá que el servidor esté activo.');
    });
    socket.on('recibir_mensaje_privado', (mensaje: MensajeBackend) => {
      const conversacion = conversacionRef.current;
      if (!conversacion) return;
      const perteneceALaConversacion =
        (String(mensaje.remitente) === String(conversacion.usuarioId)
          && String(mensaje.receptor) === String(conversacion.contactoId))
        || (String(mensaje.receptor) === String(conversacion.usuarioId)
          && String(mensaje.remitente) === String(conversacion.contactoId));
      if (!perteneceALaConversacion) return;

      setMensajes((actuales) => actuales.some(
        (existente) => String(existente.id) === String(mensaje.id),
      ) ? actuales : [...actuales, mensaje]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes.length]);

  const contactoActivo = contactos.find((contacto) => contacto.id === idActivo);
  const contactosFiltrados = contactos.filter((contacto) => {
    const nombreCompleto = `${contacto.nombre} ${contacto.apellido || ''}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  function seleccionarContacto(id: number) {
    setMensajes([]);
    setErrorMensajes('');
    setErrorEnvio('');
    setIdActivo(id);
  }

  function enviarMensaje() {
    const contenido = texto.trim();
    const socket = socketRef.current;
    if (!contenido || idActivo === null || enviando) return;
    if (contenido.length > MAX_LARGO_MENSAJE) {
      setErrorEnvio(`El mensaje no puede superar los ${MAX_LARGO_MENSAJE} caracteres.`);
      return;
    }
    if (!socket?.connected) {
      setErrorEnvio('No hay conexión con el servidor. El mensaje no se envió.');
      return;
    }

    setEnviando(true);
    setErrorEnvio('');
    socket.emit(
      'enviar_mensaje_privado',
      { receptorId: idActivo, contenido },
      (respuesta: MensajeSocketResponse) => {
        setEnviando(false);
        if (!respuesta?.ok) {
          setErrorEnvio(respuesta?.error || 'No se pudo enviar el mensaje.');
          return;
        }
        setTexto((actual) => actual === contenido ? '' : actual);
      },
    );
  }

  return (
    <div
      style={{ fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif' }}
      className="my-auto flex h-[62.89vh] min-h-[420px] w-[84.11vw] min-w-[340px] max-w-[1600px] overflow-hidden rounded-[10px] border-[12px] border-[#18243A] bg-[#182232] shadow-2xl transition-all duration-200"
    >
      <div className="flex w-1/3 min-w-[260px] max-w-[360px] shrink-0 flex-col gap-3 border-r-2 border-black bg-[#009490] p-3">
        <input
          type="text"
          placeholder="Buscar"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          className="w-full rounded-xl border-2 border-black bg-[#D9D9D9] px-3.5 py-2 text-sm font-semibold text-black placeholder-gray-700 outline-none focus:ring-2 focus:ring-black"
          aria-label="Buscar contacto"
        />

        <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto pr-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {cargandoContactos ? (
            <p className="mt-4 text-center text-xs text-white">Cargando contactos...</p>
          ) : errorContactos ? (
            <p className="mt-4 text-center text-xs text-white" role="alert">{errorContactos}</p>
          ) : contactosFiltrados.length === 0 ? (
            <p className="mt-4 text-center text-xs text-white">No tenés contactos disponibles.</p>
          ) : (
            contactosFiltrados.map((contacto) => (
              <ContactoCard
                key={contacto.id}
                contacto={{
                  id_conversacion: String(contacto.id),
                  id_contacto: contacto.id,
                  nombre_contacto: `${contacto.nombre} ${contacto.apellido || ''}`,
                  avatar_contacto: contacto.foto ?? '',
                  estado_presencia: 'offline',
                  mensajes_no_leidos: 0,
                  mensajes: [],
                }}
                esActivo={contacto.id === idActivo}
                onClick={() => seleccionarContacto(contacto.id)}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between bg-[#182232]">
        <div className="flex shrink-0 items-center gap-3 border-b-2 border-black bg-[#D3E2F3] px-5 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-black bg-[#D9D9D9]">
            {contactoActivo?.foto ? (
              <img
                src={contactoActivo.foto}
                alt={contactoActivo.nombre}
                className="h-full w-full object-cover"
              />
            ) : <div className="h-full w-full bg-[#D9D9D9]" />}
          </div>
          <h3 className="truncate text-base font-bold tracking-wide text-black">
            {contactoActivo
              ? `${contactoActivo.nombre} ${contactoActivo.apellido || ''}`
              : 'Seleccioná un contacto'}
          </h3>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {errorConexion && (
            <p className="text-center text-xs text-[#ffb4b4]" role="alert">{errorConexion}</p>
          )}
          {errorMensajes && (
            <p className="text-center text-xs text-[#ffb4b4]" role="alert">{errorMensajes}</p>
          )}
          {mensajes.length > 0 ? (
            mensajes.map((mensaje) => {
              const esMio = String(mensaje.remitente) === String(currentUserId);
              return (
                <div
                  key={mensaje.id}
                  className={`max-w-[75%] break-words rounded-2xl border-2 border-black/40 px-4 py-2.5 text-sm shadow-sm ${
                    esMio
                      ? 'self-end rounded-br-none bg-[#0085FF] text-white'
                      : 'self-start rounded-bl-none bg-[#D9D9D9] text-black'
                  }`}
                >
                  <p className="font-medium leading-snug">{mensaje.contenido}</p>
                  <div className={`mt-1 text-right text-[11px] font-bold ${
                    esMio ? 'text-blue-100' : 'text-gray-700'
                  }`}>
                    {formatearFecha(mensaje.fecha)}
                  </div>
                </div>
              );
            })
          ) : !errorMensajes && (
            <div className="m-auto text-center text-xs font-medium italic text-gray-300">
              No hay mensajes en esta conversación.
            </div>
          )}
          <div ref={mensajesEndRef} />
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t-2 border-black/30 bg-[#182232] p-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <input
              type="text"
              placeholder="Escribe acá tu mensaje"
              value={texto}
              maxLength={MAX_LARGO_MENSAJE}
              onChange={(evento) => {
                setTexto(evento.target.value);
                setErrorEnvio('');
              }}
              className="w-full rounded-xl border-2 border-black bg-[#D9D9D9] px-4 py-2.5 text-sm font-semibold text-black placeholder-gray-700 outline-none focus:ring-2 focus:ring-black"
              onKeyDown={(evento) => {
                if (evento.key === 'Enter') enviarMensaje();
              }}
              aria-label="Escribí un mensaje"
              disabled={idActivo === null || enviando}
            />
            {errorEnvio && <p className="mt-1 text-xs text-[#ffb4b4]" role="alert">{errorEnvio}</p>}
          </div>
          <button
            type="button"
            onClick={enviarMensaje}
            disabled={!texto.trim() || idActivo === null || enviando}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-black bg-[#0085FF] text-white shadow-md transition-all hover:bg-[#0072DB] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            title="Enviar mensaje"
            aria-label="Enviar mensaje"
          >
            <svg
              className="h-5 w-5 -translate-x-0.5 translate-y-0.5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
