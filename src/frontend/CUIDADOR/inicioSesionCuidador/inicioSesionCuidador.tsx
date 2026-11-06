import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './inicioSesionCuidador.css';
import confirmar from '../../PACIENTE/confirmarSeleccionEjercicio/btn-confirmar.png';
import flecha from '../../PACIENTE/EleccionEjercicio/flecha.png';
import logo from '../../PACIENTE/registroPaciente/logo.png';

export default function InicioSesionCuidador () {
    const [ nombre, setNombre ] = useState<string>('');
    const [ apellido, setApellido ] = useState<string>('');
    const [ mail, setMail ] = useState<string>(''); // <-- Nuevo campo para el email
    const [ contraseña, setContraseña ] = useState<string>('');
    const [ cargando, setCargando ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!nombre.trim() || !apellido.trim() || !mail.trim() || !contraseña.trim()) {
            alert('Por favor, llenar todos sus datos.');
            return;
        }

        setCargando(true);

        try {
            const response = await fetch('http://localhost:3000/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    email: mail,
                    password: contraseña,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }

            const userId = data.user?.id ?? data.user?.id_usuario ?? data.user?.usuario_id;
            if (userId === undefined || userId === null || userId === '') {
                throw new Error('El servidor no devolvió el ID del usuario');
            }

            // Guardamos el token devuelto
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userId', String(userId));

            navigate('/cuidador/paginagralcuidador');

        } catch (err: unknown) {
            console.error('Error en login:', err);
            setError(err instanceof Error ? err.message : 'Error de conexión con el servidor');
        } finally {
            setCargando(false);
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

                {error && (
                    <p style={{ color: 'red', textAlign: 'center', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                        {error}
                    </p>
                )}

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

                    {/* Campo de email dentro del mismo diseño */}
                    <input 
                        type="email" 
                        className="input-campo" 
                        id="email" 
                        value={mail} 
                        onChange={(e) => setMail(e.target.value)} 
                        required 
                        placeholder="Tu email"
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
                
                <button type="submit" className="btn-submit-invisible" disabled={cargando}>
                    <img src={confirmar} alt="Confirmar" className="img-confirmar-login"/>
                </button>
                
            </form>
        </div>
    );
}