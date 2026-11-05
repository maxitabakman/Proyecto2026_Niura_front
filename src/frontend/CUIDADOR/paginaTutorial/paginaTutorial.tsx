import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './paginaTutorial.css'
import type { Tutorial } from '../../PACIENTE/seleccionEjercicio/seleccionDeEjercicios'
import arrowBack from './arrowback.png'

export default function PaginaTutoriales() {
    const { id } = useParams<{ id: string }>();
    const [tutorial, setTutorial] = useState<Tutorial | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('https://mocki.io/v1/b4e3da42-ec3b-49fe-a978-69de0712cfb9')
            .then(response => response.json())
            .then((data: Tutorial[]) => {
                const ejercicioEncontrado = data.find(t => String(t.id) === id);
                if (ejercicioEncontrado) {
                    setTutorial(ejercicioEncontrado);
                }
            })
            .catch(error => {
                console.error('Error fetching tutoriales:', error);
            });
    }, [id]);

    // sino me tiraba error...
    if (!tutorial) {
        return <div className="contenedor-fondo-tutorial"><h2>Cargando...</h2></div>;
    }

    return (
        <div className="contenedor-fondo-tutorial">
            <div className="tarjeta-aprender">
                
                <div className="cabecera-aprender">
                    <button className="btn-volver-aprender" onClick={() => navigate(-1)}>
                        <img src={arrowBack} alt="Volver" />
                    </button>
                    <h1 className="titulo-aprender">{tutorial.nombre}</h1>
                </div>

                <div className="contenido-aprender">
                    <img 
                        src={tutorial.imagen}
                        alt={tutorial.nombre} 
                        className="imagen-aprender" 
                    />
                    <p className="descripcion-aprender">{tutorial.descripcion}</p>
                </div>

            </div>
        </div>
    );
}