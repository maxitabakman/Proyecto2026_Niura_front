import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import type { Ejercicios } from "../seleccionEjercicio/seleccionDeEjercicios";
import flecha from '../EleccionEjercicio/flecha.png';
import './confirmar.css';
import confirmar from './btn-confirmar.png';

export default function ConfirmarSeleccionEjercicio() {
    const { id, type } = useParams<{ id: string; type: string }>();
    const [ ejercicio, setEjercicio ] = useState<Ejercicios | null>(null);
    const navigate = useNavigate();

    useEffect  (() => {
        fetch(`https://mocki.io/v1/0fe34082-199b-4a44-9737-e8a029271401`)
        .then((res) => res.json())
        .then((data) => setEjercicio(data.find((ej: any) => String(ej.id) === String(id))))
        .catch((err) => console.error(`Error fetching ejercicio: ${err}`))
    }, [id]);

    const handleNavigate = () => {
    navigate(`/paciente/accionEjercitar/${type}/${id}`);
    }

    const handleNavigateBack = () => {
        navigate(-1);
    }

    return(
        <div className="contenedor">
            <img src={flecha} alt="arrowback" className="arrowback" onClick={handleNavigateBack}/>
            {ejercicio ? (
                <div className="cardEjercicio">
                    <p className="tipo">{ejercicio.type}</p>
                    <p className="nombreEjercicio">{ejercicio.nombre}</p>
                    <img className="imgEjercicio" src={ejercicio.imagen} alt={ejercicio.nombre} />
                    <img className="btnConfirmar" onClick={handleNavigate} src={confirmar}></img>
                </div>
            ) : (
                <p className="loadingEjercicio">Cargando ejercicio...</p>
            )}
        </div>
    )
}