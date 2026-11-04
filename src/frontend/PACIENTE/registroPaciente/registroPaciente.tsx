
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaciente } from '../../Contexts/contextPaciente';
import confirmar from '../confirmarSeleccionEjercicio/btn-confirmar.png';
import logo from './logo.png';
import arrowback from '../EleccionEjercicio/flecha.png';
import './registroPaciente.css';

export default function IniciodeSesion() {

    const { nombre, setNombre } = usePaciente();
    const [apellido, setApellido] = useState<string>("");
    const [mail, setMail] = useState<string>("");
    const [contraseña, setContraseña] = useState<string>("");

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (nombre !== "" && apellido !== "" && mail !== "" && contraseña !== "") {

            try {
                const response = await fetch("http://localhost:3000/usuarios/paciente", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: nombre,
                        surname: apellido,
                        email: mail,
                        password: contraseña
                    })
                });

                const resultado = await response.json();

                if (!response.ok) {
                    throw new Error(resultado.message || "Error al crear el usuario");
                }

                console.log("Usuario creado:", resultado.user);

                alert("Usuario creado con éxito");
                navigate('/paciente/ejercitar');

            } catch (error) {
                console.error("Error al registrar:", error);
                alert(error instanceof Error ? error.message : "Error al conectar con el servidor");
            }

        } else {
            alert('Porfavor, llenar sus datos.');
        }
    };

    const dominiosGmail = ["gmail.com", "yahoo.com.ar", "hotmail.com", "outlook.com"];

    const personal = mail.includes("@") ? mail.split("@")[0] : mail;
    const usuarioMail = personal.replace(/\s+/g, '');

    return (
        <div className="registro-pantalla">
            <div className="logo-pantalla">
                <img src={logo} alt="niura" />
            </div>

            <div className="registro-tarjeta">
                <div className="registro-header">
                    <button type="button" className="btn-volver" onClick={() => navigate(-1)}>
                        <img src={arrowback} alt="Volver" className="icono-volver" />
                    </button>
                    <h1 className="registro-titulo">Registrate</h1>
                </div>

                <form className="Datos" onSubmit={handleSubmit}>
                    <input type="email" list='listaDominios' required placeholder="Tu mail" id="mailPaciente" className="registro-input" value={mail} onChange={(e) => setMail(e.target.value)} />

                    <datalist id='listaDominios'>
                        {usuarioMail && dominiosGmail.map((dominio) => (
                            <option key={dominio} value={`${usuarioMail}@${dominio}`}></option>
                        ))}
                    </datalist>

                    <input type="text" required placeholder="Tu nombre" id="nombrePaciente" className="registro-input" value={nombre} onChange={(e) => setNombre(e.target.value)} />

                    <input type="text" required placeholder="Tu apellido" id="apellidoPaciente" className="registro-input" value={apellido} onChange={(e) => setApellido(e.target.value)} />

                    <input type="password" required placeholder="Tu contraseña" id="contraseñaPaciente" className="registro-input" value={contraseña} onChange={(e) => setContraseña(e.target.value)} />

                    <button type="submit" id='Enviar' className='btn-confirmar-imagen'>
                        <img src={confirmar} alt="Confirmar" />
                    </button>
                </form>
            </div>
        </div>
    );
}
