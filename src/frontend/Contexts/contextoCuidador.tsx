import {
    useContext,
    createContext,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from 'react';

// Un paciente asignado al cuidador. Se exporta para reutilizarlo en otras pantallas.
export interface Paciente {
    id: string | number;
    nombre: string;
}

interface contextoICType {
    nombre: string;
    setNombre: (nombre: string) => void;
    pacienteActivo: Paciente | null;
    setPacienteActivo: Dispatch<SetStateAction<Paciente | null>>;
}

const ContextoIC = createContext<contextoICType | null>(null);

interface ProviderProps {
    children: ReactNode;
}

export const CuidadorProvider = ({ children }: ProviderProps) => {
    const [nombre, setNombre] = useState<string>('');
    const [pacienteActivo, setPacienteActivo] = useState<Paciente | null>(null);

    return (
        <ContextoIC.Provider
            value={{ nombre, setNombre, pacienteActivo, setPacienteActivo }}
        >
            {children}
        </ContextoIC.Provider>
    );
};

export const useCuidador = () => {
    const contexto = useContext(ContextoIC);
    if (!contexto) {
        throw 'Error al cargar el contexto. Revisar su implementación.';
    }
    return contexto;
};