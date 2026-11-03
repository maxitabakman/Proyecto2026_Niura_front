import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMedico } from "../../Contexts/contextoMedico";
import confirmar from '../../PACIENTE/confirmarSeleccionEjercicio/btn-confirmar.png';
import logo from '../../PACIENTE/registroPaciente/logo.png';
import arrowback from '../../PACIENTE/EleccionEjercicio/flecha.png';
import './registroMedico.css';

export default function InicioSesionMedico() {
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nombre !== "" && apellido !== "" && mail !== "" && contraseña !== ""){
            navigate('/medico/pacient');
        }
        else {
            alert('Por favor, llenar sus datos.');
        }
    }

    const {nombre, setNombre} = useMedico();
    const [apellido, setApellido] = useState<string>("");
    const [mail, setMail] = useState<string>("");
    const [contraseña, setContraseña] = useState<string>("");
    const [matricula, setMatricula] = useState<File | null>(null);
    const [matriculaTexto, setMatriculaTexto] = useState<string>("");
    const handleImageChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        if (archivo) {
            setMatricula(archivo);
        }
    }

    const dominiosGmail = ["gmail.com", "yahoo.com.ar", "hotmail.com", "outlook.com"];
    console.log (matricula)
    const personal = mail.includes("@")? mail.split("@")[0] : mail;
    const usuarioMail = personal.replace(/\s+/g, '');

    return (
        <div className="registro-medico-pantalla">
            <div className="logo-pantalla">
                <img src={logo} alt="niura" />
            </div>

            <div className="registro-tarjeta-medico">
                <div className="registro-header">
                    <button type="button" className="btn-volver" onClick={() => navigate(-1)}>
                        <img src={arrowback} alt="Volver" className="icono-volver" />
                    </button>
                    <h1 className="registro-titulo-medico">Registrate</h1>
                </div>

                <form className="Datos" onSubmit={handleSubmit}>
                    <input type="email" list="listaDominios" required placeholder="Tu mail" id="mailMedico" className="registro-input" value={mail} onChange={(e) => setMail(e.target.value)} />
                    <datalist id='listaDominios'>{usuarioMail && dominiosGmail.map((dominio) => (
                        <option key={dominio} value={`${usuarioMail}@${dominio}`}></option>
                    ))}</datalist>

                    <input type="text" required placeholder="Tu nombre" id="nombreMedico" className="registro-input" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    
                    <input type="text" required placeholder="Tu apellido" id="apellidoMedico" className="registro-input" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                    
                    {/* Campo visual para la matrícula que encaja con el diseño */}
                    <input type="text" required placeholder="Tu matrícula" className="registro-input" value={matriculaTexto} onChange={(e) => setMatriculaTexto(e.target.value)} />
                    {/* El file de matrícula oculto pero funcional para tu backend */}
                    <input type="file" id="matriculaMedico" className="campo-oculto" accept="image/*" onChange={handleImageChange} />
                    
                    <input type="password" required placeholder="Tu contraseña" id="contraseñaMedico" className="registro-input" value={contraseña} onChange={(e) => setContraseña(e.target.value)} />
                    
                    <button type='submit' id="Enviar" className="btn-confirmar-imagen">
                        <img src={confirmar} alt="Confirmar" />
                    </button>
                </form>
            </div>
        </div>
    );
}