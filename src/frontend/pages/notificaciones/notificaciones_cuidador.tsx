import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

/* ================================================================== */
/* TIPOS: así llega cada notificación del back                         */
/* ================================================================== */
export type TipoNotificacion =
  | "emergencia_ambulancia"
  | "solicitud_vinculo"
  | "mensaje_chat"
  | "alerta_racha";

export type PrioridadNotificacion = "alta" | "media" | "baja";

export interface Remitente {
  nombre: string;
  apellido: string;
  avatar_url: string;
}

export interface Redireccion {
  ruta: string;
  id_referencia: number;
}

export interface DatosBackNotificacion {
  id_notificacion: number;
  tipo: TipoNotificacion;
  prioridad: PrioridadNotificacion;
  titulo: string;
  mensaje: string;
  remitente: Remitente;
  fecha_envio: string;
  leida: boolean;
  redireccion?: Redireccion;
}

/* ================================================================== */
/* BACK (mocki)                                                        */
/*                                                                     */
/* Formato propuesto para el back real:                                */
/*  notificaciones → DatosBackNotificacion[]                           */
/*  (directamente la lista, sin objeto alrededor; son todas las        */
/*   notificaciones, sin filtrar por tipo de usuario)                  */
/*  eliminar notificación → { id_notificacion }                        */
/*  (se llama al tocar una notificación, antes de redirigir)           */
/* ================================================================== */
const URL_NOTIFICACIONES = "https://mocki.io/v1/f0be5fa9-b312-4338-8e26-e3fdea68030c";
// Mocki que responde {"data":"ok"}
const URL_ELIMINAR_NOTIFICACION = "https://mocki.io/v1/d42ede49-cf64-42f1-8da6-d7f40d7236b5";

// Mocki solo acepta GET, así que los datos van en la URL.
// Con el back real: pasar a POST/DELETE con los datos en el body.
async function pedir(url: string, datos?: Record<string, string>) {
  const consulta = datos ? `?${new URLSearchParams(datos)}` : "";
  const respuesta = await fetch(`${url}${consulta}`);
  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
  return respuesta.json();
}

// Le pide al back que saque la notificación (le pasamos el id de la que se tocó)
async function eliminarEnBack(idNotificacion: number) {
  const respuesta = await pedir(URL_ELIMINAR_NOTIFICACION, {
    id_notificacion: String(idNotificacion),
  });
  // SOLO PRUEBAS: el mocki responde {"data":"ok"}. Borrar con el back real.
  if (respuesta?.data !== "ok") throw new Error("Respuesta inesperada");
}

/* ================================================================== */
/* PANTALLA                                                            */
/* ================================================================== */
const ESCALA = 1;
const estiloEscala = {
  "--u": `max(0.55px, calc(min(100vw / 1366, 100vh / 768) * ${ESCALA}))`,
} as CSSProperties;

export default function Noticias() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [notificaciones, setNotificaciones] = useState<DatosBackNotificacion[]>([]);
  const [enviando, setEnviando] = useState(false);

  // Al entrar: pedir las notificaciones (una sola vez)
  useEffect(() => {
    pedir(URL_NOTIFICACIONES)
      .then((lista) => {
        // Tiene que ser una lista; si no, la pantalla se rompería
        if (!Array.isArray(lista)) throw new Error("El back no devolvió una lista de notificaciones");
        setNotificaciones(lista);
      })
      .catch((e) => {
        console.error(e);
        setError(true);
      })
      .finally(() => setCargando(false));
  }, []);

  // Al tocar una notificación: se saca del back y, si el back confirma,
  // desaparece de la lista y vamos a la página de su redirección.
  async function abrir(n: DatosBackNotificacion) {
    if (!n.redireccion || enviando) return;
    setEnviando(true);
    try {
      await eliminarEnBack(n.id_notificacion);
      setNotificaciones((anteriores) =>
        anteriores.filter((x) => x.id_notificacion !== n.id_notificacion),
      );
      navigate(n.redireccion.ruta);
    } catch (e) {
      console.error(e); // si falla, la notificación se queda y no se navega
    } finally {
      setEnviando(false);
    }
  }

  // Las más nuevas arriba
  const ordenadas = [...notificaciones].sort(
    (a, b) => new Date(b.fecha_envio).getTime() - new Date(a.fecha_envio).getTime(),
  );

  return (
    <section
      style={estiloEscala}
      className="mx-auto w-[calc(var(--u)*903)] max-w-full font-[Helvetica,Arial,sans-serif]"
    >
      <div className="min-h-[calc(var(--u)*500)] rounded-[calc(var(--u)*10)] bg-[#b3d9e6] px-[calc(var(--u)*24)] py-[calc(var(--u)*40)] shadow-[0_4px_8px_rgba(0,0,0,0.3)] md:pb-[calc(var(--u)*40)] md:pl-[calc(var(--u)*47)] md:pt-[calc(var(--u)*68)]">
        {cargando && (
          <p className="text-[length:calc(var(--u)*22)] text-[#4b5c78]">Cargando notificaciones…</p>
        )}
        {error && (
          <p className="text-[length:calc(var(--u)*22)] text-[#a32020]">
            No pudimos cargar las notificaciones. Probá recargar la página.
          </p>
        )}
        {!cargando && !error && ordenadas.length === 0 && (
          <p className="text-[length:calc(var(--u)*22)] text-black">No hay notificaciones.</p>
        )}

        <ul className="flex w-[calc(var(--u)*655)] max-w-full flex-col gap-[calc(var(--u)*12)]">
          {ordenadas.map((n) => (
            <li key={n.id_notificacion}>
              {/* Sin redirección no se puede tocar */}
              <button
                type="button"
                disabled={!n.redireccion || enviando}
                onClick={() => abrir(n)}
                className="block w-full rounded-[calc(var(--u)*10)] bg-[#ddeafd] px-[calc(var(--u)*23)] py-[calc(var(--u)*10)] text-left shadow-[0_3px_4px_rgba(0,0,0,0.3)] enabled:cursor-pointer enabled:hover:bg-[#cfe1fb]"
              >
                <span className="block text-[length:calc(var(--u)*15)] font-bold uppercase leading-tight text-black">
                  {n.remitente.nombre}
                </span>
                <span className="mt-[calc(var(--u)*6)] block text-[length:calc(var(--u)*14)] leading-tight text-black">
                  {n.mensaje}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}