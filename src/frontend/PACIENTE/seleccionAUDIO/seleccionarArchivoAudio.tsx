import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import arrowback from './flecha.png';
import iconoExito from './exito.png';
import iconoError from './error.png';
import btnVolverAzul from './btn-volver-azul.png';
import btnVolver from './btn-volver.png';
import btnReintentar from './btn-reintentar.png';
import confirmar from '../confirmarSeleccionEjercicio/btn-confirmar.png';
import '../seleccionVIDEO/seleccionarArchivo.css';
import './seleccionarArchivoAudio.css';

type EstadoPantalla = 'seleccion' | 'exito' | 'error';
const MAX_TAMANO_AUDIO = 100 * 1024 * 1024;

export default function SubirArchivoAudio() {
    const { id, type } = useParams<{ id: string; type: string }>();
    const navigate = useNavigate();
    const [archivo, setArchivo] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [estado, setEstado] = useState<EstadoPantalla>('seleccion');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const handleSeleccionarArchivo = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        if (!file) return;
        if (!file.type.startsWith('audio/') || file.size > MAX_TAMANO_AUDIO) {
            setArchivo(null);
            setAudioUrl(null);
            setError('Elegí un archivo de audio de hasta 100 MB.');
            return;
        }
        setArchivo(file);
        setAudioUrl(URL.createObjectURL(file));
        setError('');
    };

    const handleConfirmar = async () => {
        if (!archivo) {
            setError('Seleccioná un archivo de audio antes de confirmar.');
            return;
        }
        if (!id || type !== 'audio') {
            setError('No se encontró una tarea de audio válida.');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Tu sesión venció. Volvé a iniciar sesión.');
            return;
        }

        setCargando(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('audio', archivo);
            formData.append('tareaID', id);

            const response = await fetch('http://localhost:3000/videos/subirAudioPaciente', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data: { message?: string } = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `El servidor respondió ${response.status}.`);
            }
            setEstado('exito');
        } catch (fallo) {
            console.error('Error al subir el audio:', fallo);
            setError(
                fallo instanceof Error ? fallo.message : 'No se pudo subir el audio.',
            );
            setEstado('error');
        } finally {
            setCargando(false);
        }
    };

    const volverAlInicio = () => navigate('/paciente/ejercitar');

    return (
        <div className="pantalla-subida-contenedor">
            <div className={`card-confirmacion ${estado === 'error' ? 'card-error' : ''}`}>
                <button
                    type="button"
                    className="boton-volver"
                    onClick={() => navigate(-1)}
                    disabled={cargando}
                    aria-label="Volver"
                >
                    <img src={arrowback} alt="" className="atras" />
                </button>

                {estado === 'seleccion' && (
                    <>
                        <h2 className="titulo-confirmacion">
                            {cargando ? 'Subiendo audio...' : 'Seleccioná el audio del ejercicio'}
                        </h2>
                        <label htmlFor="input-audio" className="etiqueta-nombre-archivo">
                            {archivo?.name || 'Seleccionar archivo de audio'}
                        </label>
                        <input
                            id="input-audio"
                            type="file"
                            accept="audio/*"
                            onChange={handleSeleccionarArchivo}
                            className="input-oculto"
                            disabled={cargando}
                        />
                        {audioUrl && <audio className="video-preview" controls src={audioUrl} />}
                        {error && <p role="alert" className="text-red-800">{error}</p>}
                        <button
                            type="button"
                            className="boton-principal"
                            onClick={() => void handleConfirmar()}
                            disabled={cargando || !archivo}
                            aria-label="Subir audio"
                        >
                            <img src={confirmar} alt="" />
                        </button>
                    </>
                )}

                {estado === 'exito' && (
                    <>
                        <h2 className="titulo-confirmacion">Audio subido con éxito</h2>
                        <img src={iconoExito} alt="Éxito" className="icono-estado" />
                        <button type="button" className="boton-principal" onClick={volverAlInicio}>
                            <img src={btnVolverAzul} alt="Volver al inicio" />
                        </button>
                    </>
                )}

                {estado === 'error' && (
                    <>
                        <h2 className="titulo-confirmacion">No pudimos subir el audio</h2>
                        <p role="alert">{error}</p>
                        <img src={iconoError} alt="Error" className="icono-estado" />
                        <div className="contenedor-botones-error">
                            <button
                                type="button"
                                className="boton-principal"
                                onClick={() => setEstado('seleccion')}
                            >
                                <img src={btnReintentar} alt="Reintentar" />
                            </button>
                            <button type="button" className="boton-secundario" onClick={volverAlInicio}>
                                <img src={btnVolver} alt="Volver al inicio" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
