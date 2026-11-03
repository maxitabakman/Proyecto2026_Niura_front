import { useNavigate } from "react-router-dom";
import './EleccionEjercicio.css';
import flechaImg from './flecha.png';
import audioImg from './audio.png';
import videoImg from './video.png';

export default function EleccionEjercicio() {
    const navigate = useNavigate();

    const handleNavigateAudio = () => {
        // CORREGIDO: Redirige a /seleccionAudio/:type (coincide con tu App.js)
        navigate(`/paciente/seleccionDeEjercicios/audio`);
    }

    const handleNavigateVideo = () => {
        // CORREGIDO: Redirige a /seleccionVideo/:type (coincide con tu App.js)
        navigate(`/paciente/seleccionDeEjercicios/video`);
    }

    const handleNavigateBack = () => {
        navigate(-1);
    }

    return (
        <div className="CajaEleccion">
            <img src={flechaImg} alt="flecha" className="flecha" onClick={handleNavigateBack}/>
            <p>¿Qué quieres entrenar hoy?</p>
            <button className="audio" onClick={handleNavigateAudio}>
                <img src={audioImg} alt="audio" className="audioPic"/>
            </button>
            <button className="video" onClick={handleNavigateVideo}>
                <img src={videoImg} alt="video" className="videoPic" />
            </button>
        </div>
    );
}