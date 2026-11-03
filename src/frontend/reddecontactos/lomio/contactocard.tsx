import type { Conversacion } from '../../interfaces/redcontactos';
import { formatearFecha } from '../../utils/funcionparalafecha';

interface ContactoCardProps {
  contacto: Conversacion;
  esActivo: boolean;
  onClick: () => void;
}

export default function ContactoCard({ contacto, esActivo, onClick }: ContactoCardProps) {
  const ultimoMensaje = contacto.mensajes?.[contacto.mensajes.length - 1];

  // Gradientes / colores exactos de Figma para activo e inactivo
  const estiloActivo = {
    background:
      'linear-gradient(0deg, rgba(2, 110, 255, 0.23), rgba(2, 110, 255, 0.23)), linear-gradient(0deg, #D3E2F3, #D3E2F3)',
  };

  const estiloInactivo = {
    background:
      'linear-gradient(0deg, rgba(242, 201, 76, 0.24), rgba(242, 201, 76, 0.24)), linear-gradient(0deg, #D3E2F3, #D3E2F3)',
  };

  return (
    <button
      onClick={onClick}
      style={{
        ...(esActivo ? estiloActivo : estiloInactivo),
        fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
      }}
      className={`w-full text-left p-3.5 rounded-2xl border-2 border-black flex items-center justify-between transition-all shadow-sm relative ${
        esActivo ? 'ring-2 ring-black font-semibold' : 'hover:opacity-95'
      }`}
    >
      <div className="flex flex-col min-w-0 flex-1 pr-2">
        {/* Nombre / Rol */}
        <span className="text-black text-base font-bold truncate leading-snug">
          {contacto.nombre_contacto}
        </span>

        {/* Último mensaje y fecha */}
        <div className="flex items-center justify-between gap-1 mt-1">
          <p className="truncate text-gray-800 text-xs font-medium flex-1">
            {ultimoMensaje ? ultimoMensaje.contenido : 'Sin mensajes'}
          </p>
          {ultimoMensaje && (
            <span className="text-xs text-gray-700 font-semibold shrink-0 ml-1">
              {formatearFecha(ultimoMensaje.fecha_envio)}
            </span>
          )}
        </div>
      </div>

      {/* Insignia de notificación */}
      {contacto.mensajes_no_leidos > 0 && (
        <span className="bg-[#FF0000] text-white font-black text-sm rounded-full h-7 min-w-[28px] px-1.5 flex items-center justify-center shrink-0 border border-black shadow-sm ml-1">
          +{contacto.mensajes_no_leidos}
        </span>
      )}
    </button>
  );
}