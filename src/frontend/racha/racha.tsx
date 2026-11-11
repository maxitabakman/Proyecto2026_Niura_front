import { useRacha, type ResultadoEvaluado } from "../Contexts/contextracha";

function promediarPorDia(resultados: ResultadoEvaluado[]): number[] {
  const porDia = new Map<string, { suma: number; cantidad: number }>();

  for (const item of resultados) {
    const claveDia = item.fecha ? item.fecha.split("T")[0].split(" ")[0] : "dia";
    const puntaje = Number(item.puntaje);
    if (!Number.isFinite(puntaje)) continue;

    const actual = porDia.get(claveDia) ?? { suma: 0, cantidad: 0 };
    porDia.set(claveDia, {
      suma: actual.suma + puntaje,
      cantidad: actual.cantidad + 1,
    });
  }

  return Array.from(porDia.values()).map(({ suma, cantidad }) => suma / cantidad);
}

function generateSmoothSvgPath(data: number[], width: number, height: number): string {
  if (data.length === 0) return "";
  if (data.length === 1) return `M 30,${height / 2} L ${width - 30},${height / 2}`;

  const minVal = Math.min(0, ...data);
  const maxVal = Math.max(100, ...data);
  const range = maxVal - minVal || 1;
  const points = data.map((value, index) => ({
    x: 30 + (index / (data.length - 1)) * (width - 60),
    y: height - 25 - ((value - minVal) / range) * (height - 50),
  }));
  let path = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

  for (let index = 0; index < points.length - 1; index++) {
    const p0 = points[index === 0 ? index : index - 1];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? points[index + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return path;
}

export default function ListaRacha() {
  // Consumimos los datos del contexto de la racha
  const { rachaActual, resultados, cargando, error } = useRacha();

  // Objetivo temporal: llegar a los 30 días
  const proximoObjetivo = 30;

  // Calculamos cuántos días faltan para llegar al objetivo
  const diasRestantes = Math.max(0, proximoObjetivo - rachaActual);

  // Estimamos las semanas suponiendo que se completa un día por día
  const semanasRestantes = Math.ceil(diasRestantes / 7);

  // Promediamos por día los datos recibidos
  const promediosDiarios = promediarPorDia(resultados);
  const svgPath = generateSmoothSvgPath(promediosDiarios, 800, 190);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#a3d5df] to-[#d3e1f5] px-4 pt-[60px]">
      {/* Panel principal */}
      <div className="mx-auto flex min-h-[500px] w-full max-w-[904px] flex-col items-center rounded-[11px] bg-[#e4d585] px-6 pb-7 pt-8 shadow-md sm:px-12">

        {/* Título de la racha */}
        <h1 className="text-center text-2xl font-bold leading-tight text-[#34445f] sm:text-[34px]">
          {cargando ? "Cargando racha..." : `Llevas una racha de ${rachaActual} días`}
        </h1>
        {error && <p role="alert" className="mt-4 text-center text-red-800">{error}</p>}

        {/* Rectángulo celeste con el gráfico lineal adentro */}
        <div
          className="mt-[55px] flex h-[238px] w-full max-w-[544px] items-center justify-center overflow-hidden rounded-[14px] border-[3px] border-black bg-[#deebfc] p-4"
          aria-label="Espacio para la representación gráfica de la racha"
        >
          {cargando ? (
            <p className="text-sm font-medium text-[#34445f]">Cargando gráfico...</p>
          ) : promediosDiarios.length === 0 ? (
            <p className="text-center text-sm font-medium text-[#34445f]">
              Todavía no hay resultados evaluados para mostrar.
            </p>
          ) : (
            <svg
              viewBox="0 0 800 190"
              className="h-full w-full overflow-visible"
              preserveAspectRatio="none"
              aria-label="Promedio de resultados evaluados a lo largo del tiempo"
              role="img"
            >
              <path
                d={svgPath}
                fill="none"
                stroke="#e89209"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Estimación del próximo objetivo */}
        <p className="mt-7 max-w-[650px] text-center text-xl leading-[1.4] text-[#14284b] sm:text-[30px]">
          A este ritmo, estimamos que llegarás a tu próximo objetivo en{" "}
          {semanasRestantes}{" "}
          {semanasRestantes === 1 ? "semana" : "semanas"}
        </p>
      </div>
    </div>
  );
}