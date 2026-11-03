import  { useState, useEffect } from 'react';

// Interface de la respuesta que se espera del backend / Mocky
interface PatientProgressResponse {
  racha: number;
  mejora: number;
  historial: number[];
}

// Datos Mock por defecto (fallback local inmediato)
const MOCK_INITIAL_DATA: PatientProgressResponse = {
  racha: 14,
  mejora: 10,
  historial: [15, 22, 38, 36, 48, 0, 60, 32, 85]
};

// URL de la API de Mocky (reemplazable por tu endpoint real)
const MOCKY_API_URL = 'https://run.mocky.io/v3/d78216bc-0899-4d64-9be1-332e6ee54d19';

/**
 * Algoritmo Catmull-Rom a Bezier cúbico para generar trazados curvas suaves y
 * naturales en SVG puro a partir de cualquier array de números.
 */
function generateSmoothSvgPath(
  data: number[],
  width: number,
  height: number,
  paddingX = 30,
  paddingY = 25
): string {
  if (!data || data.length === 0) return '';
  if (data.length === 1) {
    return `M ${paddingX},${height / 2} L ${width - paddingX},${height / 2}`;
  }

  const minVal = Math.min(0, ...data);
  const maxVal = Math.max(100, ...data);
  const range = maxVal - minVal || 1;

  // Convertimos cada número del array a coordenadas XY
  const points = data.map((val, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - 2 * paddingX);
    const y = (height - paddingY) - ((val - minVal) / range) * (height - 2 * paddingY);
    return { x, y };
  });

  let path = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

  // Trazado de Bezier suavizado
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  return path;
}

export default function PatientProgressScreen() {
  const [patientData, setPatientData] = useState<PatientProgressResponse>(MOCK_INITIAL_DATA);
  const [loading, setLoading] = useState<boolean>(false);

  // Carga de datos desde API / Mocky
  useEffect(() => {
    const fetchPatientProgress = async () => {
      setLoading(true);
      try {
        const res = await fetch(MOCKY_API_URL);
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const json: PatientProgressResponse = await res.json();
        setPatientData(json);
      } catch (err) {
        console.warn('Servidor Mocky no disponible. Usando datos locales por defecto.', err);
        setPatientData(MOCK_INITIAL_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientProgress();
  }, []);

  // Gráfico ajustado a 800x190
  const svgPath = generateSmoothSvgPath(patientData.historial, 800, 190);

  return (
    <div className="">      
      {/* Contenido principal reducido a max-w-2xl */}
      <div className="w-full max-w-2xl space-y-5 flex flex-col justify-center">
        
        {/* Encabezado: Botón volver + Título */}
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => window.history.back()}
            className="absolute left-0 w-9 h-9 rounded-full border border-black flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all"
            title="Volver"
            aria-label="Volver"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>

          <h1 className="text-xl md:text-2xl font-bold text-center tracking-tight text-black">
            Progreso del paciente:
          </h1>
        </div>

        {/* Marco del gráfico (Altura compacta: ~180px) */}
        <div className="w-full bg-[#d8e5ed] border-2 border-[#f5a623] rounded-xl p-3 shadow-[0px_4px_4px_0px_#00000040] relative overflow-hidden">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-gray-700 text-sm font-medium">
              Cargando datos del paciente...
            </div>
          ) : (
            <div className="w-full h-36 md:h-44 flex items-center justify-center">
              <svg
                viewBox="0 0 800 190"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
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
            </div>
          )}
        </div>

        {/* Texto reducido a proporciones estándar */}
        <p className="text-center text-base md:text-lg font-normal text-black tracking-tight px-2">
          El paciente lleva una racha de{' '}
          <span className="font-semibold">{patientData.racha}</span> días, y ha mejorado en general un{' '}
          <span className="font-semibold">{patientData.mejora}%</span>.
        </p>

        {/* Botón centrado más compacto */}
        <div className="flex justify-center pt-1">
          <button
            onClick={() => console.log('Asignar nuevos ejercicios')}
            className="bg-gradient-to-b from-[#a3d5e8] via-[#75bcdb] to-[#519fbf] hover:from-[#92cae0] hover:to-[#428ea3] text-black font-bold text-base md:text-lg px-7 py-2.5 md:py-3 rounded-xl shadow-[0px_4px_4px_0px_#00000040] border border-[#5a9ebb]/30 active:scale-95 transition-all text-center leading-tight"
          >
            Asignar nuevos ejercicios
          </button>
        </div>

      </div>
    </div>
  );
}