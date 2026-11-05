import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import confirmar from '../img/btn-confirmar (1).png';
import arrowback from '../img/arrowback (1).png';
import '../css/crearEjercicio.css';

type RespuestaApi = {
    message?: string;
};

export default function CrearEjercicio() {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [elementos, setElementos] = useState('');
    const [tipo, setTipo] = useState<'audio' | 'video'>('video');
    const [cargando, setCargando] = useState(false);

    const navigate = useNavigate();
    const { pacienteId } = useParams<{ pacienteId: string }>();

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

        const objetosRequeridos = elementos
            .split(',')
            .map((valor) => valor.trim())
            .filter(Boolean)
            .map(Number);
        if (objetosRequeridos.some((id) => !Number.isInteger(id) || id < 1)) {
            alert('Los elementos requeridos deben ser IDs numéricos separados por comas.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Tu sesión venció. Volvé a iniciar sesión.');
            return;
        }

        setCargando(true);
        try {
            const response = await fetch('http://localhost:3000/doctor/crearTarea', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: nombre.trim(),
                    descripcion: descripcion.trim(),
                    tipo,
                    objetosRequeridos,
                    idPaciente: pacienteId,
                }),
            });
            const data = (await response.json()) as RespuestaApi;
            if (!response.ok) {
                throw new Error(data.message || `El servidor respondió ${response.status}.`);
            }
            navigate(`/medico/asignarEjercicio/${pacienteId}`);
        } catch (error) {
            console.error('Error al crear el ejercicio:', error);
            alert(error instanceof Error ? error.message : 'Error de conexión al crear el ejercicio');
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
                <button type="button" className="btn-volver-crear" onClick={() => navigate(-1)}>
                    <img
                        src={arrowback}
                        alt="Volver"
                        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                    />
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
                        placeholder="IDs de elementos requeridos, separados por comas (opcional)"
                        onChange={(e) => setElementos(e.target.value)}
                    />
                    <select
                        className="form-input"
                        aria-label="Tipo de tarea"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value === 'audio' ? 'audio' : 'video')}
                    >
                        <option value="video">Tarea de video</option>
                        <option value="audio">Tarea de audio</option>
                    </select>

                    <button type="submit" className="confirm-btn" disabled={cargando}>
                        <img src={confirmar} alt="Confirmar" className="confirm-icon" />
                    </button>
                </form>
            </div>
        </main>
    );
}
