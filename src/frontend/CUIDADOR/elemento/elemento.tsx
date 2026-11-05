import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import flecha from '../../PACIENTE/EleccionEjercicio/flecha.png'; 
import imgUpload from './btn-upload.png'; 
import iconoExito from './yes.png';
import iconoError from './deny.png';
import './elemento.css';

type EstadoPantalla = 'seleccion' | 'exito' | 'error';

export default function SubirFotoElemento() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [foto, setFoto] = useState<File | null>(null);
    const [estado, setEstado] = useState<EstadoPantalla>('seleccion');

    const handleNavigateBack = () => {
        navigate(-1);
    };

    const handleBoxClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFoto(e.target.files[0]);
        }
    };

    const handleConfirmar = () => {
        setTimeout(() => {
            const subidaExitosa = Math.random() > 0.5;
            if (subidaExitosa) {
                setEstado('exito');
            } else {
                setEstado('error');
            }
        }, 1000);
    };

    const handleVolverInicio = () => {
        navigate('/cuidador/paginagralcuidador');
    };

    return (
        <div className="contenedor-fondo-subir">
            <div className={`tarjeta-subir-foto ${estado === 'error' ? 'tarjeta-error' : ''}`}>
                
                {/* Botón de volver posicionado de forma absoluta en la esquina de la tarjeta */}
                {estado === 'seleccion' && (
                    <button className="btn-volver-subir" onClick={handleNavigateBack}>
                        <img src={flecha} alt="Volver" />
                    </button>
                )}
                
                {estado === 'seleccion' && (
                    <div className="estado-seleccion">
                        <h1 className="titulo-principal">Sube una foto del elemento</h1>

                        <div className="zona-upload" onClick={handleBoxClick}>
                            <img src={imgUpload} alt="Subir archivo" className="upload-icon" />
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleFileChange}
                            />
                        </div>
                    
                        {foto && <p className="nombre-archivo">{foto.name}</p>}

                        <button className="btn-accion-azul" onClick={handleConfirmar}>
                            Confirmar
                        </button>
                    </div>
                )}

                {estado === 'exito' && (
                    <div className="estado-mensaje">
                        <h1 className="titulo-principal">Tu elemento fue aprobado</h1>
                        <p className="descripcion-mensaje">Nuevos ejercicios serán habilitados al paciente.</p>
                        
                        <img src={iconoExito} alt="Éxito" className="icono-estado" />
                        
                        <button className="btn-accion-azul" onClick={handleVolverInicio}>
                            Volver al inicio
                        </button>
                    </div>
                )}

                {estado === 'error' && (
                    <div className="estado-mensaje">
                        <h1 className="titulo-principal">No pudimos reconocer el elemento</h1>
                        <p className="descripcion-mensaje">Por favor, vuelve a intentarlo</p>
                        
                        <img src={iconoError} alt="Error" className="icono-estado" />
                        
                        <button className="btn-accion-azul" onClick={handleVolverInicio}>
                            Volver al inicio
                        </button>
                    </div>
                )} 
            </div>
        </div>
    );
}