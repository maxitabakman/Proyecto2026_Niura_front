import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuieresAsignarlo () {
    const { id } = useParams<{ id: string }>();
    const [ exito, setExito ] = useState(false);
    const navigate = useNavigate();

    const volverAlInicio = () => {
        navigate('/generalMedico');
    }

    const handleConfirmar = async() => {
        try {
            const res = await fetch('/api/asignarEjercicio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ejercicioId: id, confirmado: true })
            });

            if (res.ok) {
                setExito(true);
            }
        }

        catch (error){
            console.error("Error de red al asignar el ejercicio");
            setExito(false);
        }
    };

    if (exito) {
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
      else if (!exito){
        <div className='noExitoso'>
            <h1 className='noAsignado'>Hubo un error</h1>
            <p className='vuelveAIntentar'>Por favor, vuelve a intentarlo</p>
            <img className='imagenError' src="/error.png" alt="Confirmación" />
            <button className='botonVolverInicio' onClick={volverAlInicio}>
              Volver al inicio
            </button>
          </div>
      }
    
      return (
        <div className='quieresAsignarlo'>
          <h1>¿Deseas asignar este ejercicio?</h1>
          <button className='botonConfirmar' onClick={handleConfirmar}>
            Confirmar
          </button>
        </div>
      );
}