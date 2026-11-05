import { useEffect, useState } from "react";
import type { CSSProperties, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCuidador, type Paciente } from "../../Contexts/contextoCuidador";

interface DatosPerfil {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  foto?: string;
}

const URL_BASE = "http://localhost:3000";
const URL_PERFIL = `${URL_BASE}/doctor/verPerfilDoctor`;
const URL_MIS_PACIENTES = `${URL_BASE}/doctor/verPacientesDoctor`;
const URL_ENVIAR_INVITACION_DOCTOR = `${URL_BASE}/doctor/enviarInvitacionDoctor`;
const URL_ENVIAR_INVITACION_ACOMPANANTE = `${URL_BASE}/acompañante/enviarInvitacionAcompañante`;
const URL_CAMBIAR_CORREO_DOCTOR = `${URL_BASE}/doctor/cambiarCorreo`;
const URL_CAMBIAR_CORREO_ACOMPANANTE = `${URL_BASE}/acompañante/cambiarCorreo`;
const URL_ELIMINAR_PACIENTE = `${URL_BASE}/doctor/eliminarPacienteVinculado`;
const URL_SUBIR_FOTO = `${URL_BASE}/videos/subirFotoPerfil`;

const ESCALA = 1;
const estiloEscala = {
  "--u": `max(0.55px, calc(min(100vw / 1366, 100vh / 768) * ${ESCALA}))`,
} as CSSProperties;

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BOTON_BASE =
  "flex h-[calc(var(--u)*48)] items-center gap-[calc(var(--u)*12)] rounded-lg px-[calc(var(--u)*8)] text-[length:calc(var(--u)*23)] font-bold text-[#e8f1fc] shadow-[0_2px_4px_rgba(0,0,0,0.3)] disabled:opacity-60 cursor-pointer";
const BOTON_OSCURO = `${BOTON_BASE} bg-[#18243b]`;
const BOTON_ROJO = `${BOTON_BASE} bg-[#d62828]`;
const BOTON_CLARO =
  "flex h-[calc(var(--u)*48)] items-center rounded-lg border border-[#18243b] px-[calc(var(--u)*16)] text-[length:calc(var(--u)*20)] text-[#18243b] cursor-pointer";
const CAMPO =
  "h-[calc(var(--u)*48)] w-full max-w-[calc(var(--u)*420)] rounded-lg border border-[#18243b] bg-white/80 px-[calc(var(--u)*14)] text-[length:calc(var(--u)*22)] text-black";

type Panel = "agregar" | "eliminar" | "correo" | null;

function leerPerfilGuardado(): DatosPerfil | null {
  try {
    const usuarioGuardado = localStorage.getItem("user");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) as DatosPerfil : null;
  } catch {
    return null;
  }
}

export default function PerfilCuidador(rol: { rol: string }) {
  const navigate = useNavigate();
  const { nombre: nombreSesion } = useCuidador();
  const esDoctor = rol.rol === "Médico";

  const [perfil, setPerfil] = useState<DatosPerfil | null>(() =>
    esDoctor ? null : leerPerfilGuardado()
  );
  const [cargando, setCargando] = useState(() =>
    esDoctor && Boolean(localStorage.getItem("token"))
  );
  const [error, setError] = useState(() => !esDoctor && !perfil);
  const [correo, setCorreo] = useState(perfil?.email || "");
  const [foto, setFoto] = useState(perfil?.foto || "");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  const [panel, setPanel] = useState<Panel>(null);
  const [idPacienteInput, setIdPacienteInput] = useState("");
  const [eleccionEliminar, setEleccionEliminar] = useState("");
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("token") || "";

  // Carga paralela de datos de usuario y pacientes asociados desde el Backend
  useEffect(() => {
    const token = getToken();
    if (!token || !esDoctor) return;

    Promise.all([
      fetch(URL_PERFIL, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => (res.ok ? res.json() : Promise.reject(res))),

      fetch(URL_MIS_PACIENTES, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => (res.ok ? res.json() : Promise.reject(res))),
    ])
      .then(([dataPerfil, dataPacientes]) => {
        const u = dataPerfil.medico || dataPerfil.usuario;
        if (u) {
          setPerfil(u);
          setCorreo(u.email);
          setFoto(u.foto || "");
        }
        setPacientes(Array.isArray(dataPacientes.pacientes) ? dataPacientes.pacientes : []);
      })
      .catch((err) => {
        console.error("Error al cargar perfil:", err);
        setError(true);
      })
      .finally(() => {
        setCargando(false);
      });
  }, [esDoctor]);

  function abrirPanel(destino: Exclude<Panel, null>) {
    setIdPacienteInput("");
    setEleccionEliminar("");
    setNuevoCorreo("");
    setMensajeEstado(null);

    if (panel === destino) {
      setPanel(null);
      return;
    }
    setPanel(destino);
  }

  // Enviar invitación a paciente por su ID
  async function agregarPaciente(e: FormEvent) {
    e.preventDefault();
    const idNum = Number(idPacienteInput.trim());
    if (!idNum || isNaN(idNum)) {
      setMensajeEstado("Ingresá un ID válido de paciente.");
      return;
    }

    setEnviando(true);
    setMensajeEstado(null);

    try {
      const res = await fetch(
        esDoctor ? URL_ENVIAR_INVITACION_DOCTOR : URL_ENVIAR_INVITACION_ACOMPANANTE,
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ idPaciente: idNum }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo enviar la invitación");

      setMensajeEstado("Invitación enviada con éxito.");
      setTimeout(() => setPanel(null), 1500);
    } catch (err: unknown) {
      setMensajeEstado(err instanceof Error ? err.message : "No se pudo enviar la invitación.");
    } finally {
      setEnviando(false);
    }
  }

  // Desvincular un paciente
  async function eliminarPaciente(e: FormEvent) {
    e.preventDefault();
    if (!esDoctor) return;
    const idNum = Number(eleccionEliminar);
    if (!idNum) return;

    setEnviando(true);
    setMensajeEstado(null);

    try {
      const res = await fetch(URL_ELIMINAR_PACIENTE, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ pacienteId: idNum }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al desvincular paciente");

      setPacientes((anteriores) => anteriores.filter((p) => p.id !== idNum));
      setPanel(null);
    } catch (err: unknown) {
      setMensajeEstado(err instanceof Error ? err.message : "Error al desvincular paciente.");
    } finally {
      setEnviando(false);
    }
  }

  // Subir imagen a Cloudinary / Servidor
  function cambiarFoto(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo || !archivo.type.startsWith("image/") || archivo.size > 5 * 1024 * 1024) return;

    setFoto(URL.createObjectURL(archivo));

    const formData = new FormData();
    formData.append("imagen", archivo);

    fetch(URL_SUBIR_FOTO, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.foto) setFoto(data.foto);
      })
      .catch((err) => console.error("Error al subir foto:", err));
  }

  // Actualizar correo electrónico
  async function guardarCorreo(e: FormEvent) {
    e.preventDefault();
    const nuevo = nuevoCorreo.trim();
    if (!REGEX_CORREO.test(nuevo)) {
      setMensajeEstado("Ingresá un correo electrónico válido.");
      return;
    }
    if (nuevo.toLowerCase() === correo.toLowerCase()) return;

    setEnviando(true);
    setMensajeEstado(null);

    try {
      const res = await fetch(
        esDoctor ? URL_CAMBIAR_CORREO_DOCTOR : URL_CAMBIAR_CORREO_ACOMPANANTE,
        {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email: nuevo }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cambiar correo");

      setCorreo(nuevo);
      const usuarioGuardado = localStorage.getItem("user");
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado) as DatosPerfil;
        localStorage.setItem("user", JSON.stringify({ ...usuario, email: nuevo }));
      }
      setPanel(null);
    } catch (err: unknown) {
      setMensajeEstado(err instanceof Error ? err.message : "Error al cambiar correo.");
    } finally {
      setEnviando(false);
    }
  }

  if (!getToken()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-center text-[length:calc(var(--u)*26)] text-black" style={estiloEscala}>
          No encontramos tu sesión. Iniciá sesión para ver tu perfil.
        </p>
        <button onClick={() => navigate("/login")} className={BOTON_OSCURO} style={estiloEscala}>
          Ir al Login
        </button>
      </div>
    );
  }

  const cancelar = (
    <button type="button" onClick={() => setPanel(null)} className={BOTON_CLARO}>
      Cancelar
    </button>
  );

  const nombreMostrar = perfil
    ? `${perfil.nombre} ${perfil.apellido}`
    : nombreSesion || "Cargando perfil...";

  return (
    <section
      style={estiloEscala}
      className="mx-auto w-[calc(var(--u)*1103)] max-w-full font-[Helvetica,Arial,sans-serif] p-4"
    >
      <div className="flex flex-col-reverse items-center gap-[calc(var(--u)*32)] rounded-[calc(var(--u)*10)] bg-[#b3d9e6] px-[calc(var(--u)*24)] py-[calc(var(--u)*40)] shadow-[0_4px_8px_rgba(0,0,0,0.3)] md:flex-row md:items-start md:justify-between md:pb-[calc(var(--u)*56)] md:pl-[calc(var(--u)*78)] md:pr-[calc(var(--u)*150)] md:pt-[calc(var(--u)*36)]">

        {/* Datos Principales */}
        <div className="flex w-full flex-col items-center md:w-auto md:items-start">
          <div className="w-fit text-center md:text-left">
            <h1 className="break-words text-[length:calc(var(--u)*40)] font-bold leading-tight text-black">
              {nombreMostrar}
            </h1>
            <p className="text-[length:calc(var(--u)*24)] leading-tight text-black">{rol.rol}</p>
          </div>

          {cargando && (
            <p className="mt-[calc(var(--u)*40)] text-[length:calc(var(--u)*24)] text-[#4b5c78]">
              Cargando tu perfil…
            </p>
          )}

          {error && (
            <p className="mt-[calc(var(--u)*40)] text-[length:calc(var(--u)*22)] text-[#a32020]">
              No pudimos cargar tu perfil. Comprobá que tu sesión sea válida.
            </p>
          )}

          {!cargando && !error && (
            <>
              {/* Pacientes Asignados */}
              <p className="mt-[calc(var(--u)*40)] text-[length:calc(var(--u)*24)] text-black">
                <strong>Pacientes</strong>:{" "}
                {pacientes.length === 0
                  ? esDoctor
                    ? "todavía no tenés pacientes asignados"
                    : "la lista de pacientes aún no está disponible"
                  : pacientes.map((p, i) => (
                      <span key={p.id}>
                        {i > 0 && ", "}
                        {p.nombre}
                      </span>
                    ))}
              </p>

              {/* Acciones */}
              <div className="mt-[calc(var(--u)*30)] flex flex-wrap justify-center gap-[calc(var(--u)*24)] md:justify-start">
                <button type="button" onClick={() => abrirPanel("agregar")} className={BOTON_OSCURO}>
                  Agregar paciente +
                </button>
                {esDoctor && (
                  <button
                    type="button"
                    onClick={() => abrirPanel("eliminar")}
                    disabled={pacientes.length === 0}
                    className={BOTON_ROJO}
                  >
                    Eliminar paciente
                  </button>
                )}
              </div>

              {mensajeEstado && (
                <p className="mt-2 text-[length:calc(var(--u)*18)] text-[#18243b] font-medium">
                  {mensajeEstado}
                </p>
              )}

              {/* Formulario Agregar Paciente por ID */}
              {panel === "agregar" && (
                <form onSubmit={agregarPaciente} className="mt-[calc(var(--u)*16)] flex w-full flex-col gap-[calc(var(--u)*12)]">
                  <input
                    type="number"
                    aria-label="ID del paciente a invitar"
                    placeholder="Ingresá el ID del paciente"
                    value={idPacienteInput}
                    onChange={(e) => setIdPacienteInput(e.target.value)}
                    className={CAMPO}
                  />
                  <div className="flex gap-[calc(var(--u)*12)]">
                    <button type="submit" disabled={enviando} className={BOTON_OSCURO}>
                      {enviando ? "Enviando…" : "Enviar invitación"}
                    </button>
                    {cancelar}
                  </div>
                </form>
              )}

              {/* Formulario Eliminar Paciente */}
              {esDoctor && panel === "eliminar" && (
                <form onSubmit={eliminarPaciente} className="mt-[calc(var(--u)*16)] flex w-full flex-col gap-[calc(var(--u)*12)]">
                  <select
                    aria-label="Paciente a eliminar"
                    value={eleccionEliminar}
                    onChange={(e) => setEleccionEliminar(e.target.value)}
                    className={CAMPO}
                  >
                    <option value="" disabled>
                      Elegí un paciente
                    </option>
                    {pacientes.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-[calc(var(--u)*12)]">
                    <button type="submit" disabled={enviando || !eleccionEliminar} className={BOTON_ROJO}>
                      {enviando ? "Eliminando…" : "Eliminar"}
                    </button>
                    {cancelar}
                  </div>
                </form>
              )}

              {/* Sección Correo */}
              <p className="mt-[calc(var(--u)*64)] break-all text-[length:calc(var(--u)*24)] text-black md:break-normal">
                <strong>Correo</strong>: {correo}
              </p>

              <button
                type="button"
                onClick={() => abrirPanel("correo")}
                className={`${BOTON_OSCURO} mt-[calc(var(--u)*22)]`}
              >
                Cambiar correo ⇄
              </button>

              {/* Formulario Cambiar Correo */}
              {panel === "correo" && (
                <form onSubmit={guardarCorreo} className="mt-[calc(var(--u)*16)] flex w-full flex-col gap-[calc(var(--u)*12)]">
                  <input
                    type="email"
                    aria-label="Nuevo correo"
                    placeholder="Nuevo correo"
                    value={nuevoCorreo}
                    onChange={(e) => setNuevoCorreo(e.target.value)}
                    className={CAMPO}
                  />
                  <div className="flex gap-[calc(var(--u)*12)]">
                    <button type="submit" disabled={enviando} className={BOTON_OSCURO}>
                      {enviando ? "Guardando…" : "Guardar correo"}
                    </button>
                    {cancelar}
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Foto de Perfil */}
        <label
          title={foto ? "Cambiar foto" : "Agregar foto"}
          className="flex h-[calc(var(--u)*200)] w-[calc(var(--u)*200)] min-h-[100px] min-w-[100px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-black bg-[#d9d9d9] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#18243b] md:mt-[calc(var(--u)*11)]"
        >
          {foto ? (
            <img src={foto} alt={`Foto de ${nombreMostrar}`} className="h-full w-full object-cover" />
          ) : (
            !cargando && (
              <span aria-hidden="true" className="text-[length:calc(var(--u)*90)] font-light leading-none text-[#4b5c78]">
                +
              </span>
            )
          )}
          <input
            type="file"
            accept="image/*"
            onChange={cambiarFoto}
            aria-label={foto ? "Cambiar foto de perfil" : "Agregar foto de perfil"}
            className="sr-only"
          />
        </label>
      </div>
    </section>
  );
}