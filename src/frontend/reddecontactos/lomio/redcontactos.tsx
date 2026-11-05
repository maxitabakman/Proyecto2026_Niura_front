import { useEffect, useState, useRef } from 'react';
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

const API_BASE = "http://localhost:3000";

export default function ChatSimplificadomiopaciente({ usuario_id }: ChatProps) {
  const [contactos, setContactos] = useState<ContactoBackend[]>([]);
  const [idActivo, setIdActivo] = useState<number | null>(null);
  const [mensajes, setMensajes] = useState<MensajeBackend[]>([]);
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [cargandoContactos, setCargandoContactos] = useState(true);

  const mensajesEndRef = useRef<HTMLDivElement>(null);

  const getToken = () => localStorage.getItem('token') || '';

  // 1. Cargar lista de contactos reales al montar
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetch(`${API_BASE}/mensajes/contactos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.contactos)) {
          setContactos(data.contactos);
          if (data.contactos.length > 0) {
            setIdActivo(data.contactos[0].id);
          }
        }
      })
      .catch((err) => console.error("Error al cargar contactos:", err))
      .finally(() => setCargandoContactos(false));
  }, []);

  // 2. Cargar historial de mensajes al cambiar de contacto activo
  useEffect(() => {
    if (!idActivo) return;
    const token = getToken();

    fetch(`${API_BASE}/mensajes/historial/${idActivo}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.mensajes)) {
          setMensajes(data.mensajes);
        }
      })
      .catch((err) => console.error("Error al cargar mensajes:", err));
  }, [idActivo]);

  // Autoscroll hacia abajo al recibir/enviar mensajes
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes.length]);

  const contactoActivo = contactos.find((c) => c.id === idActivo);

  const contactosFiltrados = contactos.filter((c) => {
    const nombreCompleto = `${c.nombre} ${c.apellido || ''}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  // 3. Enviar mensaje a la BD
  const enviarMensaje = async () => {
    if (!texto.trim() || !idActivo) return;

    const token = getToken();
    const contenidoEnviado = texto.trim();
    setTexto('');

    try {
      const res = await fetch(`${API_BASE}/mensajes/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receptorId: idActivo,
          contenido: contenidoEnviado
        })
      });

      const data = await res.json();
      if (res.ok && data.mensaje) {
        setMensajes((prev) => [...prev, data.mensaje]);
      }
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    }
  };

  return (
    <div
      style={{ fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif' }}
      className="flex w-[84.11vw] h-[62.89vh] min-w-[340px] min-h-[420px] max-w-[1600px] border-[12px] border-[#18243A] rounded-[10px] overflow-hidden bg-[#182232] shadow-2xl transition-all duration-200 my-auto"
    >
      {/* COLUMNA LATERAL DE CONTACTOS */}
      <div className="w-1/3 min-w-[260px] max-w-[360px] bg-[#009490] p-3 flex flex-col gap-3 border-r-2 border-black shrink-0">
        <div className="w-full">
          <input
            type="text"
            placeholder="Buscar"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#D9D9D9] border-2 border-black rounded-xl px-3.5 py-2 text-sm text-black font-semibold placeholder-gray-700 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex flex-col gap-2.5 overflow-y-auto pr-0.5 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {cargandoContactos ? (
            <p className="text-white text-xs text-center mt-4">Cargando contactos...</p>
          ) : contactosFiltrados.length === 0 ? (
            <p className="text-white text-xs text-center mt-4">No tenés contactos disponibles.</p>
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
                  mensajes: []
                }}
                esActivo={contacto.id === idActivo}
                onClick={() => setIdActivo(contacto.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ÁREA PRINCIPAL DEL CHAT */}
      <div className="flex-1 flex flex-col justify-between bg-[#182232] min-w-0">
        {/* Cabecera del chat */}
        <div className="bg-[#D3E2F3] px-5 py-2.5 flex items-center gap-3 border-b-2 border-black shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#D9D9D9] border-2 border-black flex items-center justify-center shrink-0 overflow-hidden">
            {contactoActivo?.foto ? (
              <img
                src={contactoActivo.foto}
                alt={contactoActivo.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#D9D9D9]" />
            )}
          </div>
          <h3 className="font-bold text-black text-base tracking-wide truncate">
            {contactoActivo ? `${contactoActivo.nombre} ${contactoActivo.apellido || ''}` : 'Seleccioná un contacto'}
          </h3>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {mensajes.length > 0 ? (
            mensajes.map((msg) => {
              const esMio = msg.remitente === usuario_id;
              return (
                <div
                  key={msg.id}
                  className={`px-4 py-2.5 rounded-2xl text-sm max-w-[75%] break-words border-2 border-black/40 shadow-sm ${
                    esMio
                      ? 'bg-[#0085FF] text-white self-end rounded-br-none'
                      : 'bg-[#D9D9D9] text-black self-start rounded-bl-none'
                  }`}
                >
                  <p className="leading-snug font-medium">{msg.contenido}</p>
                  <div
                    className={`text-[11px] mt-1 text-right font-bold ${
                      esMio ? 'text-blue-100' : 'text-gray-700'
                    }`}
                  >
                    {formatearFecha(msg.fecha)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="m-auto text-center text-xs text-gray-300 italic font-medium">
              No hay mensajes en esta conversación.
            </div>
          )}
          <div ref={mensajesEndRef} />
        </div>

        {/* Campo de mensaje y botón Enviar */}
        <div className="p-3 bg-[#182232] flex items-center gap-3 shrink-0 border-t-2 border-black/30">
          <input
            type="text"
            placeholder="Escribe acá tu mensaje"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="flex-1 bg-[#D9D9D9] border-2 border-black rounded-xl px-4 py-2.5 text-sm text-black font-semibold placeholder-gray-700 outline-none focus:ring-2 focus:ring-black"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                enviarMensaje();
              }
            }}
          />
          <button
            onClick={enviarMensaje}
            className="w-10 h-10 bg-[#0085FF] border-2 border-black hover:bg-[#0072DB] text-white rounded-full flex items-center justify-center shrink-0 transition-all shadow-md active:scale-95 cursor-pointer"
            title="Enviar mensaje"
          >
            <svg
              className="w-5 h-5 -translate-x-0.5 translate-y-0.5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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