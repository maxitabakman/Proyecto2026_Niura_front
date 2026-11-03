import { useNavigate } from "react-router-dom";
import acompañar from './btn-comoacompañar.png';
import habilitar from './btn-habilitar.png';
import tutoriales from './btn-tutoriales.png';
import './paginagralCuidador.css';

export default function PaginaGralCuidador() {
    const navigate = useNavigate();

    const handleNavigateGuia = () => {
        navigate("/cuidador/guia");
    }

    const handleNavigateHabilitarEjercicios = () => {
        navigate("/cuidador/habilitar-ejercicios");
    }

    const handleNavigateTutoriales = () => {
        navigate("/cuidador/tutoriales");
    }

    return (
        <div className="contenedor-opciones-cuidador">
            <img className="btn-opcion-cuidador" src={acompañar} alt="Acompañar" onClick={handleNavigateGuia}/>
            <img className="btn-opcion-cuidador" src={habilitar} alt="Habilitar Ejercicios" onClick={handleNavigateHabilitarEjercicios}/>
            <img className="btn-opcion-cuidador" src={tutoriales} alt="Tutoriales" onClick={handleNavigateTutoriales}/>
        </div>
    )
}