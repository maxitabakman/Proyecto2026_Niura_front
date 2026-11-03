import { useEffect, useState } from "react";
import type { CSSProperties,ChangeEvent, FormEvent } from "react";
import { useCuidador, type Paciente } from "../../Contexts/contextoCuidador";

const URL_PERFIL = "https://mocki.io/v1/ab9e53b5-a50b-489e-8235-d984311f9d29";
const URL_OPCIONES_PACIENTES = "https://mocki.io/v1/105de956-7cf2-4e78-996c-782c20aa5d10";
const URL_AGREGAR_PACIENTE = "https://mocki.io/v1/d42ede49-cf64-42f1-8da6-d7f40d7236b5";
const URL_CAMBIAR_CORREO = "https://mocki.io/v1/d42ede49-cf64-42f1-8da6-d7f40d7236b5";


const URL_ELIMINAR_PACIENTE = "https://mocki.io/v1/d42ede49-cf64-42f1-8da6-d7f40d7236b5";
// Mocki no recibe archivos: con mocki esto va a fallar. Con el back real funciona.
const URL_SUBIR_FOTO = "https://mocki.io/v1/d42ede49-cf64-42f1-8da6-d7f40d7236b5";

async function pedir(url: string, datos: Record<string, string>) {
  const respuesta = await fetch(`${url}?${new URLSearchParams(datos)}`);
  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
  return respuesta.json();
}

// Para agregar paciente y cambiar correo
async function enviar(url: string, datos: Record<string, string>) {
  const respuesta = await pedir(url, datos);
  // SOLO PRUEBAS: el mocki responde {"data":"ok"}. Borrar con el back real.
  if (respuesta?.data !== "ok") throw new Error("Respuesta inesperada");
}

// Sube la foto como archivo (multipart/form-data).
// No se pone Content-Type a mano: el navegador lo arma solo con su "boundary".
async function subirFoto(usuario: string, archivo: File) {
  const datos = new FormData();
  datos.append("usuario", usuario);
  datos.append("imagen", archivo);
  const respuesta = await fetch(URL_SUBIR_FOTO, { method: "POST", body: datos });
  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
}

/* ================================================================== */
/* PANTALLA                                                            */
/* ================================================================== */
const ESCALA = 1;
const estiloEscala = {
  "--u": `max(0.55px, calc(min(100vw / 1366, 100vh / 768) * ${ESCALA}))`,
} as CSSProperties;

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOMBRE_PRUEBA = "Cuidador de prueba"; // se usa sin sesión, solo en desarrollo

const BOTON_BASE =
  "flex h-[calc(var(--u)*48)] items-center gap-[calc(var(--u)*12)] rounded-lg px-[calc(var(--u)*8)] text-[length:calc(var(--u)*23)] font-bold text-[#e8f1fc] shadow-[0_2px_4px_rgba(0,0,0,0.3)] disabled:opacity-60";
const BOTON_OSCURO = `${BOTON_BASE} bg-[#18243b]`;
const BOTON_ROJO = `${BOTON_BASE} bg-[#d62828]`;
const BOTON_CLARO =
  "flex h-[calc(var(--u)*48)] items-center rounded-lg border border-[#18243b] px-[calc(var(--u)*16)] text-[length:calc(var(--u)*20)] text-[#18243b]";
const CAMPO =
  "h-[calc(var(--u)*48)] w-full max-w-[calc(var(--u)*420)] rounded-lg border border-[#18243b] bg-white/80 px-[calc(var(--u)*14)] text-[length:calc(var(--u)*22)] text-black";

type Panel = "agregar" | "eliminar" | "correo" | null;

export default function PerfilCuidador( ) {
  const { nombre: nombreSesion } = useCuidador();

  // Sin sesión, en desarrollo entramos con un cuidador de prueba
  const nombre = nombreSesion || (import.meta.env.DEV ? NOMBRE_PRUEBA : "");
  const esPrueba = !nombreSesion && nombre !== "";

  // Datos del back
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [correo, setCorreo] = useState("");
  const [foto, setFoto] = useState("");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [opciones, setOpciones] = useState<Paciente[]>([]);

  // Interfaz
  const [panel, setPanel] = useState<Panel>(null);
  const [eleccion, setEleccion] = useState(""); // paciente elegido (agregar / cambiar)
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Al entrar: pedir el perfil
  useEffect(() => {
    if (!nombre) return;
    pedir(URL_PERFIL, { usuario: nombre })
      .then((perfil) => {
        setCorreo(perfil.correo);
        setFoto(perfil.imagen ?? "");
        setPacientes(perfil.pacientes);
      })
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, [nombre]);

  // No ofrecemos pacientes que ya tiene asignados
  const disponibles = opciones.filter(
    (o) => !pacientes.some((p) => String(p.id) === String(o.id)),
  );

  function abrirPanel(destino: Exclude<Panel, null>) {
    setEleccion("");
    setNuevoCorreo("");

    if (panel === destino) {
      setPanel(null); // tocar el mismo botón otra vez lo cierra
      return;
    }
    setPanel(destino);

    if (destino === "agregar") {
      pedir(URL_OPCIONES_PACIENTES, { usuario: nombre })
        .then((lista) => {
          // Tiene que ser una lista [{ id, nombre }, ...]; si no, daría pantalla en blanco
          if (!Array.isArray(lista)) throw new Error("El mocki de opciones no devolvió una lista");
          setOpciones(lista);
        })
        .catch(console.error);
    }
  }

  // Envía algo al back. La pantalla solo cambia si el back confirmó;
  // si falla, el error queda en la consola.
  async function ejecutar(accion: () => Promise<void>) {
    setEnviando(true);
    try {
      await accion();
      setPanel(null);
    } catch (e) {
      console.error(e);
    } finally {
      setEnviando(false);
    }
  }

  async function agregarPaciente(e: FormEvent) {
    e.preventDefault();
    const elegido = disponibles.find((o) => String(o.id) === eleccion);
    if (!elegido) return;
    await ejecutar(
      async () => {
        await enviar(URL_AGREGAR_PACIENTE, { usuario: nombre, pacienteId: String(elegido.id) });
        setPacientes((anteriores) => [...anteriores, elegido]);
      },
    );
  }

  async function eliminarPaciente(e: FormEvent) {
    e.preventDefault();
    const elegido = pacientes.find((p) => String(p.id) === eleccion);
    if (!elegido) return;
    await ejecutar(
      async () => {
        await enviar(URL_ELIMINAR_PACIENTE, { usuario: nombre, pacienteId: String(elegido.id) });
        setPacientes((anteriores) => anteriores.filter((p) => String(p.id) !== String(elegido.id)));
      },
    );
  }

  // La foto se muestra apenas se elige y se manda al back.
  function cambiarFoto(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!archivo) return;

    if (!archivo.type.startsWith("image/") || archivo.size > 5 * 1024 * 1024) return;

    setFoto(URL.createObjectURL(archivo));
    // Si el back falla, solo queda registrado en la consola
    subirFoto(nombre, archivo).catch(console.error);
  }

  async function guardarCorreo(e: FormEvent) {
    e.preventDefault();
    const nuevo = nuevoCorreo.trim();
    if (!REGEX_CORREO.test(nuevo)) return;
    if (nuevo.toLowerCase() === correo.toLowerCase()) return;
    await ejecutar(
      async () => {
        await enviar(URL_CAMBIAR_CORREO, { usuario: nombre, nuevoCorreo: nuevo });
        setCorreo(nuevo);
      },
    );
  }

  if (!nombre) {
    return (
      <p className="text-center text-[length:calc(var(--u)*26)] text-black" style={estiloEscala}>
        No encontramos tu sesión. Iniciá sesión para ver tu perfil.
      </p>
    );
  }

  const cancelar = (
    <button type="button" onClick={() => setPanel(null)} className={BOTON_CLARO}>
      Cancelar
    </button>
  );

  return (
    <section
      style={estiloEscala}
      className="mx-auto w-[calc(var(--u)*1103)] max-w-full font-[Helvetica,Arial,sans-serif]"
    >
      {esPrueba && (
        <p className="mb-[calc(var(--u)*12)] rounded-lg bg-[#f7e8bb] px-[calc(var(--u)*16)] py-[calc(var(--u)*8)] text-center text-[length:calc(var(--u)*18)] text-[#5c4a1e]">
          Modo prueba: no hay sesión iniciada, estás viendo un cuidador de prueba.
        </p>
      )}

      {/* flex-col-reverse: en celular la foto queda arriba; desde md, a la derecha */}
      <div className="flex flex-col-reverse items-center gap-[calc(var(--u)*32)] rounded-[calc(var(--u)*10)] bg-[#b3d9e6] px-[calc(var(--u)*24)] py-[calc(var(--u)*40)] shadow-[0_4px_8px_rgba(0,0,0,0.3)] md:flex-row md:items-start md:justify-between md:pb-[calc(var(--u)*56)] md:pl-[calc(var(--u)*78)] md:pr-[calc(var(--u)*150)] md:pt-[calc(var(--u)*36)]">
        {/* ---------- Datos ---------- */}
        <div className="flex w-full flex-col items-center md:w-auto md:items-start">
          <div className="w-fit text-center">
            <h1 className="break-words text-[length:calc(var(--u)*40)] font-bold leading-tight text-black">
              {nombre}
            </h1>
            <p className="text-[length:calc(var(--u)*24)] leading-tight text-black">cuidador</p>
          </div>

          {cargando && (
            <p className="mt-[calc(var(--u)*40)] text-[length:calc(var(--u)*24)] text-[#4b5c78]">
              Cargando tu perfil…
            </p>
          )}
          {error && (
            <p className="mt-[calc(var(--u)*40)] text-[length:calc(var(--u)*22)] text-[#a32020]">
              No pudimos cargar tu perfil. Probá recargar la página.
            </p>
          )}

          {!cargando && !error && (
            <>
              {/* ===== Pacientes ===== */}
              <p className="mt-[calc(var(--u)*40)] text-[length:calc(var(--u)*24)] text-black">
                <strong>Pacientes</strong>:{" "}
                {pacientes.length === 0
                  ? "todavía no tenés pacientes asignados"
                  : pacientes.map((p, i) => (
                      <span key={p.id}>
                        {i > 0 && ", "}
                        {p.nombre}
                      </span>
                    ))}
              </p>

              <div className="mt-[calc(var(--u)*30)] flex flex-wrap justify-center gap-[calc(var(--u)*24)] md:justify-start">
                <button type="button" onClick={() => abrirPanel("agregar")} className={BOTON_OSCURO}>
                  Agregar paciente +
                </button>
                <button
                  type="button"
                  onClick={() => abrirPanel("eliminar")}
                  disabled={pacientes.length === 0}
                  className={BOTON_ROJO}
                >
                  Eliminar paciente
                </button>
              </div>

              {panel === "agregar" && (
                <form onSubmit={agregarPaciente} className="mt-[calc(var(--u)*16)] flex w-full flex-col gap-[calc(var(--u)*12)]">
                  <select
                    aria-label="Paciente a agregar"
                    value={eleccion}
                    onChange={(e) => setEleccion(e.target.value)}
                    className={CAMPO}
                  >
                    <option value="" disabled>
                      {disponibles.length > 0 ? "Elegí un paciente" : "No hay más pacientes para agregar"}
                    </option>
                    {disponibles.map((o) => (
                      <option key={o.id} value={String(o.id)}>
                        {o.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-[calc(var(--u)*12)]">
                    <button type="submit" disabled={enviando} className={BOTON_OSCURO}>
                      {enviando ? "Agregando…" : "Agregar"}
                    </button>
                    {cancelar}
                  </div>
                </form>
              )}

              {panel === "eliminar" && (
                <form onSubmit={eliminarPaciente} className="mt-[calc(var(--u)*16)] flex w-full flex-col gap-[calc(var(--u)*12)]">
                  <select
                    aria-label="Paciente a eliminar"
                    value={eleccion}
                    onChange={(e) => setEleccion(e.target.value)}
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
                    <button type="submit" disabled={enviando} className={BOTON_ROJO}>
                      {enviando ? "Eliminando…" : "Eliminar"}
                    </button>
                    {cancelar}
                  </div>
                </form>
              )}

              {/* ===== Correo ===== */}
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

        {/* ---------- Foto: tocar el círculo para elegir o cambiar la imagen ---------- */}
        <label
          title={foto ? "Cambiar foto" : "Agregar foto"}
          className="flex h-[calc(var(--u)*200)] w-[calc(var(--u)*200)] min-h-[100px] min-w-[100px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-black bg-[#d9d9d9] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#18243b] md:mt-[calc(var(--u)*11)]"
        >
          {foto ? (
            <img src={foto} alt={`Foto de ${nombre}`} className="h-full w-full object-cover" />
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