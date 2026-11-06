
import { useRacha } from "../Contexts/contextracha";

export default function ListaRacha (){
  // Consumimos los datos del contexto de la racha
  const { rachaActual, cargando, error } = useRacha();

  // Objetivo temporal: llegar a los 30 días
  const proximoObjetivo = 30;

  // Calculamos cuántos días faltan para llegar al objetivo
  const diasRestantes = Math.max(0, proximoObjetivo - rachaActual);

  // Estimamos las semanas suponiendo que se completa un día por día
  const semanasRestantes = Math.ceil(diasRestantes / 7);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#a3d5df] to-[#d3e1f5] px-4 pt-[60px]">
      {/* Panel principal */}
      <div className="mx-auto flex min-h-[500px] w-full max-w-[904px] flex-col items-center rounded-[11px] bg-[#e4d585] px-6 pb-7 pt-8 shadow-md sm:px-12">

        {/* Título de la racha */}
        <h1 className="text-center text-2xl font-bold leading-tight text-[#34445f] sm:text-[34px]">
          {cargando ? 'Cargando racha...' : `Llevas una racha de ${rachaActual} días`}
        </h1>
        {error && <p role="alert" className="mt-4 text-center text-red-800">{error}</p>}

        {/* Rectángulo celeste vacío */}
        <div
          className="mt-[55px] h-[238px] w-full max-w-[544px] rounded-[14px] border-[3px] border-black bg-[#deebfc]"
          aria-label="Espacio para la representación gráfica de la racha"
        />

        {/* Estimación del próximo objetivo */}
        <p className="mt-7 max-w-[650px] text-center text-xl leading-[1.4] text-[#14284b] sm:text-[30px]">
          A este ritmo, estimamos que llegarás a tu próximo objetivo en{" "}
          {semanasRestantes}{" "}
          {semanasRestantes === 1 ? "semana" : "semanas"}
        </p>
      </div>
    </div>
  );
};