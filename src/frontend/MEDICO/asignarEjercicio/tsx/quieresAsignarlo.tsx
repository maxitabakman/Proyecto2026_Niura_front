import { Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import '../css/quieresAsignarlo.css';
import arrowback from '../img/arrowback (1).png';
import confirmar from '../img/btn-confirmar (1).png';

export default function QuieresAsignarlo() {
    const { pacienteId, ejercicioId } = useParams<{ pacienteId: string; ejercicioId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [estadoAccion, setEstadoAccion] = useState<'inicial' | 'exito' | 'error'>('inicial');
    const [cargando, setCargando] = useState(false);

    // Recuperar el ejercicio seleccionado del state de navegación si está disponible
    const ejercicioData = location.state?.ejercicio;
    const nombreEjercicio = ejercicioData?.nombre || `Ejercicio ${ejercicioId}`;
    const descripcionEjercicio = ejercicioData?.descripcion || `Realizar el ejercicio ${ejercicioId}`;
    const puntajeEjercicio = ejercicioData?.puntaje ?? 10;
    const tipoEjercicio = ejercicioData?.tipo || 'video';
    const objetosRequeridos = ejercicioData?.objetosRequeridos || [];

    const volverAlInicio = () => {
        navigate('/medico/pacient');
    };

    const handleConfirmar = async () => {
        if (!pacienteId || !ejercicioId) {
            navigate('/medico/pacient');
            return;
        }

        setCargando(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch('http://localhost:3000/doctor/crearTarea', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    idPaciente: Number(pacienteId),           // Se envía obligatoriamente como número
                    nombre: nombreEjercicio,                   // Campo requerido por el Backend
                    descripcion: descripcionEjercicio,         // Campo requerido por el Backend
                    puntaje: Number(puntajeEjercicio),         // Opcional / número
                    tipo: tipoEjercicio,                       // 'video' u 'audio'
                    objetosRequeridos: objetosRequeridos       // Lista de IDs
                })
            });

            if (res.ok) {
                setEstadoAccion('exito');
            } else {
                const data = await res.json();
                console.error("Error en servidor al crear tarea:", data.message);
                setEstadoAccion('error');
            }
        } catch (error) {
            console.error("Error de red al asignar el ejercicio:", error);
            setEstadoAccion('error');
        } finally {
            setCargando(false);
        }
    };

    if (!pacienteId || !ejercicioId) {
        return <Navigate to="/medico/pacient" replace />;
    }

    if (estadoAccion === 'exito') {
        return (
            <main className="main-container-asignar">
                <div className='exitoso'>
                    <h1 className='asignadoCorrectamente'>El ejercicio fue asignado</h1>
                    <p className='habilitado'>Será habilitado a la brevedad</p>
                    <img className='imagenConfirmar' src="./asignado.png" alt="Confirmación" />
                    <button className='botonVolverInicio' onClick={volverAlInicio}>
                        Volver al inicio
                    </button>
                </div>
            </main>
        );
    }

    if (estadoAccion === 'error') {
        return (
            <main className="main-container-asignar">
                <div className='noExitoso'>
                    <h1 className='noAsignado'>Hubo un error</h1>
                    <p className='vuelveAIntentar'>Por favor, vuelve a intentarlo</p>
                    <img className='imagenError' src="/error.png" alt="Error" />
                    <button className='botonVolverInicio' onClick={volverAlInicio}>
                        Volver al inicio
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="main-container-asignar">
            <div className='quieresAsignarlo'>
                {/* Botón de volver */}
                <button type="button" className="btn-volver-asignar" onClick={() => navigate(-1)}>
                    <img src={arrowback} alt="Volver" />
                </button>

                <h1>¿Quieres asignar este ejercicio?</h1>

                {/* Cuadro con el nombre del ejercicio */}
                <div className="ejercicio-card">
                    <p>{nombreEjercicio}</p>
                </div>

                {/* Botón Confirmar con imagen */}
                <button className='botonConfirmarImg' onClick={handleConfirmar} disabled={cargando}>
                    {cargando ? (
                        <span className="texto-cargando">Asignando...</span>
                    ) : (
                        <img src={confirmar} alt="Confirmar" className="confirm-icon-img" />
                    )}
                </button>
            </div>
        </main>
    );
}