import { useNavigate, useParams } from 'react-router-dom';
import flecha from '../EleccionEjercicio/flecha.png';
import './accionEjercitar.css';
import subir from './subirMedia.png';
import grabar from './grabar.png';

export default function AccionEjercitar() {
    const { type, id } = useParams<{ type: string; id: string }>();
    const navigate = useNavigate();
    const tipoValido = type === 'audio' || type === 'video';

    const handleNavigateGrabar = () => {
        if (!tipoValido || !id) return;
        if (type === 'video') {
            navigate(`/paciente/seleccionVIDEO/grabarVideo/${type}/${id}`);
        } else {
            navigate(`/paciente/seleccionAUDIO/grabarAudio/${type}/${id}`);
        }
    };

    const handleNavigateSeleccionarArchivo = () => {
        if (!tipoValido || !id) return;
        if (type === 'video') {
            navigate(`/paciente/seleccionVIDEO/seleccionarArchivo/${type}/${id}`);
        } else {
            navigate(`/paciente/seleccionAUDIO/seleccionarArchivo/${type}/${id}`);
        }
    };

    if (!tipoValido || !id) {
        return <p role="alert">No se encontró el ejercicio solicitado.</p>;
    }

    return (
        <div className="contenedor-central">
            <img src={flecha} alt="Volver" onClick={() => navigate(-1)} className="arrowback" />
            <div className="grabar">
                <button className="btnGrabar" onClick={handleNavigateGrabar}>
                    <img src={grabar} alt="Grabar" className="imgGrabar" />
                </button>
            </div>
            <div className="seleccionarArchivo">
                <button className="btnSeleccionarArchivo" onClick={handleNavigateSeleccionarArchivo}>
                    <img src={subir} alt="Seleccionar archivo" className="imgSeleccionarArchivo" />
                </button>
            </div>
        </div>
    );
}
