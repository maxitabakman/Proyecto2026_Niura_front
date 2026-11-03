import { useState } from "react";
import arrowback from './flecha.png'; 
import iconoExito from './exito.png';
import iconoError from './error.png';
import btnVolverAzul from './btn-volver-azul.png';
import btnVolver from './btn-volver.png';
import btnReintentar from './btn-reintentar.png';
import confirmar from '../confirmarSeleccionEjercicio/btn-confirmar.png';
import './seleccionarArchivoAudio.css'; 
import { useNavigate } from "react-router-dom";

type EstadoPantalla = 'seleccion' | 'exito' | 'error';

export default function SubirArchivo() {
    const [nombreArchivo, setNombreArchivo] = useState<string>("Seleccionar archivo...");
    const [videoPrevisualizado, setVideoPrevisualizado] = useState<string | null>(null);
    const [archivo, setArchivo] = useState<File | null | undefined>(null);
    console.log (archivo)
    const [estado, setEstado] = useState<EstadoPantalla>('seleccion');
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

    const handleConfirmar = () => {
        setTimeout(() => {
            const subidaExitosa = Math.random() > 0.5;
            if (subidaExitosa) {
                setEstado('exito');
            } else {
                setEstado('error');
            }
        }, 1000);
    };

    return (
        <div className="pantalla-subida-contenedor">
            <div className={`card-confirmacion ${estado === 'error' ? 'card-error' : ''}`}>
                
                <button className="boton-volver" onClick={handleNavigateBack}>
                    <img src={arrowback} alt="Volver" className="atras" />
                </button>

                {estado === 'seleccion' && (
                    <>
                        <h2 className="titulo-confirmacion">¿Subir archivo seleccionado?</h2>
                        <label htmlFor="input-archivo" className="etiqueta-nombre-archivo">
                            {nombreArchivo}
                        </label>
                        <input 
                            id="input-archivo"
                            type="file" 
                            accept="video/*" 
                            onChange={handleSeleccionarArchivo} 
                            className="input-oculto"
                        />
                        {videoPrevisualizado && (
                            <video className="video-preview" controls src={videoPrevisualizado} />
                        )}
                        <img 
                            src={confirmar} 
                            alt="Confirmar" 
                            className="confirmar" 
                            onClick={handleConfirmar} 
                        />
                    </>
                )}

                {estado === 'exito' && (
                    <>
                        <h2 className="titulo-confirmacion">Video subido con éxito</h2>
                        <img src={iconoExito} alt="Éxito" className="icono-estado" />
                        <img className="boton-principal" src={btnVolverAzul} alt="Volver al inicio" onClick={handleVolverInicio} />
                    </>
                )}

                {estado === 'error' && (
                    <>
                        <h2 className="titulo-confirmacion">Hubo un error</h2>
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