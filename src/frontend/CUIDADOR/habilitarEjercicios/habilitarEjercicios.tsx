import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Elemento } from '../../PACIENTE/seleccionEjercicio/seleccionDeEjercicios'
import flecha from '../../PACIENTE/EleccionEjercicio/flecha.png'
import flechaSiguiente from '../tutoriales/arrowforward.png'
import loTengo from './Frame 93.png'
import './habilitarEjercicios.css'

export default function HabilitarEjercicios() {
    const [elemento, setElemento] = useState<Elemento[]>([]);
    const navigate = useNavigate();
    const [paginaActual, setPaginaActual] = useState(0); 
    const elementosPagina = 4;

    useEffect(() => {
        fetch ('https://mocki.io/v1/10ceb5c2-327b-4194-a9d6-7e7bfb580abc')
            .then(response => response.json())
            .then(data => {
                setElemento(data);
            })
            .catch(error => {
                console.error('Error fetching elemento:', error);
            });
    }, []);

    const totalPaginas = Math.ceil(elemento.length / elementosPagina);
    
    const elementosPaginados = elemento.slice(
        paginaActual * elementosPagina,
        (paginaActual + 1) * elementosPagina
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

    const handleNavigateElemento = (id: string) => {
        navigate(`/CUIDADOR/elemento/${id}`);
    };

    return (
        <div className="contenedor-fondo-elementos">
            <div className="elementos-tarjeta-principal">
                
                <div className="cabecera-elementos">
                    <button className="btn-volver-elementos" onClick={handleNavigateBack}>
                        <img src={flecha} alt="Volver" />
                    </button>
                    <h1 className="titulo-elementos">Elementos recomendados por tu médico</h1>
                </div>

                <div className="carrusel-elementos">
                    <img 
                        src={flechaSiguiente} 
                        alt="Anterior" 
                        className={`arrow-carrusel arrow-backward ${paginaActual === 0 ? 'disabled' : ''}`} 
                        onClick={handleNavigateAnterior} 
                    />
                    
                    <div className="grilla-tutoriales">
                        {elementosPaginados.map((item) => (
                            <div key={item.id} className="tutorial-card">
                                <h2>{item.nombre}</h2>
                                <img 
                                    src={loTengo} 
                                    alt="Navegar" 
                                    className="btn-elemento-img" 
                                    onClick={() => handleNavigateElemento(String(item.id))} 
                                />
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

                <div className="indicadores-carrusel">
                    {Array.from({ length: totalPaginas || 1 }).map((_, index) => (
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