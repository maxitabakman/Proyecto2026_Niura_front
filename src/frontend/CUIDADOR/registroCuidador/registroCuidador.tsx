import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCuidador } from '../../Contexts/contextoCuidador';
import confirmar from '../../PACIENTE/confirmarSeleccionEjercicio/btn-confirmar.png';
import logo from '../../PACIENTE/registroPaciente/logo.png';
import arrowback from '../../PACIENTE/EleccionEjercicio/flecha.png';
import './registroCuidador.css';

export default function RegistroCuidador () {

    const navigate = useNavigate();

    const { nombre, setNombre } = useCuidador();
    const [apellido, setApellido] = useState<string>('');
    const [mail, setMail] = useState<string>('');
    const [contraseña, setContraseña] = useState<string>('');
    const [cargando, setCargando] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!nombre.trim() || !apellido.trim() || !mail.trim() || !contraseña.trim()) {
            alert('Por favor, llenar sus datos.');
            return;
        }

        setCargando(true);

        try {
            const response = await fetch('http://localhost:3000/usuarios/acompanante', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: nombre,
                    surname: apellido,
                    email: mail,
                    password: contraseña
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al registrar el cuidador');
            }

            // Registro exitoso -> Redirigir
            navigate('/inicioSesionCuidador');

        } catch (err: any) {
            console.error('Error al registrar:', err);
            setError(err.message || 'Ocurrió un error al intentar conectarse con el servidor');
        } finally {
            setCargando(false);
        }
    }

    // Normalizados sin '@' inicial para evitar dobles arrobas '@@'
    const dominiosGmail = ['gmail.com', 'yahoo.com.ar', 'hotmail.com', 'outlook.com'];
    const personal = mail.includes("@") ? mail.split("@")[0] : mail;
    const usuarioMail = personal.replace(/\s+/g, '');

    return (
        <div className="registro-cuidador-pantalla">
            <div className="logo-pantalla">
                <img src={logo} alt="niura" />
            </div>

            <div className="registro-tarjeta-cuidador">
                <div className="registro-header">
                    <button type="button" className="btn-volver" onClick={() => navigate(-1)}>
                        <img src={arrowback} alt="Volver" className="icono-volver" />
                    </button>
                    <h1 className="registro-titulo-cuidador">Registrate</h1>
                </div>

                {error && (
                    <p style={{ color: 'red', textAlign: 'center', fontSize: '0.9rem' }}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className='Datos'>
                    <input 
                        type="email" 
                        list='opcionesGmail' 
                        required 
                        placeholder='Tu mail' 
                        id='gmailCuidador' 
                        className='registro-input-cuidador' 
                        value={mail} 
                        onChange={(e) => setMail(e.target.value)} 
                    />
                    <datalist id='opcionesGmail'>
                        {usuarioMail && dominiosGmail.map((dominio) => (
                            <option key={dominio} value={`${usuarioMail}@${dominio}`}></option>
                        ))}
                    </datalist>

                    <input 
                        type="text" 
                        required 
                        placeholder='Tu nombre' 
                        id='nombreCuidador' 
                        className='registro-input-cuidador' 
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)} 
                    />
                    
                    <input 
                        type="text" 
                        required 
                        placeholder='Tu apellido' 
                        id='apellidoCuidador' 
                        className='registro-input-cuidador' 
                        value={apellido} 
                        onChange={(e) => setApellido(e.target.value)} 
                    />
                    
                    <input 
                        type="password" 
                        required 
                        placeholder='Tu contraseña' 
                        id='contraseñaCuidador' 
                        className='registro-input-cuidador' 
                        value={contraseña} 
                        onChange={(e) => setContraseña(e.target.value)} 
                    />
                    
                    <button type='submit' id='Enviar' className='btn-confirmar-imagen' disabled={cargando}>
                        <img src={confirmar} alt="Confirmar" />
                    </button>
                </form>
            </div>
        </div>
    );
}