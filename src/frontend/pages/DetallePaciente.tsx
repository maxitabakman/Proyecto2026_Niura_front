import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useMedico } from '../Contexts/contextoMedico';

export default function DetallePaciente() {
    const { pacienteActivo } = useMedico();
    const navigate = useNavigate();

    if (!pacienteActivo) {
        return null;
    }

    return (
        <main >
            <div className="mx-auto max-w-[910px]">

                {/* Nombre del paciente */}
                <h1 className="mb-14 text-center text-2xl text-black sm:text-left sm:text-3xl">
                    <span className="font-bold">Paciente:</span>{' '}
                    {pacienteActivo.nombre} {pacienteActivo.apellido}
                </h1>

                {/* Tarjetas principales */}
                <div className="grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-3 sm:gap-6">

                    {/* Ver historial */}
                    <button
                        type="button"
                        onClick={() => navigate(`/medico/pacient/${pacienteActivo.id}/historial`)}
                        className="flex h-[260px] w-full max-w-[270px] items-center justify-center rounded-xl border-l-[11px] border-[#827d70] bg-gradient-to-b from-[#d6eaff] to-[#51a9d8] px-4 text-center text-2xl font-bold text-black shadow-md transition-transform hover:scale-[1.03]"
                    >
                        <span className="drop-shadow-[2px_3px_2px_rgba(0,0,0,0.45)]">
                            Ver historial
                        </span>
                    </button>

                    {/* Ver progreso */}
                    <button
                        type="button"
                        onClick={() => navigate(`/medico/pacient/${pacienteActivo.id}/progreso`)}
                        className="flex h-[260px] w-full max-w-[270px] items-center justify-center rounded-xl border-l-[11px] border-[#827d70] bg-gradient-to-b from-[#e4edfa] to-[#f2df91] px-4 text-center text-2xl font-bold text-black shadow-md transition-transform hover:scale-[1.03]"
                    >
                        <span className="drop-shadow-[2px_3px_2px_rgba(0,0,0,0.45)]">
                            Ver progreso
                        </span>
                    </button>

                    {/* Asignar ejercicios */}
                    <button
                        type="button"
                        onClick={() => navigate(`/medico/pacient/${pacienteActivo.id}/ejercicios`)}
                        className="flex h-[260px] w-full max-w-[270px] items-center justify-center rounded-xl border-l-[11px] border-[#827d70] bg-gradient-to-b from-[#d6eaff] to-[#9bd2d4] px-4 text-center text-2xl font-bold text-black shadow-md transition-transform hover:scale-[1.03]"
                    >
                        <span className="max-w-[190px] drop-shadow-[2px_3px_2px_rgba(0,0,0,0.45)]">
                            Asignar ejercicios
                        </span>
                    </button>

                </div>

                {/* Cambiar paciente */}
                <div className="mt-16 flex justify-center">
                    <button
                        type="button"
                        onClick={() => navigate('/medico/pacient')}
                        className="flex items-center gap-3 rounded-xl bg-[#087bff] px-3 py-2 text-xl font-bold text-white shadow-md transition-colors hover:bg-blue-700"
                    >
                        Cambiar paciente
                        <Icon icon="mdi:swap-horizontal" className="h-7 w-7" />
                    </button>
                </div>

            </div>
        </main>
    );
}