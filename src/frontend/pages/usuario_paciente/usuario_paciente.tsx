import { useEffect, useId, useState } from "react";
import type { CSSProperties, ChangeEvent, FormEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
// Ajustá la ruta según dónde guardes este archivo
import { usePaciente } from "../../Contexts/contextPaciente";

/* ------------------------------------------------------------------ */
/* Escala: misma técnica que Elegirusuario. Todo se mide en "--u"      */
/* (1u = 1px del diseño de 1366x768) para que escale con la pantalla.  */
/* ------------------------------------------------------------------ */
const ESCALA = 1;
const estiloEscala = {
  "--u": `max(0.55px, calc(min(100vw / 1366, 100vh / 768) * ${ESCALA}))`,
} as CSSProperties;

/* Endpoint que devuelve el perfil. Debe responder un JSON así:
   { "correo": "alguien@mail.com", "imagen": "https://...jpg" }
   ("imagen" puede venir vacía o no venir si la persona no tiene foto). */
const URL_PERFIL = "https://mocki.io/v1/fd125f8b-20ed-4509-8051-f34005b873d8";

/* Endpoint que cambia el correo. */
const URL_CAMBIAR_CORREO =
  "http://localhost:3000/paciente/cambiarCorreo"; // Cambialo por tu back real

/* Endpoint para subir la foto */
const URL_SUBIR_FOTO = "https://mocki.io/v1/d42ede49-cf64-42f1-8da6-d7f40d7236b5";

/* Validación simple de formato; la validación real la hace el back. */
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type EstadoPerfil = "cargando" | "listo" | "error";
type EstadoEnvio = "reposo" | "enviando" | "exito" | "error";

// Sube la foto como archivo (multipart/form-data)
async function subirFoto(usuario: string, archivo: File) {
  const datos = new FormData();
  datos.append("usuario", usuario);
  datos.append("imagen", archivo);
  const respuesta = await fetch(URL_SUBIR_FOTO, { method: "POST", body: datos });
  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
}

function IconoCambiar(): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[calc(var(--u)*24)] w-[calc(var(--u)*24)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9h15" />
      <path d="M16 5l4 4-4 4" />
      <path d="M20 15H5" />
      <path d="M8 11l-4 4 4 4" />
    </svg>
  );
}

const CLASE_BOTON_PRIMARIO =
  "flex h-[calc(var(--u)*48)] items-center gap-[calc(var(--u)*8)] rounded-lg bg-[#0480cc] px-[calc(var(--u)*10)] text-[length:calc(var(--u)*22)] font-bold text-[#e8f1fc] transition-colors hover:bg-[#0670b3] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const CLASE_BOTON_SECUNDARIO =
  "flex h-[calc(var(--u)*48)] items-center rounded-lg border border-[#e8f1fc]/60 px-[calc(var(--u)*14)] text-[length:calc(var(--u)*20)] text-[#e8f1fc] transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const CLASE_TARJETA =
  "flex flex-col items-center gap-[calc(var(--u)*32)] rounded-[calc(var(--u)*10)] bg-[#18243b] px-[calc(var(--u)*24)] py-[calc(var(--u)*40)] shadow-[0_4px_8px_rgba(0,0,0,0.3)] md:min-h-[calc(var(--u)*319)] md:flex-row md:items-center md:justify-between md:px-[calc(var(--u)*77)] md:py-[calc(var(--u)*40)]";

export default function PerfilPaciente() {
  const navigate = useNavigate();
  const { nombre } = usePaciente();

  const idInput = useId();
  const idMensaje = useId();

  // Datos que vienen del back
  const [correoActual, setCorreoActual] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [estadoPerfil, setEstadoPerfil] = useState<EstadoPerfil>("cargando");
  const [intento, setIntento] = useState(0);

  // Edición de correo
  const [editando, setEditando] = useState(false);
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvio>("reposo");
  const [mensaje, setMensaje] = useState("");

  const enviando = estadoEnvio === "enviando";

  /* ---------- Cargar perfil (correo + imagen) al entrar ---------- */
  useEffect(() => {
    if (!nombre) return;

    const controlador = new AbortController();
    setEstadoPerfil("cargando");

    (async () => {
      try {
        const respuesta = await fetch(
          `${URL_PERFIL}?usuario=${encodeURIComponent(nombre)}`,
          { signal: controlador.signal },
        );
        if (!respuesta.ok) throw new Error(`Estado ${respuesta.status}`);

        const datos: unknown = await respuesta.json();
        const { correo, imagen } = (datos ?? {}) as {
          correo?: unknown;
          imagen?: unknown;
        };

        if (typeof correo !== "string" || !correo) {
          throw new Error("Respuesta sin correo");
        }

        setCorreoActual(correo);
        setFotoUrl(typeof imagen === "string" && imagen ? imagen : null);
        setEstadoPerfil("listo");
      } catch {
        if (controlador.signal.aborted) return;
        setEstadoPerfil("error");
      }
    })();

    return () => controlador.abort();
  }, [nombre, intento]);

  /* ---------- Subir / Cambiar Foto ---------- */
  function cambiarFoto(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // Permite volver a seleccionar el mismo archivo si es necesario
    if (!archivo) return;

    // Validación de tipo de archivo y tamaño (máx 5MB)
    if (!archivo.type.startsWith("image/") || archivo.size > 5 * 1024 * 1024) return;

    // Muestra la vista previa local inmediatamente
    setFotoUrl(URL.createObjectURL(archivo));

    // Envía la imagen al servidor
    subirFoto(nombre, archivo).catch(console.error);
  }

  /* ---------- Cambio de correo ---------- */
  function abrirEdicion() {
    setNuevoCorreo("");
    setEstadoEnvio("reposo");
    setMensaje("");
    setEditando(true);
  }

  function cancelarEdicion() {
    if (enviando) return;
    setEditando(false);
    setEstadoEnvio("reposo");
    setMensaje("");
  }

  async function guardarCorreo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviando) return;

    const correoLimpio = nuevoCorreo.trim();

    if (!REGEX_CORREO.test(correoLimpio)) {
      setEstadoEnvio("error");
      setMensaje("Ingresá un correo válido, por ejemplo nombre@dominio.com.");
      return;
    }
    if (correoLimpio.toLowerCase() === correoActual.toLowerCase()) {
      setEstadoEnvio("error");
      setMensaje("El nuevo correo es igual al actual.");
      return;
    }

    setEstadoEnvio("enviando");
    setMensaje("");

    try {
      const respuesta = await fetch(URL_CAMBIAR_CORREO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevoCorreo: correoLimpio }),
      });

      if (!respuesta.ok) {
        throw new Error(`El servidor respondió ${respuesta.status}`);
      }

      const cuerpo: unknown = await respuesta.json();
      if ((cuerpo as { data?: unknown } | null)?.data !== "ok") {
        throw new Error("Respuesta inesperada del servidor");
      }

      setCorreoActual(correoLimpio);
      setEditando(false);
      setEstadoEnvio("exito");
      setMensaje("Correo actualizado.");
    } catch (error) {
      console.error("Error al cambiar el correo:", error);
      setEstadoEnvio("error");
      setMensaje("No se pudo cambiar el correo. Probá de nuevo en un momento.");
    }
  }

  if (!nombre) {
    return (
      <section
        style={estiloEscala}
        className="mx-auto w-[calc(var(--u)*1026)] max-w-full font-[Helvetica,Arial,sans-serif]"
      >
        <div className={`${CLASE_TARJETA} md:justify-center`}>
          <div className="flex flex-col items-center gap-[calc(var(--u)*20)] text-center">
            <p className="text-[length:calc(var(--u)*26)] text-[#dbe7fb]">
              No encontramos tu sesión. Iniciá sesión para ver tu perfil.
            </p>
            <button
              type="button"
              onClick={() => navigate("/elegirinicio")}
              className={CLASE_BOTON_PRIMARIO}
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      style={estiloEscala}
      className="mx-auto w-[calc(var(--u)*1026)] max-w-full font-[Helvetica,Arial,sans-serif]"
      aria-label="Perfil de paciente"
    >
      <div className={CLASE_TARJETA}>
        {/* ---------- Datos ---------- */}
        <div className="order-2 flex w-full flex-col items-center md:order-1 md:w-auto md:items-start">
          <div className="text-center md:w-[calc(var(--u)*246)]">
            <h1 className="text-[length:calc(var(--u)*36)] font-bold leading-tight text-[#dbe7fb]">
              {nombre}
            </h1>
            <p className="text-[length:calc(var(--u)*24)] leading-tight text-[#dbe7fb]">
              Paciente
            </p>
          </div>

          {estadoPerfil === "cargando" && (
            <p
              role="status"
              className="mt-[calc(var(--u)*40)] text-[length:calc(var(--u)*24)] text-[#8fa6c7]"
            >
              Cargando tu perfil…
            </p>
          )}

          {estadoPerfil === "error" && (
            <div className="mt-[calc(var(--u)*40)] flex flex-col items-center gap-[calc(var(--u)*12)] md:items-start">
              <p
                role="alert"
                className="text-[length:calc(var(--u)*22)] text-[#ffb4b4]"
              >
                No pudimos cargar tu perfil.
              </p>
              <button
                type="button"
                onClick={() => setIntento((n) => n + 1)}
                className={CLASE_BOTON_SECUNDARIO}
              >
                Reintentar
              </button>
            </div>
          )}

          {estadoPerfil === "listo" && (
            <>
              <p className="mt-[calc(var(--u)*40)] break-all text-[length:calc(var(--u)*24)] text-[#dbe7fb] md:break-normal">
                <strong>Correo</strong>: {correoActual}
              </p>

              {editando ? (
                <form
                  onSubmit={guardarCorreo}
                  noValidate
                  className="mt-[calc(var(--u)*20)] flex w-full flex-col gap-[calc(var(--u)*12)]"
                >
                  <label htmlFor={idInput} className="sr-only">
                    Nuevo correo
                  </label>
                  <input
                    id={idInput}
                    type="email"
                    autoFocus
                    autoComplete="email"
                    inputMode="email"
                    placeholder="Nuevo correo"
                    value={nuevoCorreo}
                    onChange={(e) => setNuevoCorreo(e.target.value)}
                    disabled={enviando}
                    aria-invalid={estadoEnvio === "error"}
                    aria-describedby={mensaje ? idMensaje : undefined}
                    className="h-[calc(var(--u)*48)] w-full rounded-lg border border-[#8fb2dd] bg-[#0f1a2e] px-[calc(var(--u)*14)] text-[length:calc(var(--u)*22)] text-[#dbe7fb] placeholder:text-[#8fa6c7] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  />
                  <div className="flex gap-[calc(var(--u)*12)]">
                    <button
                      type="submit"
                      disabled={enviando}
                      className={CLASE_BOTON_PRIMARIO}
                    >
                      {enviando ? "Guardando…" : "Guardar correo"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      disabled={enviando}
                      className={CLASE_BOTON_SECUNDARIO}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={abrirEdicion}
                  className={`${CLASE_BOTON_PRIMARIO} mt-[calc(var(--u)*20)]`}
                >
                  Cambiar correo
                  <IconoCambiar />
                </button>
              )}

              {mensaje && (
                <p
                  id={idMensaje}
                  role={estadoEnvio === "error" ? "alert" : "status"}
                  className={`mt-[calc(var(--u)*12)] text-[length:calc(var(--u)*18)] ${
                    estadoEnvio === "error" ? "text-[#ffb4b4]" : "text-[#a9e6b8]"
                  }`}
                >
                  {mensaje}
                </p>
              )}
            </>
          )}
        </div>

        {/* ---------- Foto (Interactiva para cargar / cambiar) ---------- */}
        <label
          title={fotoUrl ? "Cambiar foto" : "Agregar foto"}
          className="order-1 flex h-[calc(var(--u)*200)] w-[calc(var(--u)*200)] min-h-[100px] min-w-[100px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-black bg-[#d9d9d9] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-white md:order-2"
        >
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={`Foto de ${nombre}`}
              onError={() => setFotoUrl(null)}
              className="h-full w-full object-cover"
            />
          ) : (
            estadoPerfil !== "cargando" && (
              <span aria-hidden="true" className="text-[length:calc(var(--u)*90)] font-light leading-none text-[#4b5c78]">
                +
              </span>
            )
          )}
          <input
            type="file"
            accept="image/*"
            onChange={cambiarFoto}
            aria-label={fotoUrl ? "Cambiar foto de perfil" : "Agregar foto de perfil"}
            className="sr-only"
          />
        </label>
      </div>
    </section>
  );
}