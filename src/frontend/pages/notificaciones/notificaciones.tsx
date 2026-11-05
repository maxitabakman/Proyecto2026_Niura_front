import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

const API_BASE = "http://localhost:3000/paciente";

interface InvitacionApi {
  id: number | string;
  nombre: string;
  apellido?: string;
}

type TipoSolicitud = "doctor" | "acompanante";

interface NotificacionSolicitud {
  id_notificacion: string;
  tipo: TipoSolicitud;
  id_invitacion: number | string;
  mensaje: string;
}

interface RespuestaInvitaciones {
  invitaciones: InvitacionApi[];
}

async function cargarInvitaciones(
  ruta: string,
  token: string,
): Promise<InvitacionApi[]> {
  const respuesta = await fetch(`${API_BASE}/${ruta}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) {
    let mensaje: string | undefined;
    if (respuesta.headers.get("content-type")?.includes("application/json")) {
      const detalle: unknown = await respuesta.json();
      if (
        typeof detalle === "object" &&
        detalle !== null &&
        "message" in detalle &&
        typeof detalle.message === "string"
      ) {
        mensaje = detalle.message;
      }
    }
    throw new Error(mensaje || `No se pudieron cargar las solicitudes (${respuesta.status}).`);
  }

  const datos: unknown = await respuesta.json();
  if (
    typeof datos !== "object" ||
    datos === null ||
    !("invitaciones" in datos) ||
    !Array.isArray((datos as RespuestaInvitaciones).invitaciones)
  ) {
    throw new Error("El servidor devolvió una lista de solicitudes inválida.");
  }

  return (datos as RespuestaInvitaciones).invitaciones;
}

export default function Noticias() {
  const [notificaciones, setNotificaciones] = useState<NotificacionSolicitud[]>([]);
  const [cargando, setCargando] = useState(() => Boolean(localStorage.getItem("token")));
  const [error, setError] = useState<string | null>(() =>
    localStorage.getItem("token") ? null : "Iniciá sesión para ver tus notificaciones.",
  );
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [mensajeAccion, setMensajeAccion] = useState<string | null>(null);

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarNotificaciones() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [invitacionesDoctor, invitacionesAcompanante] = await Promise.all([
          cargarInvitaciones("verInvitacionesDoctor", token),
          cargarInvitaciones("verInvitacionesAcompanante", token),
        ]);

        if (controlador.signal.aborted) return;

        const solicitudes: NotificacionSolicitud[] = [
          ...invitacionesDoctor.map((invitacion) => ({
            id_notificacion: `doctor-${invitacion.id}`,
            tipo: "doctor" as const,
            id_invitacion: invitacion.id,
            mensaje: `El médico ${invitacion.nombre} ${invitacion.apellido || ""} quiere vincularse con vos.`,
          })),
          ...invitacionesAcompanante.map((invitacion) => ({
            id_notificacion: `acompanante-${invitacion.id}`,
            tipo: "acompanante" as const,
            id_invitacion: invitacion.id,
            mensaje: `El acompañante ${invitacion.nombre} ${invitacion.apellido || ""} quiere vincularse con vos.`,
          })),
        ];

        setNotificaciones(solicitudes);
        setError(null);
      } catch (e) {
        if (controlador.signal.aborted) return;
        console.error("Error al cargar solicitudes:", e);
        setError(
          e instanceof Error
            ? e.message
            : "No pudimos cargar las notificaciones. Probá recargar.",
        );
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    void cargarNotificaciones();
    const intervalo = window.setInterval(() => void cargarNotificaciones(), 30_000);
    window.addEventListener("focus", cargarNotificaciones);

    return () => {
      controlador.abort();
      window.clearInterval(intervalo);
      window.removeEventListener("focus", cargarNotificaciones);
    };
  }, []);

  async function responderSolicitud(
    notificacion: NotificacionSolicitud,
    aceptada: boolean,
  ) {
    if (procesandoId !== null) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setMensajeAccion("Tu sesión venció. Iniciá sesión nuevamente.");
      return;
    }

    setProcesandoId(notificacion.id_notificacion);
    setMensajeAccion(null);

    const ruta =
      notificacion.tipo === "doctor"
        ? "aceptarInvitacionDoctor"
        : "aceptarInvitacionAcompanante";

    try {
      const respuesta = await fetch(`${API_BASE}/${ruta}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idInvitacion: notificacion.id_invitacion,
          aceptar: aceptada,
        }),
      });

      const datos: unknown = await respuesta.json();
      if (!respuesta.ok) {
        const mensaje =
          typeof datos === "object" &&
          datos !== null &&
          "message" in datos &&
          typeof datos.message === "string"
            ? datos.message
            : "No se pudo responder la solicitud.";
        throw new Error(mensaje);
      }

      setNotificaciones((anteriores) =>
        anteriores.filter(
          (item) => item.id_notificacion !== notificacion.id_notificacion,
        ),
      );
      setMensajeAccion(aceptada ? "Solicitud aceptada." : "Solicitud rechazada.");
    } catch (e) {
      console.error("Error al responder solicitud:", e);
      setMensajeAccion(
        e instanceof Error ? e.message : "No se pudo responder la solicitud.",
      );
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <section className="mx-auto mt-8 w-full max-w-[903px] px-4 sm:mt-[60px] sm:px-0">
      <div className="h-[501px] max-h-[calc(100vh-140px)] min-h-[320px] rounded-[10px] bg-[#b3d9e6] px-4 py-8 shadow-[0_4px_8px_rgba(0,0,0,0.3)] sm:pl-[47px] sm:pr-6 sm:pt-[68px]">
        <div className="h-full overflow-y-auto pr-3 [scrollbar-color:#d9d9d9_#b3d9e6] [scrollbar-width:thin]">
          {cargando && (
            <p role="status" className="text-lg text-[#4b5c78]">
              Cargando notificaciones...
            </p>
          )}

          {error && (
            <p role="alert" className="text-lg text-red-700">
              {error}
            </p>
          )}

          {mensajeAccion && (
            <p role="status" className="mb-3 text-lg text-[#18243b]">
              {mensajeAccion}
            </p>
          )}

          {!cargando && !error && notificaciones.length === 0 && (
            <p className="text-lg text-black">No tenés solicitudes pendientes.</p>
          )}

          {!cargando && !error && (
            <ul className="flex w-full flex-col gap-[12px] pb-4">
              {notificaciones.map((notificacion) => (
                <li key={notificacion.id_notificacion} className="w-full">
                  <div className="flex min-h-[70px] w-full items-center justify-between gap-3 rounded-[10px] bg-[#ddeafd] px-[23px] py-[10px] text-black shadow-[0_3px_4px_rgba(0,0,0,0.3)]">
                    <span className="min-w-0 flex-1 text-left text-[22px] leading-tight sm:text-[29px]">
                      {notificacion.mensaje}
                    </span>

                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        disabled={procesandoId !== null}
                        onClick={() => void responderSolicitud(notificacion, false)}
                        aria-label="Rechazar solicitud"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d40000] text-white disabled:opacity-50"
                      >
                        <Icon icon="mdi:close" className="h-8 w-8" />
                      </button>

                      <button
                        type="button"
                        disabled={procesandoId !== null}
                        onClick={() => void responderSolicitud(notificacion, true)}
                        aria-label="Aceptar solicitud"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#079f9e] text-white disabled:opacity-50"
                      >
                        <Icon icon="mdi:check" className="h-8 w-8" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
