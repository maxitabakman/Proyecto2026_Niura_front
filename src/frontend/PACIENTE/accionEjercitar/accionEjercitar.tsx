import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import flecha from '../EleccionEjercicio/flecha.png';
import './accionEjercitar.css';
import subir from './subirMedia.png';
import grabar from './grabar.png'

export default function AccionEjercitar() {
    const { type, id } = useParams<{ type: string; id: string }>();
    const [ejercicio, setEjercicio] = useState<any>(null);
    const navigate = useNavigate();
     console.log (ejercicio)
    useEffect(() => {
        fetch(`https://mocki.io/v1/3fc5e5f3-1a7f-4eee-9a36-7409f15e255c`)
            .then((res) => res.json())
            .then((data) => {
                const encontrado = data.find((ej: any) => String(ej.id) === String(id));
                setEjercicio(encontrado);
            })
            .catch((err) => console.error(`Error fetching ejercicio: ${err}`));
    }, [id]);

    const handleNavigateGrabar = () => {
        if (type === 'video') {
            navigate(`/paciente/seleccionVIDEO/grabarVideo/${type}/${id}`);
        } else {
            navigate(`/paciente/seleccionAUDIO/grabarAudio/${type}/${id}`);
        }
    };

    const handleNavigateSeleccionarArchivo = () => {
        if (type === 'video') {
            navigate(`/paciente/seleccionVIDEO/seleccionarArchivo/${type}/${id}`);
        } else {
            navigate(`/paciente/seleccionAUDIO/seleccionarArchivo/${type}/${id}`);
        }
    };

    const handleNavigateBack = () => {
        navigate(-1);
    }

    return (
        <div className="contenedor-central">
            <img src={flecha} alt="flecha" onClick={handleNavigateBack} className="arrowback"/>
            <div className="grabar">
                <button className="btnGrabar" onClick={handleNavigateGrabar}>
                    <img src={grabar} alt='grabar' className="imgGrabar"/>
                </button>
            </div>
            <div className="seleccionarArchivo">
                <button className="btnSeleccionarArchivo" onClick={handleNavigateSeleccionarArchivo}>
                    <img src={subir} alt='seleccionar' className="imgSeleccionarArchivo"/>
                </button>
            </div>
        </div>
    );
}