import './guia.css';
import flecha from '../../PACIENTE/seleccionVIDEO/flecha.png'
import { useNavigate } from 'react-router-dom';

export default function Guia() {
    const navigate = useNavigate();

    const handleNavigateBack = () => {
        navigate (-1);
    }
    
    return (
        <div className="contenedor-guia">
            <div className="guia-content">
                <img src={flecha} alt="flecha" className='flecha' onClick={handleNavigateBack}/>
                <h1>Titulo</h1>
                <div className="guia-section">
                    <h2>Subtitulo</h2>
                    <p>Bueno acá va ir el súper pro texto breve brevisimo en 24px de tamaño y en helvetica regular porq helvetica es la mejor tipografia del mundo y esta no tiene que ser TAN accesible pero sí super legible helvetica fucking prime</p>
                </div>
                <div className="guia-section">
                    <h2>Subtitulo</h2>
                    <p>Bueno acá va ir el súper pro texto breve brevisimo en 24px de tamaño y en helvetica regular porq helvetica es la mejor tipografia del mundo y esta no tiene que ser TAN accesible pero sí super legible helvetica fucking prime</p>
                </div>
                <div className="guia-section">
                    <h2>Subtitulo</h2>
                    <p>Bueno acá va ir el súper pro texto breve brevisimo en 24px de tamaño y en helvetica regular porq helvetica es la mejor tipografia del mundo y esta no tiene que ser TAN accesible pero sí super legible helvetica fucking prime</p>
                </div>
                <div className="guia-section">
                    <h2>Subtitulo</h2>
                    <p>Bueno acá va ir el súper pro texto breve brevisimo en 24px de tamaño y en helvetica regular porq helvetica es la mejor tipografia del mundo y esta no tiene que ser TAN accesible pero sí super legible helvetica fucking prime</p>
                </div>
            </div>
        </div>
    );
}