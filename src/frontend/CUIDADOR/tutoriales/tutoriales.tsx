import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Tutorial } from '../../PACIENTE/seleccionEjercicio/seleccionDeEjercicios'
import flecha from '../../PACIENTE/EleccionEjercicio/flecha.png'
import buscar from './boxicons_search-alt.png'
import flechaSiguiente from './arrowforward.png'
import tutorialImg from './Frame 94.png'
import './tutoriales.css'

export default function Tutoriales() {
    const [busqueda, setBusqueda] = useState('');
    const [tutoriales, setTutoriales] = useState<Tutorial[]>([]);
    const navigate = useNavigate();
    const [paginaActual, setPaginaActual] = useState(0); 
    const tutorialesPagina = 4;

    useEffect(() => {
        fetch ('https://mocki.io/v1/b4e3da42-ec3b-49fe-a978-69de0712cfb9')
            .then(response => response.json())
            .then(data => {
                setTutoriales(data);
            })
            .catch(error => {
                console.error('Error fetching tutoriales:', error);
            });
    }, [busqueda]);

    const tutorialesfiltrados = tutoriales.filter(tutorial => (
        tutorial.nombre.toLowerCase().includes(busqueda.toLowerCase())
    ));

    const totalPaginas = Math.ceil(tutorialesfiltrados.length / tutorialesPagina);
    
    const tutorialesPaginados = tutorialesfiltrados.slice(
        paginaActual * tutorialesPagina,
        (paginaActual + 1) * tutorialesPagina
    );

    const handleNavigateSiguiente = () => {
        if (paginaActual < totalPaginas - 1) {
            setPaginaActual(paginaActual + 1);
        }
    };

    const handleNavigateAnterior = () => {
        if (paginaActual > 0) {
            setPaginaActual(paginaActual - 1);
        }
    };

    const handleNavigateBack = () => {
        navigate(-1);
    }

    const handleNavigateTutorial = (id: string | number) => {
        navigate(`/CUIDADOR/tutorial/${id}`);
    };

    return (
        <div className="contenedor-fondo-tutoriales">
            <div className="tutoriales-tarjeta-principal">
                
                {/* Cabecera con flecha y título */}
                <div className="cabecera-tutoriales">
                    <button className="btn-volver-tutoriales" onClick={handleNavigateBack}>
                        <img src={flecha} alt="Volver" />
                    </button>
                    <h1 className="titulo-tutoriales">Elije el ejercicio a aprender</h1>
                </div>

                {/* Buscador */}
                <div className='input-busqueda-tutoriales'>
                    <input
                        type="text"
                        placeholder="ingresa el nombre"
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPaginaActual(0); // Vuelve a la página 1 al buscar
                        }}
                    />
                    <img src={buscar} alt="Buscar" className="search-icon-tutoriales" />
                </div>

                {/* Carrusel */}
                <div className="carrusel-tutoriales">
                    <img 
                        src={flechaSiguiente} 
                        alt="Anterior" 
                        className={`arrow-carrusel arrow-backward ${paginaActual === 0 ? 'disabled' : ''}`} 
                        onClick={handleNavigateAnterior} 
                    />
                    
                    <div className="grilla-tutoriales">
                        {tutorialesPaginados.map((tutorial) => (
                            <div key={tutorial.id} className="tutorial-card">
                                <h2>{tutorial.nombre}</h2>
                                {/* Eliminé la descripción y la imagen extra para que quede igual al diseño */}
                                <img src={tutorialImg} alt="Navegar" className="btn-tutorial-img" onClick={() => handleNavigateTutorial(tutorial.id)} />
                            </div>
                        ))}
                    </div>

                    <img 
                        src={flechaSiguiente} 
                        alt="Siguiente" 
                        className={`arrow-carrusel arrow-forward ${paginaActual >= totalPaginas - 1 ? 'disabled' : ''}`} 
                        onClick={handleNavigateSiguiente} 
                    />
                </div>

                {/* Indicadores (Puntitos abajo) */}
                <div className="indicadores-carrusel">
                    {Array.from({ length: totalPaginas || 5 }).map((_, index) => (
                        <span 
                            key={index} 
                            className={`punto ${index === paginaActual ? 'punto-activo' : ''}`}
                            onClick={() => setPaginaActual(index)}
                        ></span>
                    ))}
                </div>

            </div>
        </div>
    );
}