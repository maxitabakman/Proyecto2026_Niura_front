import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useMedico } from '../../../Contexts/contextoMedico';
import type { Ejercicios } from '../../../PACIENTE/seleccionEjercicio/seleccionDeEjercicios';
import flecha from '../../../PACIENTE/seleccionVIDEO/flecha.png';
import flechaSiguiente from '../../../PACIENTE/seleccionEjercicio/arrowback.png';
import lupa from '../img/boxicons_search-alt.png';
import '../css/asignarEjercicio.css';
import botonCrear from '../img/btn-crea.png'

export default function AsignarEjercicio() {
    const [ejercicios, setEjercicios] = useState<Ejercicios[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(0);
    const elementosPorPagina = 4;
    
    const navigate = useNavigate();
    const { pacienteId: pacienteIdRuta } = useParams<{ pacienteId: string }>();
    const { pacienteActivo } = useMedico();
    const pacienteId = pacienteIdRuta ?? pacienteActivo?.id;

    // Guarda el ID del paciente en localStorage para las pantallas de creación/asignación
    useEffect(() => {
        if (pacienteId) {
            localStorage.setItem('pacienteSeleccionadoId', String(pacienteId));
        }
    }, [pacienteId]);

    // Petición al backend con idPaciente obligatorio en la URL
    useEffect(() => {
        if (!pacienteId) return;

        const token = localStorage.getItem('token');

        fetch(`http://localhost:3000/doctor/verTareas?idPaciente=${pacienteId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Error al obtener los ejercicios');
                }
                return data;
            })
            .then((data) => {
                const lista = Array.isArray(data.tareas) ? data.tareas : [];
                setEjercicios(lista);
            })
            .catch((err) => {
                console.error(`Error al consultar tareas: ${err.message}`);
                setEjercicios([]);
            });
            
    }, [pacienteId]);

    const listaSegura = Array.isArray(ejercicios) ? ejercicios : [];

    const ejerciciosFiltrados = listaSegura.filter(ejercicio => 
        ejercicio?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );

    const totalPaginas = Math.ceil(ejerciciosFiltrados.length / elementosPorPagina);

    const carruselElementos = ejerciciosFiltrados.slice(
        paginaActual * elementosPorPagina, 
        (paginaActual + 1) * elementosPorPagina
    );

    const handleNavigateCarruselPaginaAnterior = () => {
        if (paginaActual > 0) setPaginaActual(paginaActual - 1);
    };

    const handleNavigateCarruselPaginaSiguiente = () => {
        if (paginaActual < totalPaginas - 1) setPaginaActual(paginaActual + 1);
    };

    const handleNavigate = (id: number | string) => {
        navigate(`/medico/quieresAsignar/${pacienteId}/${id}`);
    };

    const handleNavigateCrearEjercicio = () => {
        navigate(`/medico/crearEjercicio/${pacienteId}`);
    };

    if (!pacienteId) {
        return <Navigate to="/medico/pacient" replace />;
    }

    return (
        <div className="contenedor-fondo-medico">
            <div className="tarjeta-principal-medico">
                
                <div className="cabecera-medico">
                    <button className="btn-volver" onClick={() => navigate(-1)}>
                        <img src={flecha} alt="Volver" />
                    </button>
                    <h1 className="titulo-medico">Asigna un nuevo ejercicio</h1>
                </div>

                <div className="contenedor-buscador">
                    <input 
                        type="text" 
                        className="input-buscador" 
                        placeholder="ingresa el nombre" 
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPaginaActual(0);
                        }}
                    />
                    <img src={lupa} alt="Buscar" className="icono-lupa" />
                </div>

                <div className="carrusel-contenedor">
                    <button 
                        className="btn-flecha" 
                        onClick={handleNavigateCarruselPaginaAnterior} 
                        disabled={paginaActual === 0}
                    >
                        <img src={flechaSiguiente} alt="flechaCarrusel" className="icono-flecha" />
                    </button>

                    <div className="grilla-ejercicios">
                        {carruselElementos.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#666', gridColumn: '1 / -1' }}>
                                No se encontraron ejercicios asignados a este paciente.
                            </p>
                        ) : (
                            carruselElementos.map((ejercicio) => (
                                <div key={ejercicio.id} className="CardPendiente">
                                    <h3 className="titulo-ejercicio">{ejercicio.nombre}</h3>
                                    <button className="botonAsignar" onClick={() => handleNavigate(ejercicio.id)}>
                                        Asignar
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <button 
                        className="btn-flecha" 
                        onClick={handleNavigateCarruselPaginaSiguiente} 
                        disabled={paginaActual >= totalPaginas - 1 || totalPaginas === 0}
                    >
                        <img src={flechaSiguiente} alt="flechaCarrusel" className="icono-flecha" />
                    </button>
                </div>

                <button className="CrearEjercicio" onClick={handleNavigateCrearEjercicio}>
                    <img src={botonCrear} alt="Crear Ejercicio" className="icono-crear" />
                </button>
            </div>
        </div>
    );
}