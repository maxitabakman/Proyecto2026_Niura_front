import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Ejercicios } from '../../../PACIENTE/seleccionEjercicio/seleccionDeEjercicios';
import flecha from '../../../PACIENTE/seleccionVIDEO/flecha.png';
import flechaSiguiente from '../../../PACIENTE/seleccionEjercicio/arrowback.png';
import lupa from '../img/boxicons_search-alt.png';
import '../css/asignarEjercicio.css';

export default function AsignarEjercicio() {
    const [ejercicios, setEjercicios] = useState<Ejercicios[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(0);
    const elementosPorPagina = 4;
    
    const navigate = useNavigate();

    useEffect(() => {
        fetch('api/martinProgramaporfi')
            .then((res) => res.json())
            .then((data: Ejercicios[]) => { setEjercicios(data) })
            .catch((err) => console.error(`Hay un error: ${err}`));
            
    }, []);

    const ejerciciosFiltrados = ejercicios.filter(ejercicio => 
        ejercicio.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const totalPaginas = Math.ceil(ejerciciosFiltrados.length / elementosPorPagina);

    const carruselElementos = ejerciciosFiltrados.slice(
        paginaActual * elementosPorPagina, 
        (paginaActual + 1) * elementosPorPagina
    );

    const handleNavigateCarruselPaginaAnterior = () => {
        if (paginaActual > 0) setPaginaActual(paginaActual - 1);
    };

    const handleNavigateCarruselPaginaSiguiente = () => {
        if (paginaActual < totalPaginas - 1) setPaginaActual(paginaActual + 1);
    };

    const handleNavigate = (id: number | string) => {
        navigate(`/medico/quieresAsignarlo/${id}`);
    };

    const handleNavigateCrearEjercicio = () => {
        navigate('/medico/crearEjercicio');
    };

    return (
        <div className="contenedor-fondo-medico">
            <div className="tarjeta-principal-medico">
                
                <div className="cabecera-medico">
                    <button className="btn-volver" onClick={() => navigate(-1)}>
                        <img src={flecha} alt="Volver" style={{ width: '20px' }} />
                    </button>
                    <h1 className="titulo-medico">Asigna un nuevo ejercicio</h1>
                </div>

                <div className="contenedor-buscador">
                    <input 
                        type="text" 
                        className="input-buscador" 
                        placeholder="ingresa el nombre" 
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPaginaActual(0);
                        }}
                    />
                    <img src={lupa} alt="Buscar" className="icono-lupa" />
                </div>

                <div className="carrusel-contenedor">
                    <button className="btn-flecha" onClick={handleNavigateCarruselPaginaAnterior}>
                        <img src={flechaSiguiente} alt="flechaCarrusel" className="icono-flecha" />
                    </button>

                    <div className="grilla-ejercicios">
                        {carruselElementos.map((ejercicio) => (
                            <div key={ejercicio.id} className="CardPendiente">
                                <h3 className="titulo-ejercicio">{ejercicio.nombre}</h3>
                                <button className="botonAsignar" onClick={() => handleNavigate(ejercicio.id)}>
                                    Asignar
                                </button>
                            </div>
                        ))}
                    </div>

                    <button className="btn-flecha" onClick={handleNavigateCarruselPaginaSiguiente} disabled={paginaActual >= totalPaginas - 1}>
                        <img src={flechaSiguiente} alt="flechaCarrusel" className="icono-flecha" />
                    </button>
                </div>

                <button className="CrearEjercicio" onClick={handleNavigateCrearEjercicio}>
                    Crea un nuevo ejercicio +
                </button>
            </div>
        </div>
    );
}