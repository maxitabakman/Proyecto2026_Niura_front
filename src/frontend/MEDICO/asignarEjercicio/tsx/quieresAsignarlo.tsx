import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../css/quieresAsignarlo.css';
import arrowback from '../img/arrowback (1).png';
import confirmar from '../img/btn-confirmar (1).png';

export default function QuieresAsignarlo() {
    const { pacienteId, ejercicioId } = useParams<{ pacienteId: string; ejercicioId: string }>();
    const [ estadoAccion, setEstadoAccion ] = useState<'inicial' | 'exito' | 'error'>('inicial');
    const [ cargando, setCargando ] = useState(false);
    const navigate = useNavigate();

    const volverAlInicio = () => {
        navigate('/medico/paginaGeneralMedico');
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
                    idEjercicio: ejercicioId,
                    idPaciente: pacienteId
                })
            });

            if (res.ok) {
                setEstadoAccion('exito');
            } else {
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

                <h1>¿Quieres asignar este ejercicio a Ana?</h1>

                {/* Cuadro gris del medio */}
                <div className="ejercicio-card">
                    <p>Ejercicio 1</p>
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