import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Ejercicios } from '../../../PACIENTE/seleccionEjercicio/seleccionDeEjercicios';
import '../css/crearEjercicio.css';

export default function Asignar() {
    const [ nombre, setNombre ] = useState<string>('');
    const [ descripcion, setDescripcion ] = useState<string>('');
    const [ elementos, setElementos ] = useState<string>('');
    const [ video, setVideo ] = useState<File | null | undefined>(null);
    const [ ejercicios, setEjercicios ] = useState<Ejercicios[]>([]);
    const navigate = useNavigate();

    const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = e.target.files?.[0];
        setVideo(video)
    }

    const handleCrearEjercicio = async () => {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('elementos', elementos);
        if (video) {
            formData.append('video', video);
        }

        try {
            const res = await fetch('/api/crearEjercicio', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const ejercicioCreado: Ejercicios = await res.json();
                
                setEjercicios([...ejercicios, ejercicioCreado]); 
                
                navigate('/asignarEjercicio');
            } else {
                console.error("Error al crear el ejercicio en el servidor");
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    };

    return (
        <main className="main-container">
            <div className="card-container">
                <h1 className="form-title">Crea un nuevo ejercicio</h1>

                <form className="exercise-form" onSubmit={handleCrearEjercicio}>
                    <input
                        type="text"
                        className="form-input"
                        value={nombre}
                        placeholder="Nombre del ejercicio"
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />

                    <input
                        type="text"
                        className="form-input"
                        value={descripcion}
                        placeholder="Breve descripción del ejercicio"
                        onChange={(e) => setDescripcion(e.target.value)}
                        required
                    />

                    <input
                        type="text"
                        className="form-input"
                        value={elementos}
                        placeholder="Elementos que requiere"
                        onChange={(e) => setElementos(e.target.value)}
                        required
                    />

                    {/* Botón personalizado de video */}
                    <div className="file-upload-wrapper">
                        <label htmlFor="video-input" className="file-upload-btn">
                            <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                                <polyline points="7 9 12 4 17 9" />
                                <line x1="12" y1="4" x2="12" y2="16" />
                            </svg>
                            <span>{video ? video.name : 'Video explicativo'}</span>
                        </label>
                        <input
                            id="video-input"
                            type="file"
                            accept="video/*"
                            onChange={handleSeleccionarArchivo}
                            style={{ display: 'none' }}
                        />

                        {/* Iconos de acceso rápido abajo del botón de video */}
                        <div className="media-quick-icons">
                            <div className="quick-icon-btn">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                </svg>
                            </div>
                            <div className="quick-icon-btn">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 15c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm9-9h-3.17L16 4H8L6.17 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="confirm-btn" onClick={handleCrearEjercicio}>
                        Confirmar
                    </button>
                </form>
            </div>
        </main>
    );
    }