import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './inicioSesionCuidador.css';
import confirmar from '../../PACIENTE/confirmarSeleccionEjercicio/btn-confirmar.png';
import flecha from '../../PACIENTE/EleccionEjercicio/flecha.png';
import logo from '../../PACIENTE/registroPaciente/logo.png';

 
export default function InicioSesionCuidador () {
    const [ nombre, setNombre ] = useState<string> ('');
    const [ apellido, setApellido ] = useState<string> ('');
    const [ contraseña, setContraseña ] = useState<string>('');

    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nombre == '' && apellido == '' && contraseña == '') {
            alert('Porfavor, llenar sus datos.');
        }
        else {
            navigate ('/cuidador/paginagralcuidador');
        }
    }

    const handleNavigateBack = () => {
        navigate(-1);
    }

    const handleNavigateRegistro = () => {
        navigate('/registroCuidador');
    }

    return (
        <div className="contenedor-pantalla-login-cuidador">
            <div className="logo-pantalla">
                <img src={logo} alt="niura" />
            </div>
            <form className="DatosInicioCuidador" onSubmit={handleSubmit}>
                
                <div className="cabecera-form">
                    <img 
                        src={flecha} 
                        alt="Volver" 
                        className="flecha-volver" 
                        onClick={handleNavigateBack}
                    />
                    <h2 className="titulo-login">Inicia sesión</h2>
                </div>
                
                <p className="texto-registro">
                    ¿No tienes una cuenta?{' '}
                    <span className="link-registro" onClick={handleNavigateRegistro}>
                        REGISTRATE
                    </span>
                </p>

                <div className="contenedor-inputs">
                    <input 
                        type="text" 
                        className="input-campo" 
                        id="nombre" 
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)} 
                        required 
                        placeholder="Tu nombre"
                    />

                    <input 
                        type="text" 
                        className="input-campo" 
                        id="apellido" 
                        value={apellido} 
                        onChange={(e) => setApellido(e.target.value)} 
                        required 
                        placeholder="Tu apellido"
                    />
                    
                    <input 
                        type="password" 
                        className="input-campo" 
                        id="contraseña" 
                        value={contraseña} 
                        onChange={(e) => setContraseña(e.target.value)} 
                        required 
                        placeholder="Tu contraseña"
                    />
                </div>
                
                <button type="submit" className="btn-submit-invisible">
                    <img src={confirmar} alt="Confirmar" className="img-confirmar-login"/>
                </button>
                
            </form>
        </div>
    );
}