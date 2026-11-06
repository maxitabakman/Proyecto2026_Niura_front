import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface ResultadoEvaluado {
  puntaje: number;
  fecha: string;
}

interface PatientProgressResponse {
  racha: number;
  resultados: ResultadoEvaluado[];
  message?: string;
}

function generateSmoothSvgPath(data: number[], width: number, height: number): string {
  if (data.length === 0) return '';
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

export default function PatientProgressScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !id) return;

    const controller = new AbortController();
    async function fetchPatientProgress() {
      try {
        const response = await fetch(
          `http://localhost:3000/doctor/progresoPaciente/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        const data: PatientProgressResponse = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `El servidor respondió ${response.status}.`);
        }
        if (typeof data.racha !== 'number' || !Array.isArray(data.resultados)) {
          throw new Error('El servidor devolvió datos de progreso inválidos.');
        }
        setPatientData(data);
        setError('');
      } catch (fallo) {
        if (controller.signal.aborted) return;
        console.error('Error al cargar el progreso del paciente:', fallo);
        setError(
          fallo instanceof Error
            ? fallo.message
            : 'No se pudo cargar el progreso del paciente.',
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void fetchPatientProgress();
    return () => controller.abort();
  }, [id]);

  const resultados = patientData?.resultados ?? [];
  const svgPath = generateSmoothSvgPath(
    resultados.map((resultado) => resultado.puntaje),
    800,
    190,
  );

  return (
    <div>
      <div className="flex w-full max-w-2xl flex-col justify-center space-y-5">
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border border-black transition-all hover:bg-black/10 active:scale-95"
            title="Volver"
            aria-label="Volver"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-center text-xl font-bold tracking-tight text-black md:text-2xl">
            Progreso del paciente
          </h1>
        </div>

        <div className="relative overflow-hidden rounded-xl border-2 border-[#f5a623] bg-[#d8e5ed] p-3 shadow-[0px_4px_4px_0px_#00000040]">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm font-medium text-gray-700">
              Cargando datos del paciente...
            </div>
          ) : error ? (
            <p className="p-4 text-center text-red-800" role="alert">{error}</p>
          ) : resultados.length === 0 ? (
            <p className="p-4 text-center text-gray-700">
              Todavía no hay resultados evaluados para mostrar.
            </p>
          ) : (
            <div className="flex h-36 w-full items-center justify-center md:h-44">
              <svg
                viewBox="0 0 800 190"
                className="h-full w-full overflow-visible"
                preserveAspectRatio="none"
                aria-label="Resultados evaluados a lo largo del tiempo"
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
            </div>
          )}
        </div>

        <p className="px-2 text-center text-base font-normal tracking-tight text-black md:text-lg">
          El paciente lleva una racha de{' '}
          <span className="font-semibold">{patientData?.racha ?? 0}</span> días.
          {patientData && ` Hay ${resultados.length} resultados evaluados registrados.`}
        </p>

        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => id && navigate(`/medico/asignarEjercicio/${id}`)}
            className="rounded-xl border border-[#5a9ebb]/30 bg-gradient-to-b from-[#a3d5e8] via-[#75bcdb] to-[#519fbf] px-7 py-2.5 text-center text-base font-bold leading-tight text-black shadow-[0px_4px_4px_0px_#00000040] transition-all hover:from-[#92cae0] hover:to-[#428ea3] active:scale-95 md:py-3 md:text-lg"
          >
            Asignar nuevos ejercicios
          </button>
        </div>
      </div>
    </div>
  );
}
