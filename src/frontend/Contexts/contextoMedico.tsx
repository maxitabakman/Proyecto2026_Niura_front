
import { createContext, type ReactNode, useContext, useState } from 'react';

export interface Paciente {
    id: string;
    nombre: string;
    apellido: string;
    rol: string;
    avatar: string | null;
}
interface contextoIMType {
    nombre: string;
    setNombre: (nombre: string) => void;
    pacienteActivo: Paciente | null;
    setPacienteActivo: (paciente: Paciente | null) => void;
}

const ContextoIM = createContext<contextoIMType | null>(null);

interface ProviderProps {
    children: ReactNode;
}

export const MedicoProvider = ({ children }: ProviderProps) => {
    const [nombre, setNombre] = useState<string>('');
    const [pacienteActivo, setPacienteActivo] = useState<Paciente | null>(null);

    return (
        <ContextoIM.Provider
            value={{
                nombre,
                setNombre,
                pacienteActivo,
                setPacienteActivo
            }}
        >
            {children}
        </ContextoIM.Provider>
    );
};

export const useMedico = () => {
    const contexto = useContext(ContextoIM);

    if (!contexto) {
        throw new Error('Error al cargar el contexto. Revisar su implementación.');
    }

    return contexto;
};
