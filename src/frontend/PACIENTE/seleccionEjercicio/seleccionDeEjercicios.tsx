import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import arrowback from './arrowback.png';
import './seleccionDeEjercicios.css';
import flecha from '../EleccionEjercicio/flecha.png'

export type Ejercicios = {
    id: number | string;
    nombre: string;
    descripcion: string;
    type: string;
    imagen: string;
}

export default function SeleccionDeEjercicios() {
    const { type } = useParams<{ type: string }>();
    const [ejercicios, setEjercicios] = useState<Ejercicios[]>([]);
    const navigate = useNavigate();
    const [indiceActual, setIndiceActual] = useState(0); 
    const cantidadAMostrar = 3;

    useEffect(() => {
        if (!type) return;

        fetch(`https://mocki.io/v1/0fe34082-199b-4a44-9737-e8a029271401`)
            .then(response => response.json())
            .then(data => {
                const filtrados = data.filter((ejercicio: Ejercicios) => ejercicio.type === type);
                setEjercicios(filtrados);
            })
            .catch(error => { console.error('Error fetching ejercicios:', error) });
            
    }, [type]);

    const handleNavigateEjercicio = (ejercicioId: number | string) => {
        navigate(`/paciente/ejercicio/${type}/${ejercicioId}`);
    }

    const handleNavigateBack = () => {
        navigate(-1);
    }
    
    const irAnterior = () => {
        if (indiceActual > 0) {
            setIndiceActual(indiceActual - 1);
        }
    }

    const irSiguiente = () => {
        if (indiceActual < ejercicios.length - cantidadAMostrar) {
            setIndiceActual(indiceActual + 1);
        }
    }

    return (
        <div className="contenedor-seleccion">
            <h1 className="texto">Tu selección de hoy</h1>
            <img src={arrowback} alt="flechaAnterior" onClick={irAnterior}/>
            <img src={arrowback} alt="flechaSiguiente" onClick={irSiguiente}/>
            <img src={flecha} alt="arrowback" className="arrowback" onClick={handleNavigateBack}/>
            <ul>
            {ejercicios
                .slice(indiceActual, indiceActual + cantidadAMostrar)
                .map((ejercicio) => (
                    <li key={ejercicio.id}>
                        <button 
                            className="CardEjercicio" 
                            onClick={() => handleNavigateEjercicio(ejercicio.id)}>
                            <h2 className="nombreDelEjercicio">{ejercicio.nombre}</h2>
                            <img src={ejercicio.imagen} alt={ejercicio.nombre} className="imagenEjercicio"/>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}