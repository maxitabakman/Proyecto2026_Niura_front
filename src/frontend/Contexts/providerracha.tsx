import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { RachaContext } from './contextracha';

interface RespuestaRacha {
  message?: string;
  racha?: number | string;
}

interface UsuarioGuardado {
  rol?: number;
}

function esPacienteConSesion() {
  if (!localStorage.getItem('token')) return false;
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || 'null') as UsuarioGuardado | null;
    return Number(usuario?.rol) === 0;
  } catch {
    return false;
  }
}

interface RachaProviderProps {
  children: ReactNode;
}

export function RachaProvider({ children }: RachaProviderProps) {
  const { pathname } = useLocation();
  const esPaciente = esPacienteConSesion();
  const [rachaActual, setRachaActual] = useState(0);
  const [cargando, setCargando] = useState(esPacienteConSesion);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!esPaciente) return;

    const controlador = new AbortController();
    async function cargarRacha() {
      setCargando(true);
      try {
        const respuesta = await fetch('http://localhost:3000/paciente/verRacha', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
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
        cargando: esPaciente && cargando,
        error: esPaciente ? error : null,
      }}
    >
      {children}
    </RachaContext.Provider>
  );
}
