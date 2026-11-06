import './guia.css';
import flecha from '../../PACIENTE/seleccionVIDEO/flecha.png'
import { useNavigate } from 'react-router-dom';

export default function Guia() {
    const navigate = useNavigate();

    const handleNavigateBack = () => {
        navigate(-1);
    }
    
    return (
        <div className="contenedor-guia">
            <div className="guia-content">
                <img src={flecha} alt="flecha" className='flecha' onClick={handleNavigateBack}/>
                <h1>Guía Médica sobre el ACV</h1>
                
                <div className="guia-section">
                    <h2>¿Qué es y cuál es su fisiopatología?</h2>
                    <p>Un Accidente Cerebrovascular (ACV) o ictus es una emergencia neurológica crítica que ocurre cuando se interrumpe el flujo sanguíneo a una región específica del cerebro. Esta interrupción priva inmediatamente a las neuronas de oxígeno y glucosa, desencadenando una cascada isquémica que, de no revertirse a tiempo, conduce a la muerte celular irreversible.</p>
                    <p>Existen dos mecanismos fisiopatológicos principales. El más frecuente es el ACV isquémico, que representa aproximadamente el 85% de los casos. Este se produce por la oclusión de una arteria cerebral, generalmente a causa de un trombo formado in situ (aterotrombótico) o un émbolo que viaja desde otra parte del cuerpo, comúnmente desde el corazón.</p>
                    <p>El segundo mecanismo es el ACV hemorrágico, responsable del 15% restante de los casos. Se desencadena por la ruptura de un vaso sanguíneo intracraneal, lo que genera un sangrado directo en el tejido cerebral o en el espacio subaracnoideo. Esta hemorragia no solo priva de sangre al área afectada, sino que eleva bruscamente la presión dentro del cráneo, comprimiendo mecánicamente el cerebro sano circundante.</p>
                </div>
                
                <div className="guia-section">
                    <h2>Factores de riesgo determinantes</h2>
                    <p>El desarrollo de un evento cerebrovascular está fuertemente condicionado por factores de riesgo que la medicina clasifica en no modificables y modificables. Entre los no modificables destacan la edad avanzada, el sexo biológico y la predisposición genética o antecedentes familiares de enfermedades cardiovasculares.</p>
                    <p>El enfoque clínico preventivo se centra en los factores modificables. La hipertensión arterial crónica es el factor predictivo y causal más significativo, ya que genera un daño mecánico y progresivo en las paredes de las arterias (endotelio vascular). A esto se suman patologías metabólicas como la diabetes mellitus, que acelera drásticamente la ateroesclerosis, y la dislipidemia, caracterizada por niveles elevados de colesterol LDL circulante.</p>
                    <p>Adicionalmente, las afecciones cardíacas, en particular las arritmias como la fibrilación auricular, incrementan de manera exponencial el riesgo de que se formen coágulos en el corazón. Todo este cuadro metabólico y vascular se ve agravado severamente por conductas de riesgo como el tabaquismo crónico, el sedentarismo absoluto, la obesidad y el consumo nocivo de alcohol.</p>
                </div>
                
                <div className="guia-section">
                    <h2>Manejo agudo y prevención médica</h2>
                    <p>En el ámbito de la neurología de urgencias, el protocolo de atención se rige por la máxima "el tiempo es cerebro". Frente a un ACV isquémico en su fase hiperaguda (dentro de una ventana terapéutica estricta de 4.5 horas), el tratamiento estándar es la reperfusión mediante trombólisis intravenosa con fármacos que disuelven el coágulo, o bien, la extracción del mismo mediante una trombectomía mecánica endovascular.</p>
                    <p>Una vez superada la fase aguda, la estrategia se vuelca hacia la prevención secundaria para evitar un nuevo evento. Esto exige un esquema farmacológico estricto de por vida, que incluye el uso de agentes antihipertensivos para mantener la presión arterial controlada, y estatinas de alta intensidad para estabilizar las placas de colesterol y reducir la inflamación arterial.</p>
                    <p>Dependiendo del origen específico del ACV, el paciente requerirá también terapia antitrombótica focalizada. Esto implica la administración de antiagregantes plaquetarios (como la aspirina) para causas vinculadas a la ateroesclerosis, o la prescripción de anticoagulantes orales en aquellos pacientes cuyo ACV tuvo un origen cardíaco documentado.</p>
                </div>
                
                <div className="guia-section">
                    <h2>Rehabilitación neurocognitiva y física</h2>
                    <p>El proceso de recuperación funcional tras un ACV se fundamenta biológicamente en la neuroplasticidad: la asombrosa capacidad del tejido cerebral periférico sano para reorganizar sus redes sinápticas y asumir progresivamente las funciones del área lesionada. Para optimizar este proceso, es innegociable la intervención temprana de un equipo interdisciplinario.</p>
                    <p>La rehabilitación física, liderada por la kinesiología neurológica, se enfoca intensivamente en recuperar el control motor, el equilibrio y la marcha, mitigando secuelas como la espasticidad muscular (rigidez). En paralelo, la fonoaudiología resulta vital para rehabilitar los trastornos neurológicos de la deglución (disfagia), previniendo ahogos, y para tratar los déficits de comprensión o expresión del lenguaje (afasias).</p>
                    <p>Finalmente, la terapia ocupacional es indispensable para reentrenar las actividades de la vida diaria, devolviendo al paciente la mayor autonomía posible. A nivel psiquiátrico, el apoyo emocional y farmacológico es crucial, ya que la depresión post-ACV es una secuela neuroquímica muy frecuente que, de no ser tratada, paraliza la motivación y la adherencia al programa de rehabilitación.</p>
                </div>
                
            </div>
        </div>
    );
}