import { createContext, useContext } from "react";

export interface DiaRacha {
  fecha: Date;
  completado: boolean;
}

export interface RachaContextType {
  rachaActual: number;
  rachaMaxima: number;
  historial: DiaRacha[];
  toggleDia: (fecha: Date) => void; // Permite marcar/desmarcar días
}

export const RachaContext = createContext<RachaContextType | null>(null);

export const useRacha = () => {
  const context = useContext(RachaContext);
  if (!context) {
    throw new Error("useRacha debe utilizarse dentro de un RachaProvider");
  }
  return context;
};