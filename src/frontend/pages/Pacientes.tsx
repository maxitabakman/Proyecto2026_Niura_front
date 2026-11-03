
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import PatientCard from '../components/patientCard';
import { useMedico, type Paciente } from '../Contexts/contextoMedico';

const URL_PACIENTES = 'https://mocki.io/v1/9082de34-f8cf-43f6-a0ea-8567192e60da';

const PACIENTES_POR_PAGINA = 7;

interface RespuestaPacientes {
    pacientes: Paciente[];
}

export default function Pacientes() {
    const { setPacienteActivo } = useMedico();
    const navigate = useNavigate();

    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        async function cargarPacientes() {
            try {
                setCargando(true);
                setError('');

                const respuesta = await fetch(URL_PACIENTES, {
                    signal: controller.signal
                });

                if (!respuesta.ok) {
                    throw new Error('No se pudieron obtener los pacientes.');
                }

                const datos: RespuestaPacientes = await respuesta.json();
                setPacientes(datos.pacientes);
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }

                setError('No se pudieron cargar los pacientes. Intentá nuevamente.');
            } finally {
                if (!controller.signal.aborted) {
                    setCargando(false);
                }
            }
        }

        cargarPacientes();

        return () => controller.abort();
    }, []);

    const pacientesFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLocaleLowerCase('es');

        return pacientes.filter((paciente) =>
            `${paciente.nombre} ${paciente.apellido}`
                .toLocaleLowerCase('es')
                .includes(texto)
        );
    }, [pacientes, busqueda]);

    const cantidadPaginas = Math.ceil(
        pacientesFiltrados.length / PACIENTES_POR_PAGINA
    );

    const pacientesVisibles = pacientesFiltrados.slice(
        paginaActual * PACIENTES_POR_PAGINA,
        (paginaActual + 1) * PACIENTES_POR_PAGINA
    );

    function cambiarBusqueda(valor: string) {
        setBusqueda(valor);
        setPaginaActual(0);
    }

    function seleccionarPaciente(paciente: Paciente) {
        setPacienteActivo(paciente);
        navigate(`/medico/pacient/${paciente.id}`);
    }
    useEffect(() => {
        function manejarTeclas(e: KeyboardEvent) {
            // No interferir mientras se escribe en el buscador
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }
    
            if (e.key === 'ArrowRight') {
                setPaginaActual(actual =>
                    Math.min(cantidadPaginas - 1, actual + 1)
                );
            }
    
            if (e.key === 'ArrowLeft') {
                setPaginaActual(actual =>
                    Math.max(0, actual - 1)
                );
            }
        }
    
        window.addEventListener('keydown', manejarTeclas);
    
        return () => {
            window.removeEventListener('keydown', manejarTeclas);
        };
    }, [cantidadPaginas]);

    return (
        <main>
            <div className="mx-auto max-w-[1200px]">
                <h1 className="mb-[18px] text-center text-[32px] leading-tight font-bold text-black">
                    Tus pacientes
                </h1>
    
                <div className="mx-auto mb-[45px] flex h-[40px] w-full max-w-[554px] items-center rounded-[11px] bg-[#dedede] px-7 shadow-md">
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => cambiarBusqueda(e.target.value)}
                        placeholder="ingresa el nombre del paciente"
                        aria-label="Buscar paciente"
                        className="min-w-0 flex-1 bg-transparent text-[14px] text-gray-700 outline-none placeholder:text-[#a9adb3] placeholder:underline"
                    />
    
                    <Icon
                        icon="mdi:magnify"
                        className="h-[19px] w-[19px] shrink-0 text-[#64748b]"
                    />
                </div>
    
                {cargando ? (
                    <p className="py-12 text-center text-slate-600">
                        Cargando pacientes...
                    </p>
                ) : error ? (
                    <p role="alert" className="py-12 text-center text-red-700">
                        {error}
                    </p>
                ) : pacientesFiltrados.length === 0 ? (
                    <p className="py-12 text-center text-slate-600">
                        No se encontraron pacientes.
                    </p>
                ) : (
                    <>
                       <div className="relative mx-auto w-full max-w-[1200px] px-8 sm:px-12 md:px-[58px]">
                            <button
                                type="button"
                                aria-label="Pacientes anteriores"
                                disabled={paginaActual === 0}
                                onClick={() =>
                                    setPaginaActual((actual) => actual - 1)
                                }
                                className="absolute left-[-8px] top-[105px] z-10 text-[#07517a] drop-shadow-sm transition hover:scale-110 disabled:opacity-30 md:left-[-3px]"
                            >
                                <Icon
                                    icon="mdi:chevron-left"
                                    className="h-10 w-10"
                                />
                            </button>
    
                            <div className="grid grid-cols-7 gap-x-2 sm:gap-x-4 lg:gap-x-[28px]">
                                     {pacientesVisibles.map((paciente) => (
                                    <PatientCard
                                        key={paciente.id}
                                        paciente={paciente}
                                        onClick={() => seleccionarPaciente(paciente)}
                                    />
                                ))}
                            </div>
    
                            <button
                                type="button"
                                aria-label="Pacientes siguientes"
                                disabled={paginaActual >= cantidadPaginas - 1}
                                onClick={() =>
                                    setPaginaActual((actual) => actual + 1)
                                }
                                className="absolute right-[-8px] top-[105px] z-10 text-[#07517a] drop-shadow-sm transition hover:scale-110 disabled:opacity-30 md:right-[-3px]"
                            >
                                <Icon
                                    icon="mdi:chevron-right"
                                    className="h-10 w-10"
                                />
                            </button>
                        </div>
    
                        {cantidadPaginas > 1 && (
                            <div className="mt-[44px] flex items-center justify-center gap-[12px]">
                                {Array.from(
                                    { length: cantidadPaginas },
                                    (_, indice) => (
                                        <button
                                            key={indice}
                                            type="button"
                                            aria-label={`Página ${indice + 1}`}
                                            aria-current={
                                                paginaActual === indice
                                                    ? 'page'
                                                    : undefined
                                            }
                                            onClick={() => setPaginaActual(indice)}
                                            className={`h-[17px] w-[17px] rounded-full border border-[#252525] transition ${
                                                paginaActual === indice
                                                    ? 'bg-[#8d9baa]'
                                                    : 'bg-[#e0e0e0] hover:bg-[#bdcbd8]'
                                            }`}
                                        />
                                    )
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}    