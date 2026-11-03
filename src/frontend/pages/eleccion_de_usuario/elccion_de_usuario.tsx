import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const ESCALA = 1;
const estiloEscala = {
  "--u": `max(0.55px, calc(min(100vw / 1366, 100vh / 768) * ${ESCALA}))`,
} as CSSProperties;

interface ElegirusuarioProps {
  titulo?: string;
  rutaVolver?: string;
  rutaPaciente?: string;
  rutaCuidador?: string;
  rutaMedico?: string;
}

function ArrowLeft(): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[calc(var(--u)*20)] w-[calc(var(--u)*20)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 12H4" />
      <path d="M10 6l-6 6 6 6" />
    </svg>
  );
}

export default function Elegirusuario({
  titulo = "Registrate",
  rutaVolver = "/",
  rutaPaciente = "/registroPaciente",
  rutaCuidador = "/registroCuidador",
  rutaMedico = "/registroMedico",
}: ElegirusuarioProps) {
  const navigate = useNavigate();

  const opciones: { ruta: string; label: string; gradient: string }[] = [
    {
      ruta: rutaPaciente,
      label: "Paciente",
      gradient: "bg-gradient-to-b from-[#90cad5] to-[#46afb2]",
    },
    {
      ruta: rutaCuidador,
      label: "Cuidador",
      gradient: "bg-gradient-to-b from-[#ded9b8] via-[#eadca9] to-[#f7e8bb]",
    },
    {
      ruta: rutaMedico,
      label: "Médico",
      gradient: "bg-gradient-to-b from-[#9dcedc] to-[#7bbae0]",
    },
  ];

  return (
    <main
      style={estiloEscala}
      className="relative w-full font-[Helvetica,Arial,sans-serif]"
    >
      <img
        src="/src/frontend/images/logo_niura.png"
        alt="Niura"
        className="h-auto w-12 md:absolute md:left-[4.5%] md:top-[calc(var(--u)*44)] md:w-[calc(var(--u)*81)]"
      />

      <div className="mx-auto w-[calc(var(--u)*823)] max-w-full pt-4 md:pt-[calc(var(--u)*90)]">
        <header className="relative mb-[calc(var(--u)*48)] flex h-[calc(var(--u)*64)] items-center justify-center md:pr-[calc(var(--u)*60)]">
          <button
            type="button"
            onClick={() => navigate(rutaVolver)}
            aria-label="Volver"
            className="absolute left-[calc(var(--u)*6)] top-1/2 flex h-[calc(var(--u)*43)] w-[calc(var(--u)*43)] -translate-y-1/2 items-center justify-center rounded-full border border-black text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <ArrowLeft />
          </button>
          <h1 className="text-[length:calc(var(--u)*56)] font-bold leading-none text-black underline decoration-[2px] underline-offset-[calc(var(--u)*6)] translate-x-[23px]">
            {titulo}
          </h1>
        </header>

        <div className="flex flex-col gap-[calc(var(--u)*48)]">
          {opciones.map(({ ruta, label, gradient }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(ruta)}
              className={`${gradient} flex h-[calc(var(--u)*124)] w-full items-center justify-center rounded-md text-[length:calc(var(--u)*46)] text-[#94846a] shadow-[0_2px_4px_rgba(0,0,0,0.3)] [text-shadow:1px_2px_3px_rgba(0,0,0,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}