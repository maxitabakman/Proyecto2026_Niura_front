import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import arrowback from './flecha.png'; 
import iconoExito from './exito.png';
import iconoError from './error.png';
import btnVolverAzul from './btn-volver-azul.png';
import btnVolver from './btn-volver.png';
import btnReintentar from './btn-reintentar.png';
import confirmar from '../confirmarSeleccionEjercicio/btn-confirmar.png';
import './seleccionarArchivo.css'; 

type EstadoPantalla = 'seleccion' | 'exito' | 'error';

export default function SubirArchivo() {
    // 1. Obtenemos el parámetro :id directamente de la URL
    const { id } = useParams<{ id: string }>();

    const [nombreArchivo, setNombreArchivo] = useState<string>("Seleccionar archivo...");
    const [videoPrevisualizado, setVideoPrevisualizado] = useState<string | null>(null);
    const [archivo, setArchivo] = useState<File | null>(null);
    const [estado, setEstado] = useState<EstadoPantalla>('seleccion');
    const [cargando, setCargando] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setArchivo(file);
            setNombreArchivo(file.name); 
            const videoUrl = URL.createObjectURL(file);
            setVideoPrevisualizado(videoUrl);
        }
    };

    const handleNavigateBack = () => {
        navigate(-1);
    };

    const handleVolverInicio = () => {
        navigate('../paciente/ejercitar'); 
    };

    const handleReintentar = () => {
        setEstado('seleccion');
    };

    const handleConfirmar = async () => {
        if (!archivo) {
            alert('Por favor, selecciona un video antes de confirmar.');
            return;
        }

        if (!id) {
            alert('No se encontró el ID de la tarea.');
            return;
        }

        setCargando(true);
        const token = localStorage.getItem('token');

        try {
            // 2. Construimos FormData enviando el video y el :id de la URL como 'tareaID'
            const formData = new FormData();
            formData.append('video', archivo);
            formData.append('tareaID', id);

            const response = await fetch('http://localhost:3000/videos/subirVideoPaciente', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al procesar la subida');
            }

            console.log('Video subido y racha actualizada:', data);
            setEstado('exito');

        } catch (error) {
            console.error('Error al subir video:', error);
            setEstado('error');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="pantalla-subida-contenedor">
            <div className={`card-confirmacion ${estado === 'error' ? 'card-error' : ''}`}>
                
                <button className="boton-volver" onClick={handleNavigateBack} disabled={cargando}>
                    <img src={arrowback} alt="Volver" className="atras" />
                </button>

                {estado === 'seleccion' && (
                    <>
                        <h2 className="titulo-confirmacion">
                            {cargando ? "Subiendo archivo y actualizando racha..." : "¿Subir archivo seleccionado?"}
                        </h2>

                        <label htmlFor="input-archivo" className="etiqueta-nombre-archivo">
                            {nombreArchivo}
                        </label>
                        <input 
                            id="input-archivo"
                            type="file" 
                            accept="video/*" 
                            onChange={handleSeleccionarArchivo} 
                            className="input-oculto"
                            disabled={cargando}
                        />

                        {videoPrevisualizado && (
                            <video className="video-preview" controls src={videoPrevisualizado} />
                        )}

                        <img 
                            src={confirmar} 
                            alt="Confirmar" 
                            className={`confirmar ${cargando ? 'deshabilitado' : ''}`} 
                            onClick={cargando ? undefined : handleConfirmar} 
                        />
                    </>
                )}

                {estado === 'exito' && (
                    <>
                        <h2 className="titulo-confirmacion">Video subido y racha actualizada con éxito</h2>
                        <img src={iconoExito} alt="Éxito" className="icono-estado" />
                        <img className="boton-principal" src={btnVolverAzul} alt="Volver al inicio" onClick={handleVolverInicio} />
                    </>
                )}

                {estado === 'error' && (
                    <>
                        <h2 className="titulo-confirmacion">Hubo un error al subir el video</h2>
                        <img src={iconoError} alt="Error" className="icono-estado" />
                        <div className="contenedor-botones-error">
                            <img className="boton-principal" src={btnReintentar} alt="Reintentar" onClick={handleReintentar} />
                            <img className="boton-secundario" src={btnVolver} alt="Volver al inicio" onClick={handleVolverInicio} />
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}