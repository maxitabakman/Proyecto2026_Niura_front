import { useEffect, useState, useRef } from 'react';
import type { Conversacion, Mensaje } from '../../interfaces/redcontactos';
import contactosMock from '../lomio/contactos.json';
import ContactoCard from './contactocard';
import { formatearFecha } from '../../utils/funcionparalafecha';

interface ConversacionConFecha extends Conversacion {
  updatedAt: number;
}

// 1. Definimos la interfaz para las props del componente
interface ChatSimplificadoProps {
  usuario_id: number;
}

// 2. Desestructuramos las props en la firma del componente
export default function ChatSimplificadomiopaciente({ usuario_id }: ChatSimplificadoProps) {
  const [contactos, setContactos] = useState<ConversacionConFecha[]>(() => {
    const tiempoBase = Date.now();
    return (contactosMock as Conversacion[]).map((c, index) => ({
      ...c,
      updatedAt: tiempoBase - index * 60000,
    }));
  });

  const [idActivo, setIdActivo] = useState<string>(
    (contactosMock as Conversacion[])[0]?.id_conversacion || ''
  );
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const mensajesEndRef = useRef<HTMLDivElement>(null);

  const contactoActivo =
    contactos.find((c) => c.id_conversacion === idActivo) || contactos[0];
  const mensajes = contactoActivo?.mensajes || [];

  const contactosConPuntuacion = [];
  for (let i = 0; i < contactos.length; i++) {
    const contacto = contactos[i];
    const ultimoMensaje = contacto.mensajes?.[contacto.mensajes.length - 1];
    const puntuacion = ultimoMensaje ? new Date(ultimoMensaje.fecha_envio).getTime() : 0;

    contactosConPuntuacion.push({
      ...contacto,
      puntuacion: puntuacion,
    });
  }

  const contactosFiltradosYOrdenados = contactosConPuntuacion
    .filter((c) => c.nombre_contacto.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => b.puntuacion - a.puntuacion);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes.length, idActivo]);

  const enviarMensaje = () => {
    if (!texto.trim() || !contactoActivo) return;

    const ahora = Date.now();
    const nuevoMensaje: Mensaje = {
      id_mensaje: `msg_${ahora}`,
      id_conversacion: contactoActivo.id_conversacion,
      id_emisor: usuario_id,
      id_receptor: contactoActivo.id_contacto,
      contenido: texto,
      estado_entrega: 'enviando',
      fecha_envio: new Date().toISOString(),
    };

    setContactos((prev) =>
      prev.map((c) =>
        c.id_conversacion === contactoActivo.id_conversacion
          ? {
              ...c,
              mensajes: [...(c.mensajes || []), nuevoMensaje],
              updatedAt: ahora,
            }
          : c
      )
    );

    setTexto('');
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
          {contactosFiltradosYOrdenados.map((contacto) => (
            <ContactoCard
              key={contacto.id_conversacion}
              contacto={contacto}
              esActivo={contacto.id_conversacion === idActivo}
              onClick={() => {
                setIdActivo(contacto.id_conversacion);
                setContactos((prev) =>
                  prev.map((c) =>
                    c.id_conversacion === contacto.id_conversacion
                      ? { ...c, mensajes_no_leidos: 0 }
                      : c
                  )
                );
              }}
            />
          ))}
        </div>
      </div>

      {/* ÁREA PRINCIPAL DEL CHAT */}
      <div className="flex-1 flex flex-col justify-between bg-[#182232] min-w-0">
        {/* Cabecera del chat */}
        <div className="bg-[#D3E2F3] px-5 py-2.5 flex items-center gap-3 border-b-2 border-black shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#D9D9D9] border-2 border-black flex items-center justify-center shrink-0 overflow-hidden">
            {contactoActivo?.avatar_contacto ? (
              <img
                src={contactoActivo.avatar_contacto}
                alt={contactoActivo.nombre_contacto}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#D9D9D9]" />
            )}
          </div>
          <h3 className="font-bold text-black text-base tracking-wide truncate">
            {contactoActivo?.nombre_contacto || 'Nombre de la Persona'}
          </h3>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {mensajes && mensajes.length > 0 ? (
            mensajes.map((msg) => {
              // Comparación lógica corregida para determinar si el mensaje es propio
              const esMio = msg.id_emisor === usuario_id;
              return (
                <div
                  key={msg.id_mensaje}
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
                    {formatearFecha(msg.fecha_envio)}
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
            className="w-10 h-10 bg-[#0085FF] border-2 border-black hover:bg-[#0072DB] text-white rounded-full flex items-center justify-center shrink-0 transition-all shadow-md active:scale-95"
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