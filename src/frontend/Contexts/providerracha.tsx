import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { RachaContext, type ResultadoEvaluado } from './contextracha';

interface RespuestaRacha {
  message?: string;
  racha?: number | string;
  resultados?: ResultadoEvaluado[];
  tareas?: Array<{ id?: number; puntaje?: number; fecha?: string; created_at?: string }>;
}

interface UsuarioGuardado {
  id?: number | string;
  rol?: number;
}

function obtenerUsuarioSesion(): UsuarioGuardado | null {
  if (!localStorage.getItem('token')) return null;
  try {
    return JSON.parse(localStorage.getItem('user') || 'null') as UsuarioGuardado | null;
  } catch {
    return null;
  }
}

function esPacienteConSesion() {
  const usuario = obtenerUsuarioSesion();
  return Number(usuario?.rol) === 0;
}

interface RachaProviderProps {
  children: ReactNode;
}

export function RachaProvider({ children }: RachaProviderProps) {
  const { pathname } = useLocation();
  const esPaciente = esPacienteConSesion();
  const [rachaActual, setRachaActual] = useState(0);
  const [resultados, setResultados] = useState<ResultadoEvaluado[]>([]);
  const [cargando, setCargando] = useState(esPacienteConSesion);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!esPaciente) return;

    const controlador = new AbortController();
    const token = localStorage.getItem('token') || '';
    const usuario = obtenerUsuarioSesion();
    const idPaciente = usuario?.id;

    async function cargarRacha() {
      setCargando(true);
      try {
        // 1. Pedimos la racha al endpoint que ya existe en routes/paciente.js
        const respuesta = await fetch('http://localhost:3000/paciente/verRacha', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controlador.signal,
        });
        const datos: RespuestaRacha = await respuesta.json();
        if (!respuesta.ok || datos.racha === undefined) {
          throw new Error(datos.message || `El servidor respondió ${respuesta.status}.`);
        }

        const racha = Number(datos.racha);
        if (!Number.isFinite(racha) || racha < 0) {
          throw new Error('El servidor devolvió un valor de racha inválido.');
        }
        setRachaActual(racha);

        // 2. Intentamos traer los resultados del endpoint existente en el backend sin modificarlo
        let listaResultados: ResultadoEvaluado[] = [];

        if (Array.isArray(datos.resultados)) {
          listaResultados = datos.resultados;
        } else if (idPaciente !== undefined) {
          try {
            const resProg = await fetch(
              `http://localhost:3000/doctor/progresoPaciente/${idPaciente}`,
              {
                headers: { Authorization: `Bearer ${token}` },
                signal: controlador.signal,
              },
            );
            if (resProg.ok) {
              const dataProg: RespuestaRacha = await resProg.json();
              if (Array.isArray(dataProg.resultados)) {
                listaResultados = dataProg.resultados;
              }
            }
          } catch {
            // Si no responde ese endpoint, seguimos con el fallback
          }
        }

        // 3. Si el endpoint del doctor filtró por rol, consultamos /paciente/verTareas que ya existe
        if (listaResultados.length === 0) {
          try {
            const resTareas = await fetch('http://localhost:3000/paciente/verTareas', {
              headers: { Authorization: `Bearer ${token}` },
              signal: controlador.signal,
            });
            if (resTareas.ok) {
              const dataTareas: RespuestaRacha = await resTareas.json();
              if (Array.isArray(dataTareas.tareas) && dataTareas.tareas.length > 0) {
                listaResultados = dataTareas.tareas.map((t, idx) => ({
                  puntaje: Number(t.puntaje ?? 0),
                  fecha: t.fecha || t.created_at || `dia-${idx + 1}`,
                }));
              }
            }
          } catch {
            // Ignoramos si falla
          }
        }

        setResultados(listaResultados);
        setError(null);
      } catch (fallo) {
        if (controlador.signal.aborted) return;
        console.error('Error al consultar la racha del paciente:', fallo);
        setError(
          fallo instanceof Error ? fallo.message : 'No se pudo cargar la racha.',
        );
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    void cargarRacha();
    return () => controlador.abort();
  }, [esPaciente, pathname]);

  return (
    <RachaContext.Provider
      value={{
        rachaActual: esPaciente ? rachaActual : 0,
        resultados: esPaciente ? resultados : [],
        cargando: esPaciente && cargando,
        error: esPaciente ? error : null,
      }}
    >
      {children}
    </RachaContext.Provider>
  );
}