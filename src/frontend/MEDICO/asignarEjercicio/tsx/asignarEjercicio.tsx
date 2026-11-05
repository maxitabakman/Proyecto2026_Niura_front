import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useMedico } from '../../../Contexts/contextoMedico';
import type { Ejercicios } from '../../../PACIENTE/seleccionEjercicio/seleccionDeEjercicios';
import flecha from '../../../PACIENTE/seleccionVIDEO/flecha.png';
import flechaSiguiente from '../../../PACIENTE/seleccionEjercicio/arrowback.png';
import lupa from '../img/boxicons_search-alt.png';
import '../css/asignarEjercicio.css';
import botonCrear from '../img/btn-crea.png';

export default function AsignarEjercicio() {
    const [ejercicios, setEjercicios] = useState<Ejercicios[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(0);
    const [cargando, setCargando] = useState(Boolean(localStorage.getItem('token')));
    const [error, setError] = useState(
        localStorage.getItem('token') ? '' : 'Iniciá sesión para ver las tareas.',
    );
    const elementosPorPagina = 4;

    const navigate = useNavigate();
    const { pacienteId: pacienteIdRuta } = useParams<{ pacienteId: string }>();
    const { pacienteActivo } = useMedico();
    const pacienteId = pacienteIdRuta ?? pacienteActivo?.id;
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!pacienteId || !token) return;
        const idPaciente = pacienteId;

        const controller = new AbortController();
        async function cargarTareas() {
            try {
                const response = await fetch(
                    `http://localhost:3000/doctor/verTareas?idPaciente=${encodeURIComponent(idPaciente)}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        signal: controller.signal,
                    },
                );
                const data: { message?: string; tareas?: Ejercicios[] } = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || `El servidor respondió ${response.status}.`);
                }
                if (!Array.isArray(data.tareas)) {
                    throw new Error('El servidor devolvió una lista de tareas inválida.');
                }
                setEjercicios(data.tareas);
                setError('');
            } catch (fallo) {
                if (controller.signal.aborted) return;
                console.error('Error al consultar las tareas:', fallo);
                setError(fallo instanceof Error ? fallo.message : 'No se pudieron cargar las tareas.');
            } finally {
                if (!controller.signal.aborted) setCargando(false);
            }
        }
        void cargarTareas();
        return () => controller.abort();
    }, [pacienteId, token]);

    const ejerciciosFiltrados = ejercicios.filter((ejercicio) =>
        ejercicio.nombre.toLowerCase().includes(busqueda.toLowerCase()),
    );
    const totalPaginas = Math.ceil(ejerciciosFiltrados.length / elementosPorPagina);
    const tareasPaginadas = ejerciciosFiltrados.slice(
        paginaActual * elementosPorPagina,
        (paginaActual + 1) * elementosPorPagina,
    );

    const handleNavigateCrearEjercicio = () => {
        if (pacienteId) navigate(`/medico/crearEjercicio/${pacienteId}`);
    };

    if (!pacienteId) {
        return <Navigate to="/medico/pacient" replace />;
    }

    return (
        <div className="contenedor-fondo-medico">
            <div className="tarjeta-principal-medico">
                <div className="cabecera-medico">
                    <button type="button" className="btn-volver" onClick={() => navigate(-1)}>
                        <img src={flecha} alt="Volver" />
                    </button>
                    <h1 className="titulo-medico">Tareas asignadas al paciente</h1>
                </div>

                <div className="contenedor-buscador">
                    <input
                        type="text"
                        className="input-buscador"
                        placeholder="Buscar tarea"
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPaginaActual(0);
                        }}
                    />
                    <img src={lupa} alt="" className="icono-lupa" />
                </div>

                <div className="carrusel-contenedor">
                    <button
                        type="button"
                        className="btn-flecha"
                        onClick={() => setPaginaActual((pagina) => Math.max(0, pagina - 1))}
                        disabled={paginaActual === 0}
                        aria-label="Página anterior"
                    >
                        <img src={flechaSiguiente} alt="" className="icono-flecha" />
                    </button>

                    <div className="grilla-ejercicios">
                        {cargando ? (
                            <p role="status" style={{ gridColumn: '1 / -1' }}>Cargando tareas...</p>
                        ) : error ? (
                            <p role="alert" style={{ gridColumn: '1 / -1' }}>{error}</p>
                        ) : tareasPaginadas.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#666', gridColumn: '1 / -1' }}>
                                Este paciente todavía no tiene tareas asignadas.
                            </p>
                        ) : (
                            tareasPaginadas.map((tarea) => (
                                <div key={tarea.id} className="CardPendiente">
                                    <h3 className="titulo-ejercicio">{tarea.nombre}</h3>
                                    <p>{tarea.descripcion}</p>
                                    <p>Tipo: {tarea.tipo || 'video'}</p>
                                    <p>Estado: {Number(tarea.estado) === 1 ? 'Completada' : 'Pendiente'}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        type="button"
                        className="btn-flecha"
                        onClick={() => setPaginaActual((pagina) => Math.min(totalPaginas - 1, pagina + 1))}
                        disabled={paginaActual >= totalPaginas - 1 || totalPaginas === 0}
                        aria-label="Página siguiente"
                    >
                        <img src={flechaSiguiente} alt="" className="icono-flecha" />
                    </button>
                </div>

                <button className="CrearEjercicio" onClick={handleNavigateCrearEjercicio}>
                    <img src={botonCrear} alt="Crear tarea" className="icono-crear" />
                </button>
            </div>
        </div>
    );
}
