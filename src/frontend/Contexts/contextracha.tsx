import { createContext, useContext } from "react";

export interface ResultadoEvaluado {
  puntaje: number;
  fecha: string;
}

export interface RachaContextType {
  rachaActual: number;
  resultados: ResultadoEvaluado[];
  cargando: boolean;
  error: string | null;
}

export const RachaContext = createContext<RachaContextType | null>(null);

export const useRacha = () => {
  const context = useContext(RachaContext);
  if (!context) {
    throw new Error("useRacha debe utilizarse dentro de un RachaProvider");
  }
  return context;
};