import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Ejercicios } from "../seleccionEjercicio/seleccionDeEjercicios";
import flecha from '../EleccionEjercicio/flecha.png';
import audioImg from '../EleccionEjercicio/audio.png';
import videoImg from '../EleccionEjercicio/video.png';
import './confirmar.css';
import confirmar from './btn-confirmar.png';

export default function ConfirmarSeleccionEjercicio() {
    const { id, type } = useParams<{ id: string; type: string }>();
    const [ejercicio, setEjercicio] = useState<Ejercicios | null>(null);
    const [cargando, setCargando] = useState(
        Boolean(id && type && localStorage.getItem('token')),
    );
    const [error, setError] = useState(
        !id || !type
            ? 'No se encontró la tarea.'
            : !localStorage.getItem('token')
                ? 'Iniciá sesión para continuar.'
                : '',
    );
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !id || !type) return;
        const tareaId = id;
        const tipoEjercicio = type;

        const controller = new AbortController();
        async function cargarEjercicio() {
            try {
                const response = await fetch(
                    `http://localhost:3000/paciente/verTareas?tipo=${encodeURIComponent(tipoEjercicio)}&idTarea=${encodeURIComponent(tareaId)}`,
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
                    throw new Error('El servidor devolvió datos de tarea inválidos.');
                }
                if (!data.tareas[0]) {
                    throw new Error('La tarea ya no está pendiente o no pertenece a tu cuenta.');
                }
                setEjercicio(data.tareas[0]);
                setError('');
            } catch (fallo) {
                if (controller.signal.aborted) return;
                console.error('Error al cargar la tarea:', fallo);
                setError(fallo instanceof Error ? fallo.message : 'No se pudo cargar la tarea.');
            } finally {
                if (!controller.signal.aborted) setCargando(false);
            }
        }
        void cargarEjercicio();
        return () => controller.abort();
    }, [id, type]);

    const handleNavigate = () => {
        if (ejercicio && type && id) {
            navigate(`/paciente/accionEjercitar/${type}/${id}`);
        }
    };

    return (
        <div className="contenedor">
            <img src={flecha} alt="Volver" className="arrowback" onClick={() => navigate(-1)} />
            {cargando ? (
                <p className="loadingEjercicio" role="status">Cargando ejercicio...</p>
            ) : error ? (
                <p className="loadingEjercicio" role="alert">{error}</p>
            ) : ejercicio ? (
                <div className="cardEjercicio">
                    <p className="tipo">{ejercicio.tipo}</p>
                    <p className="nombreEjercicio">{ejercicio.nombre}</p>
                    <p>{ejercicio.descripcion}</p>
                    <img
                        className="imgEjercicio"
                        src={type === 'audio' ? audioImg : videoImg}
                        alt=""
                    />
                    <button type="button" className="btnConfirmar" onClick={handleNavigate}>
                        <img src={confirmar} alt="Comenzar ejercicio" />
                    </button>
                </div>
            ) : null}
        </div>
    );
}
