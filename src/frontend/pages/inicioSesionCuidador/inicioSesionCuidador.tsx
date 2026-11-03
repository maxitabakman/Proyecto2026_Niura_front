import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function InicioSesionCuidador () {
    const [dni, setDni] = useState<string> ('');
    const [contraseña, setContraseña] = useState<string>('');

    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (dni == '' && contraseña == '') {
            alert('Porfavor, llenar sus datos.');
        }
        else {
            navigate ('/inicioSesionCuidador');
        }
    }

    return (
        <form className='DatosInicioCuidador' onSubmit={handleSubmit}>
            <input type="text" className='dni' id='dni' value={dni} onChange={(e) => setDni(e.target.value)}/>
            <input type="password" className='contraseña' id='contraseña' value={contraseña} onChange={(e) => setContraseña(e.target.value)}/>
            <button className='enviar' id='enviar'>Enviar</button>
        </form>
    )
}