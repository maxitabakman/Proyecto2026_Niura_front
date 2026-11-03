import { useNavigate } from "react-router-dom";
import './ejercitarInicio.css';

export default function Ejercitar () {
    const navigate = useNavigate();

    const handleNavigateSeleccionEjercicio = () => {
        navigate('/paciente/eleccionEjercicio');
    }

    return (
        <div>
            <button className="btnEjercitar" onClick={handleNavigateSeleccionEjercicio}>
                <p className="btnText">EJERCITAR</p>
            </button>
        </div>
    )
}