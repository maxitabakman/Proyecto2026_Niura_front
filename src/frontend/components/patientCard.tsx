
import { Icon } from '@iconify/react';
import type { Paciente } from '../Contexts/contextoMedico';

interface PatientCardProps {
    paciente: Paciente;
    onClick: () => void;
}

export default function PatientCard({
    paciente,
    onClick
}: PatientCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex h-[267px] w-full min-w-0 flex-col items-center rounded-[11px] bg-gradient-to-b from-[#dcecff] to-[#d5d5d5] pt-[46px] shadow-[0_3px_4px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
        >
            <div className="flex h-[95px] w-[74px] shrink-0 items-center justify-center overflow-hidden rounded-[21px] bg-[#dcecff] shadow-[0_3px_4px_rgba(0,0,0,0.28)]">
                {paciente.avatar ? (
                    <img
                        src={paciente.avatar}
                        alt={`${paciente.nombre} ${paciente.apellido}`}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <Icon
                        icon="mdi:account"
                        className="h-[52px] w-[52px] text-[#b5cde5]"
                    />
                )}
            </div>

            <span className="mt-[28px] max-w-full px-1 text-center text-[16px] leading-[18px] font-bold text-black">
                {paciente.nombre}
                <br />
                {paciente.apellido}
            </span>
        </button>
    );
}
