import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';

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
            <div className='exitoso'>
                <h1 className='asignadoCorrectamente'>El ejercicio fue asignado</h1>
                <p className='habilitado'>Será habilitado a la brevedad</p>
                <img className='imagenConfirmar' src="./asignado.png" alt="Confirmación" />
                <button className='botonVolverInicio' onClick={volverAlInicio}>
                    Volver al inicio
                </button>
            </div>
        );
    }

    if (estadoAccion === 'error') {
        return (
            <div className='noExitoso'>
                <h1 className='noAsignado'>Hubo un error</h1>
                <p className='vuelveAIntentar'>Por favor, vuelve a intentarlo</p>
                <img className='imagenError' src="/error.png" alt="Error" />
                <button className='botonVolverInicio' onClick={volverAlInicio}>
                    Volver al inicio
                </button>
            </div>
        );
    }

    return (
        <div className='quieresAsignarlo'>
            <h1>¿Deseas asignar este ejercicio?</h1>
            <button className='botonConfirmar' onClick={handleConfirmar} disabled={cargando}>
                {cargando ? 'Asignando...' : 'Confirmar'}
            </button>
        </div>
    );
}