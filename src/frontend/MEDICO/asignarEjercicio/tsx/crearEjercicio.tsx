import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import confirmar from '../img/btn-confirmar (1).png'
import arrowback from '../img/arrowback (1).png'

import '../css/crearEjercicio.css';

export default function CrearEjercicio() {
    const [ nombre, setNombre ] = useState<string>('');
    const [ descripcion, setDescripcion ] = useState<string>('');
    const [ elementos, setElementos ] = useState<string>('');
    const [ video, setVideo ] = useState<File | null>(null);
    const [ cargando, setCargando ] = useState<boolean>(false);

    const navigate = useNavigate();
    const { pacienteId } = useParams<{ pacienteId: string }>();

    const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setVideo(file);
    };

    const handleCrearEjercicio = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nombre.trim() || !descripcion.trim()) {
            alert('Por favor, completa el nombre y la descripción');
            return;
        }

        if (!pacienteId) {
            navigate('/medico/pacient');
            return;
        }

        setCargando(true);
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('elementos', elementos);

        formData.append('idPaciente', pacienteId);

        if (video) {
            formData.append('video', video);
        }

        try {
            const res = await fetch('http://localhost:3000/doctor/crearTarea', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // NOTA: Con FormData NO se pone 'Content-Type', el navegador lo coloca automáticamente
                },
                body: formData
            });

            if (res.ok) {
                navigate(`/medico/asignarEjercicio/${pacienteId}`);
            } else {
                const data = await res.json();
                alert(data.message || "Error al crear el ejercicio en el servidor");
            }
        } catch (error) {
            console.error("Error de red:", error);
            alert("Error de conexión al crear el ejercicio");
        } finally {
            setCargando(false);
        }
    };

    if (!pacienteId) {
        return <Navigate to="/medico/pacient" replace />;
    }

    return (
        <main className="main-container">
            <div className="card-container">
                
                {/* BOTÓN DE VOLVER */}
                <button type="button" className="btn-volver-crear" onClick={() => navigate(-1)}>
                    <img src={arrowback} alt="Volver" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                </button>

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

                    {/* BOTÓN DE CONFIRMAR */}
                    <button type="submit" className="confirm-btn" disabled={cargando}>
                        <img src={confirmar} alt="Confirmar" className="confirm-icon" />
                    </button>
                </form>
            </div>
        </main>
    );
}