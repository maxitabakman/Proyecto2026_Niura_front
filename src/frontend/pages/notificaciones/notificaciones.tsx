import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

import rachaImg from "../../images/racha_icono.png";
import tuRedImg from "../../images/reddecontactos_icono.png";

const URL_NOTIFICACIONES =
  "https://mocki.io/v1/8c7eab71-c0cb-499a-a291-590838e46faf";

const URL_ELIMINAR_NOTIFICACION =
  "https://mocki.io/v1/d42ede49-cf64-42f1-8da6-d7f40d7236b5";

type TipoNotificacion =
  | "mensaje"
  | "anotado"
  | "solicitud_medico"
  | "alerta_racha";

interface Notificacion {
  id_notificacion: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fecha_envio: string;
  leida: boolean;
  redireccion?: {
    ruta: string;
  };
  solicitud?: {
    id_solicitud: number;
  };
  racha?: {
    dias: number;
  };
}

function adaptarNotificacion(n: Notificacion): Notificacion {
  if (n.tipo === "anotado" || n.tipo === "mensaje") {
    return {
      ...n,
      tipo: "mensaje",
      redireccion: {
        ruta: "/paciente/reddecontactosmia",
      },
    };
  }

  if (n.tipo === "alerta_racha") {
    return {
      ...n,
      redireccion: {
        ruta: n.redireccion?.ruta ?? "/racha",
      },
    };
  }

  return n;
}

export default function Noticias() {
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] =
    useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  useEffect(() => {
    async function cargarNotificaciones() {
      try {
        const respuesta = await fetch(URL_NOTIFICACIONES);

        if (!respuesta.ok) {
          throw new Error("Error al cargar las notificaciones");
        }

        const datos: unknown = await respuesta.json();

        if (!Array.isArray(datos)) {
          throw new Error("El backend no devolvió una lista");
        }

        setNotificaciones(
          (datos as Notificacion[]).map(adaptarNotificacion)
        );
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setCargando(false);
      }
    }

    cargarNotificaciones();
  }, []);

  const ordenadas = [...notificaciones].sort(
    (a, b) =>
      new Date(b.fecha_envio).getTime() -
      new Date(a.fecha_envio).getTime()
  );

  async function eliminarEnBack(idNotificacion: number) {
    const consulta = new URLSearchParams({
      id_notificacion: String(idNotificacion),
    });

    const respuesta = await fetch(
      `${URL_ELIMINAR_NOTIFICACION}?${consulta.toString()}`
    );

    if (!respuesta.ok) {
      throw new Error("Falló la petición de eliminación");
    }

    const datos = await respuesta.json();

    if (datos?.data !== "ok") {
      throw new Error("El backend no confirmó la operación");
    }
  }

  async function abrirNotificacion(n: Notificacion) {
    if (!n.redireccion || procesandoId !== null) return;

    setProcesandoId(n.id_notificacion);

    try {
      await eliminarEnBack(n.id_notificacion);

      setNotificaciones((anteriores) =>
        anteriores.filter(
          (x) => x.id_notificacion !== n.id_notificacion
        )
      );

      navigate(n.redireccion.ruta);
    } catch (e) {
      console.error(e);
      window.alert(
        "No se pudo confirmar la eliminación. Probá de nuevo."
      );
    } finally {
      setProcesandoId(null);
    }
  }

  async function responderSolicitud(
    n: Notificacion,
    aceptada: boolean
  ) {
    if (!n.solicitud || procesandoId !== null) return;

    window.alert(
      `Falta conectar el backend para ${
        aceptada ? "aceptar" : "rechazar"
      } esta solicitud.`
    );
  }

  return (
    <section className="mx-auto mt-8 w-full max-w-[903px] px-4 sm:mt-[60px] sm:px-0">
      <div className="h-[501px] max-h-[calc(100vh-140px)] min-h-[320px] rounded-[10px] bg-[#b3d9e6] px-4 py-8 shadow-[0_4px_8px_rgba(0,0,0,0.3)] sm:pl-[47px] sm:pr-6 sm:pt-[68px]">
        <div className="h-full overflow-y-auto pr-3 [scrollbar-color:#d9d9d9_#b3d9e6] [scrollbar-width:thin]">
          {cargando && (
            <p className="text-lg text-[#4b5c78]">
              Cargando notificaciones...
            </p>
          )}

          {error && (
            <p className="text-lg text-red-700">
              No pudimos cargar las notificaciones. Probá recargar.
            </p>
          )}

          {!cargando && !error && ordenadas.length === 0 && (
            <p className="text-lg text-black">
              No hay notificaciones.
            </p>
          )}

          {!cargando && !error && (
            <ul className="flex w-full flex-col gap-[12px] pb-4">
              {ordenadas.map((n) => (
                <li key={n.id_notificacion} className="w-full">
                  {n.tipo === "mensaje" && (
                    <button
                      type="button"
                      disabled={procesandoId !== null}
                      onClick={() => abrirNotificacion(n)}
                      className="flex min-h-[70px] w-full items-center justify-between gap-4 rounded-[10px] bg-[#eadca3] px-[23px] py-[10px] text-left text-black shadow-[0_3px_4px_rgba(0,0,0,0.3)]"
                    >
                      <span className="text-[24px] leading-tight sm:text-[29px]">
                        {n.titulo}
                      </span>

                      <img
                        src={tuRedImg}
                        alt=""
                        draggable={false}
                        className="h-12 w-auto shrink-0 object-contain"
                      />
                    </button>
                  )}

                  {n.tipo === "solicitud_medico" && (
                    <div className="flex min-h-[70px] w-full items-center justify-between gap-3 rounded-[10px] bg-[#ddeafd] px-[23px] py-[10px] text-black shadow-[0_3px_4px_rgba(0,0,0,0.3)]">
                      <span className="min-w-0 flex-1 text-left text-[22px] leading-tight sm:text-[29px]">
                        {n.mensaje}
                      </span>

                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          disabled={procesandoId !== null}
                          onClick={() => responderSolicitud(n, false)}
                          aria-label="Rechazar solicitud"
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d40000] text-white disabled:opacity-50"
                        >
                          <Icon icon="mdi:close" className="h-8 w-8" />
                        </button>

                        <button
                          type="button"
                          disabled={procesandoId !== null}
                          onClick={() => responderSolicitud(n, true)}
                          aria-label="Aceptar solicitud"
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#079f9e] text-white disabled:opacity-50"
                        >
                          <Icon icon="mdi:check" className="h-8 w-8" />
                        </button>
                      </div>
                    </div>
                  )}

                  {n.tipo === "alerta_racha" && (
                    <button
                      type="button"
                      disabled={procesandoId !== null}
                      onClick={() => abrirNotificacion(n)}
                      className="flex min-h-[70px] w-full items-center justify-between gap-3 rounded-[10px] bg-[#ddeafd] px-[23px] py-[10px] text-left text-black shadow-[0_3px_4px_rgba(0,0,0,0.3)]"
                    >
                      <span className="text-[22px] leading-tight sm:text-[29px]">
                        {n.mensaje}
                      </span>

                      <span className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                        <img
                          src={rachaImg}
                          alt=""
                          draggable={false}
                          className="absolute inset-0 h-full w-full object-contain"
                        />
                        <span
                          className="absolute bottom-[2px] text-[23px] font-bold leading-none text-[#ffcf36] [text-shadow:-1px_-1px_0_#172d48,1px_-1px_0_#172d48,-1px_1px_0_#172d48,1px_1px_0_#172d48]"
                        >
                          {n.racha?.dias ?? 0}
                        </span>
                      </span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}