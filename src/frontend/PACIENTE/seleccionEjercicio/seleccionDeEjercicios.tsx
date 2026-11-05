import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import arrowback from './arrowback.png';
import './seleccionDeEjercicios.css';
import flecha from '../EleccionEjercicio/flecha.png'
import audioImg from '../EleccionEjercicio/audio.png'
import videoImg from '../EleccionEjercicio/video.png'

export type Elemento = {
    id: number | string;
    nombre: string;
    descripcion: string;
}

export type Tutorial = {
    id: number | string;
    nombre: string;
    imagen: string;
    descripcion: string;
}

export type Ejercicios = {
    id: number | string;
    nombre: string;
    descripcion: string;
    tipo: string | null;
    estado?: number | string;
    tutorial?: Tutorial;
    imagen?: string;
    elemento?: Elemento;
}

export default function SeleccionDeEjercicios() {
    const { type } = useParams<{ type: string }>();
    const [ejercicios, setEjercicios] = useState<Ejercicios[]>([]);
    const [cargando, setCargando] = useState(Boolean(type && localStorage.getItem('token')));
    const [error, setError] = useState(
        !type
            ? 'No se indicó el tipo de ejercicio.'
            : !localStorage.getItem('token')
                ? 'Iniciá sesión para ver tus ejercicios asignados.'
                : '',
    );
    const navigate = useNavigate();
    const [indiceActual, setIndiceActual] = useState(0); 
    const cantidadAMostrar = 3;

    useEffect(() => {
        if (!type) return;
        const tipoEjercicio = type;

        const token = localStorage.getItem('token');
        if (!token) return;

        const controller = new AbortController();
        async function cargarEjercicios() {
            try {
                const response = await fetch(
                    `http://localhost:3000/paciente/verTareas?tipo=${encodeURIComponent(tipoEjercicio)}`,
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
                console.error('Error al cargar las tareas del paciente:', fallo);
                setError(fallo instanceof Error ? fallo.message : 'No se pudieron cargar las tareas.');
            } finally {
                if (!controller.signal.aborted) setCargando(false);
            }
        }
        void cargarEjercicios();
        return () => controller.abort();
    }, [type]);

    const handleNavigateEjercicio = (ejercicioId: number | string) => {
        navigate(`/paciente/ejercicio/${type}/${ejercicioId}`);
    }

    const handleNavigateBack = () => {
        navigate(-1);
    }
    
    const irAnterior = () => {
        if (indiceActual > 0) {
            setIndiceActual(indiceActual - 1);
        }
    }

    const irSiguiente = () => {
        if (indiceActual < ejercicios.length - cantidadAMostrar) {
            setIndiceActual(indiceActual + 1);
        }
    }

    return (
        <div className="contenedor-seleccion">
            <h1 className="texto">Tu selección de hoy</h1>
            <img src={arrowback} alt="flechaAnterior" onClick={irAnterior}/>
            <img src={arrowback} alt="flechaSiguiente" onClick={irSiguiente}/>
            <img src={flecha} alt="arrowback" className="arrowback" onClick={handleNavigateBack}/>
            <ul>
            {cargando && <li role="status">Cargando ejercicios asignados...</li>}
            {error && <li role="alert">{error}</li>}
            {!cargando && !error && ejercicios.length === 0 && (
                <li>No tenés ejercicios pendientes de este tipo.</li>
            )}
            {ejercicios
                .slice(indiceActual, indiceActual + cantidadAMostrar)
                .map((ejercicio) => (
                    <li key={ejercicio.id}>
                        <button 
                            className="CardEjercicio" 
                            onClick={() => handleNavigateEjercicio(ejercicio.id)}>
                            <h2 className="nombreDelEjercicio">{ejercicio.nombre}</h2>
                            <img
                                src={ejercicio.imagen || (type === 'audio' ? audioImg : videoImg)}
                                alt=""
                                className="imagenEjercicio"
                            />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}