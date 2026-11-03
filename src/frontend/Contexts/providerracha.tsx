import  { useState, useEffect, useMemo, type ReactNode } from "react";
import { RachaContext, type DiaRacha } from "./contextracha";

const calcularRacha = (rachas: DiaRacha[]): [number, number] => {
  let rachamaxima = 0;
  let conteoRacha = 0;

  for (let i = 0; i < rachas.length; i++) {
    if (rachas[i].completado) {
      conteoRacha++;
      if (conteoRacha > rachamaxima) {
        rachamaxima = conteoRacha;
      }
    } else {
      conteoRacha = 0;
    }
  }

  return [conteoRacha, rachamaxima];
};

interface RachaProviderProps {
  children: ReactNode;
}

export function RachaProvider({ children}: RachaProviderProps) {
  const [historial, setHistorial] = useState<DiaRacha[]>([]);

  // Petición al backend para traer el historial del usuario
  useEffect(() => {


    fetch(`https://mocki.io/v1/84dbfc80-b7f3-4554-bcec-e3a45736044a`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { fecha: string; completado: boolean }[]) => {
        // Mapeamos los datos para convertir la fecha en texto a objeto Date
        const historialFormateado: DiaRacha[] = data.map((item) => ({
          fecha: new Date(item.fecha),
          completado: item.completado,
        }));
        
        setHistorial(historialFormateado);
      })
      .catch((error) => console.error("Error al obtener el historial:", error));
  }, []);

  const [rachaActual, rachaMaxima] = useMemo(
    () => calcularRacha(historial),
    [historial]
  );

  const toggleDia = (fechaTarget: Date) => {
    setHistorial((prevHistorial) =>
      prevHistorial.map((dia) =>
        dia.fecha.getTime() === fechaTarget.getTime()
          ? { ...dia, completado: !dia.completado }
          : dia
      )
    );
  };

  return (
    <RachaContext.Provider
      value={{
        rachaActual,
        rachaMaxima,
        historial,
        toggleDia,
      }}
    >
      {children}
    </RachaContext.Provider>
  );
}