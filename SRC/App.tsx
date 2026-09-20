import React, { useState, useEffect } from 'react';
import { 
  Mic, Camera, ArrowLeft, Plus, BookOpen, Calculator, FlaskConical, 
  SquareActivity, StopCircle, Edit3, Trash2, X, Zap, Flame, Leaf, 
  Droplets, Mountain, Globe, Map, Recycle, Wind, TestTube, BarChart, 
  Compass, HardHat, Microscope, FileText, Briefcase,
  Search, AlertTriangle, Download, HelpCircle, Send, CheckCircle2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- STREAMING PROGRESS MARKERS ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'apuntes-ambiental-app';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
let app, auth, db;
if (firebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

const IconosDisponibles = {
  SquareActivity, Calculator, FlaskConical, BookOpen, Zap, Flame, Leaf, 
  Droplets, Mountain, Globe, Map, Recycle, Wind, TestTube, BarChart, 
  Compass, HardHat, Microscope, FileText, Briefcase
};

const ColoresDisponibles = [
  { id: 'blue', border: 'border-blue-500', text: 'text-blue-400', bg: 'bg-blue-500' },
  { id: 'purple', border: 'border-purple-500', text: 'text-purple-400', bg: 'bg-purple-500' },
  { id: 'yellow', border: 'border-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500' },
  { id: 'green', border: 'border-green-500', text: 'text-green-400', bg: 'bg-green-500' },
  { id: 'orange', border: 'border-orange-500', text: 'text-orange-400', bg: 'bg-orange-500' },
  { id: 'red', border: 'border-red-500', text: 'text-red-400', bg: 'bg-red-500' },
  { id: 'teal', border: 'border-teal-500', text: 'text-teal-400', bg: 'bg-teal-500' },
  { id: 'gray', border: 'border-gray-500', text: 'text-gray-400', bg: 'bg-gray-500' }
];

const numerosRomanos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export default function AppApuntes() {
  const [pantallaActual, setPantallaActual] = useState('semestres');
  const [semestreSeleccionado, setSemestreSeleccionado] = useState(null);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
  const [semestreCursando, setSemestreCursando] = useState(3);
  
  const [mensajeCamara, setMensajeCamara] = useState('');
  const [fotoTomada, setFotoTomada] = useState(false);

  const [user, setUser] = useState(null);
  const [nubeLista, setNubeLista] = useState(false);
  const [estadoSincronizacion, setEstadoSincronizacion] = useState('Conectando a la nube...');

  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [tareas, setTareas] = useState({});
  const [consultaRapida, setConsultaRapida] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [apuntes, setApuntes] = useState({});

  const [materias, setMaterias] = useState([
      // Semestre I
      { nombre: 'Matemáticas I', icon: 'Calculator', color: 'gray', semestre: 1 },
      { nombre: 'Física I', icon: 'Zap', color: 'gray', semestre: 1 },
      { nombre: 'Biología General', icon: 'Leaf', color: 'green', semestre: 1 },
      { nombre: 'Química General', icon: 'FlaskConical', color: 'orange', semestre: 1 },
      { nombre: 'Dibujo y diseño asistido por computador', icon: 'Compass', color: 'blue', semestre: 1 },
      { nombre: 'Introducción a la Ingeniería ambiental y de saneamiento', icon: 'HardHat', color: 'red', semestre: 1 },
      { nombre: 'Humanidades', icon: 'BookOpen', color: 'red', semestre: 1 },

      // Semestre II
      { nombre: 'Matemáticas II', icon: 'Calculator', color: 'gray', semestre: 2 },
      { nombre: 'Física II', icon: 'Zap', color: 'gray', semestre: 2 },
      { nombre: 'Ecología', icon: 'Leaf', color: 'green', semestre: 2 },
      { nombre: 'Química orgánica', icon: 'FlaskConical', color: 'orange', semestre: 2 },
      { nombre: 'Topografía y Cartografía', icon: 'Map', color: 'blue', semestre: 2 },
      { nombre: 'Sociología Ambiental', icon: 'BookOpen', color: 'red', semestre: 2 },
      { nombre: 'Electiva I', icon: 'FileText', color: 'red', semestre: 2 },

      // Semestre III
      { nombre: 'Matemáticas III', icon: 'Calculator', color: 'gray', semestre: 3 },
      { nombre: 'Física III', icon: 'Zap', color: 'gray', semestre: 3 },
      { nombre: 'Manejo y conservación de los recursos naturales', icon: 'Leaf', color: 'green', semestre: 3 },
      { nombre: 'Química Ambiental', icon: 'FlaskConical', color: 'orange', semestre: 3 },
      { nombre: 'Geología y edafología', icon: 'Mountain', color: 'orange', semestre: 3 },
      { nombre: 'Estadística', icon: 'BarChart', color: 'gray', semestre: 3 },
      { nombre: 'Seminario de Investigación', icon: 'FileText', color: 'red', semestre: 3 },

      // Semestre IV
      { nombre: 'Matemáticas IV', icon: 'Calculator', color: 'gray', semestre: 4 },
      { nombre: 'Resistencia de Materiales', icon: 'HardHat', color: 'orange', semestre: 4 },
      { nombre: 'Mecánica de Fluidos', icon: 'Droplets', color: 'orange', semestre: 4 },
      { nombre: 'Microbiología Ambiental', icon: 'Microscope', color: 'orange', semestre: 4 },
      { nombre: 'Fisicoquímica', icon: 'Flame', color: 'orange', semestre: 4 },
      { nombre: 'Problemas Regionales', icon: 'Globe', color: 'red', semestre: 4 },

      // Semestre V
      { nombre: 'Hidráulica', icon: 'Droplets', color: 'blue', semestre: 5 },
      { nombre: 'Hidrobiología', icon: 'Microscope', color: 'green', semestre: 5 },
      { nombre: 'Termodinámica', icon: 'Flame', color: 'orange', semestre: 5 },
      { nombre: 'Fotointerpretación', icon: 'Map', color: 'gray', semestre: 5 },
      { nombre: 'Muestreo y monitoreo de variables fisicoquímicas y biológicas', icon: 'TestTube', color: 'orange', semestre: 5 },
      { nombre: 'Constitución política y legislación ambiental', icon: 'BookOpen', color: 'red', semestre: 5 },

      // Semestre VI
      { nombre: 'Hidrología', icon: 'Droplets', color: 'blue', semestre: 6 },
      { nombre: 'Estructuras y redes Hidráulicas', icon: 'Droplets', color: 'blue', semestre: 6 },
      { nombre: 'Operaciones Unitarias I', icon: 'Zap', color: 'green', semestre: 6 },
      { nombre: 'Sistemas de Información Geográfica (SIG)', icon: 'Map', color: 'gray', semestre: 6 },
      { nombre: 'Calidad ambiental', icon: 'Leaf', color: 'green', semestre: 6 },
      { nombre: 'Electiva II', icon: 'FileText', color: 'red', semestre: 6 },
      { nombre: 'Ciencia y Sociedad', icon: 'Globe', color: 'red', semestre: 6 },

      // Semestre VII
      { nombre: 'Diseño de alcantarillados', icon: 'Droplets', color: 'blue', semestre: 7 },
      { nombre: 'Operaciones unitarias II', icon: 'Zap', color: 'green', semestre: 7 },
      { nombre: 'Planeación ambiental', icon: 'Map', color: 'green', semestre: 7 },
      { nombre: 'Manejo integral de residuos solidos -MIRS', icon: 'Recycle', color: 'green', semestre: 7 },
      { nombre: 'Evaluación y control de la contaminación', icon: 'SquareActivity', color: 'blue', semestre: 7 },
      { nombre: 'Sistemas de Gestión Integrados', icon: 'Briefcase', color: 'red', semestre: 7 },
      { nombre: 'Economía', icon: 'BarChart', color: 'red', semestre: 7 },

      // Semestre VIII
      { nombre: 'Diseño de plantas de Tratamiento de aguas I', icon: 'Droplets', color: 'blue', semestre: 8 },
      { nombre: 'Tecnologías limpias', icon: 'Wind', color: 'green', semestre: 8 },
      { nombre: 'Evaluación de impacto ambiental', icon: 'SquareActivity', color: 'green', semestre: 8 },
      { nombre: 'Gestión del Riesgo', icon: 'Flame', color: 'red', semestre: 8 },
      { nombre: 'Formulación y evaluación de proyectos ambientales', icon: 'FileText', color: 'red', semestre: 8 },
      { nombre: 'Electiva Profundización I', icon: 'BookOpen', color: 'red', semestre: 8 },

      // Semestre IX
      { nombre: 'Diseño de plantas de tratamiento de aguas II', icon: 'Droplets', color: 'blue', semestre: 9 },
      { nombre: 'Energías alternativas', icon: 'Zap', color: 'green', semestre: 9 },
      { nombre: 'Negocios verdes y emprendimiento', icon: 'Briefcase', color: 'red', semestre: 9 },
      { nombre: 'Electiva Profundización II', icon: 'BookOpen', color: 'red', semestre: 9 },

      // Semestre X
      { nombre: 'Consultorio Ambiental', icon: 'Briefcase', color: 'red', semestre: 10 },
      { nombre: 'Electiva Profundización III', icon: 'BookOpen', color: 'red', semestre: 10 }
  ]);

  useEffect(() => {
    if (!auth) return;
    const iniciarSesion = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined') {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Error de auth", e);
        setEstadoSincronizacion('Error de conexión ⚠️');
      }
    };
    iniciarSesion();

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setEstadoSincronizacion('Descargando datos...');
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'mi_cuaderno', 'datos_principales');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.materias) setMaterias(data.materias);
        if (data.apuntes) setApuntes(data.apuntes);
        if (data.tareas) setTareas(data.tareas);
        if (data.semestreCursando) setSemestreCursando(data.semestreCursando);
      }
      setNubeLista(true);
      setEstadoSincronizacion('Sincronizado ☁️');
    }, (error) => {
      console.error("Error en la nube:", error);
      setEstadoSincronizacion('Error al leer nube ⚠️');
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!nubeLista || !user || !db) return; 
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'mi_cuaderno', 'datos_principales');
    const timer = setTimeout(() => {
      setEstadoSincronizacion('Guardando...');
      setDoc(docRef, { materias, apuntes, tareas, semestreCursando }, { merge: true })
        .then(() => setEstadoSincronizacion('Sincronizado ☁️'))
        .catch(() => setEstadoSincronizacion('Error al guardar ⚠️'));
    }, 1500);
    return () => clearTimeout(timer);
  }, [materias, apuntes, tareas, semestreCursando, nubeLista, user]);

  const finalizarYGuardarClase = () => {
    const opcionesFecha = { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota' };
    const fechaHoy = new Date().toLocaleDateString('es-CO', opcionesFecha);
    
    const formulaSimulada = materiaSeleccionada.toLowerCase().includes('química') || materiaSeleccionada.toLowerCase().includes('biología') 
      ? 'H₂O + CO₂ ⇌ H₂CO₃ (Ácido Carbónico)' 
      : 'v = v_0 + a \\cdot t \\quad \\text{(Cinemática Ambiental)}';

    const nuevoApunte = {
      id: Date.now(),
      fecha: fechaHoy,
      texto: `Resumen de IA: El profesor explicó los conceptos clave de ${materiaSeleccionada}. Se discutieron las aplicaciones prácticas en ingeniería ambiental y la metodología para resolver los casos de estudio.`,
      formula: fotoTomada ? formulaSimulada : null,
    };

    const nuevaTarea = {
      id: Date.now() + 1,
      fecha: fechaHoy,
      texto: `Investigar sobre la permeabilidad y retención hídrica para la próxima clase de ${materiaSeleccionada}.`,
      completada: false
    };

    setApuntes(prev => ({
      ...prev,
      [materiaSeleccionada]: [...(prev[materiaSeleccionada] || []), nuevoApunte]
    }));

    setTareas(prev => ({
      ...prev,
      [materiaSeleccionada]: [...(prev[materiaSeleccionada] || []), nuevaTarea]
    }));

    setMensajeCamara('');
    setFotoTomada(false);
    setRespuestaIA('');
    setPantallaActual('cuaderno');
  };

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null); 
  const [formMateria, setFormMateria] = useState({ nombre: '', icon: 'BookOpen', color: 'green', semestre: 1 });

  const abrirModalNueva = () => {
    setFormMateria({ nombre: '', icon: 'BookOpen', color: 'green', semestre: semestreSeleccionado || 3 });
    setEditandoId(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (materia) => {
    setFormMateria(materia);
    setEditandoId(materia.nombre + materia.semestre);
    setModalAbierto(true);
  };

  const guardarMateria = () => {
    if (!formMateria.nombre.trim()) return;
    if (editandoId !== null) {
      setMaterias(materias.map(m => (m.nombre + m.semestre) === editandoId ? formMateria : m));
    } else {
      setMaterias([...materias, formMateria]);
    }
    setModalAbierto(false);
  };

  const eliminarMateria = () => {
    if (editandoId !== null) {
      setMaterias(materias.filter(m => (m.nombre + m.semestre) !== editandoId));
      setModalAbierto(false);
    }
  };

  const resultadosBusqueda = React.useMemo(() => {
    if (!terminoBusqueda.trim()) return [];
    const resultados = [];
    Object.keys(apuntes).forEach(materia => {
      apuntes[materia].forEach(apunte => {
        if (apunte.texto.toLowerCase().includes(terminoBusqueda.toLowerCase())) {
          resultados.push({ materia, apunte });
        }
      });
    });
    return resultados;
  }, [terminoBusqueda, apuntes]);

  const consultarConceptoIA = async (e) => {
    e.preventDefault();
    if (!consultaRapida.trim()) return;
    setCargandoIA(true);
    
    try {
      const apiKey = ""; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      
      const payload = {
          contents: [{ 
            parts: [{ 
              text: `Eres un tutor experto en Ingeniería Ambiental y de Saneamiento. Responde de forma muy breve (máximo 3 líneas), directa y clara a esta duda de un estudiante que está en clase de ${materiaSeleccionada}: "${consultaRapida}". Usa un tono profesional pero amigable e incluye emojis representativos.` 
            }] 
          }],
      };

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      const respuesta = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (respuesta) {
        setRespuestaIA(respuesta);
      } else {
        setRespuestaIA("Hubo un error al procesar el concepto. Intenta de nuevo.");
      }
    } catch (error) {
      console.error(error);
      setRespuestaIA("Error de red conectando con el cerebro de IA ⚠️");
    } finally {
      setCargandoIA(false);
      setConsultaRapida('');
    }
  };

  const marcarTareaCompletada = (materia, idTarea) => {
    setTareas(prev => ({
      ...prev,
      [materia]: prev[materia].map(t => t.id === idTarea ? { ...t, completada: !t.completada } : t)
    }));
  };

  if (pantallaActual === 'semestres') {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6 font-sans select-none pb-20 print:bg-white print:text-black">
        <header className="mb-8 border-b border-gray-800 pb-6 pt-4 print:hidden">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
            Bienvenido, Ing. Jhon Jairo Villalobos
          </h1>
          <p className="text-gray-400 text-sm mt-2 flex items-center justify-between gap-2 w-full pr-4">
            <span>Ingeniería Ambiental y de Saneamiento</span>
            <span className="bg-gray-800 px-3 py-1 rounded-full text-[10px] font-mono text-blue-400 border border-blue-900 shadow-inner flex items-center gap-1">
              {estadoSincronizacion}
            </span>
          </p>
        </header>

        <div className="mb-8 relative print:hidden">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-500" />
          </div>
          <input 
            type="text" 
            placeholder="Buscar conceptos, fórmulas o temas en todos los cuadernos..." 
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-green-500 transition-colors shadow-inner"
          />
        </div>

        {terminoBusqueda.trim() !== '' ? (
          <div className="space-y-4 mb-8">
            <h3 className="text-green-500 font-bold mb-4">Resultados en tus apuntes:</h3>
            {resultadosBusqueda.length === 0 ? (
              <p className="text-gray-500">No hay registros de "{terminoBusqueda}" en tu carrera aún.</p>
            ) : (
              resultadosBusqueda.map((res, idx) => (
                <div key={idx} className="bg-gray-900 p-4 rounded-xl border-l-4 border-green-500 cursor-pointer hover:bg-gray-800" onClick={() => { setMateriaSeleccionada(res.materia); setPantallaActual('cuaderno'); setTerminoBusqueda(''); }}>
                  <span className="text-xs text-green-400 font-bold uppercase block mb-2">{res.materia} • {res.apunte.fecha}</span>
                  <p className="text-sm text-gray-300 border-l-2 border-gray-700 pl-3 italic">"...{res.apunte.texto}..."</p>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 mt-6 print:hidden">
              <h2 className="text-lg font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                Malla Curricular
              </h2>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar print:hidden">
              {numerosRomanos.map((romano, idx) => {
                const numeroSemestre = idx + 1;
                const estaCursandoEste = numeroSemestre === semestreCursando;
                const estaSeleccionado = numeroSemestre === (semestreSeleccionado || semestreCursando);

                return (
                  <button 
                    key={romano}
                    onClick={() => setSemestreSeleccionado(numeroSemestre)}
                    className={`min-w-[4rem] flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md flex flex-col items-center justify-center gap-1 ${estaSeleccionado ? 'bg-gray-800 text-white ring-2 ring-gray-600' : 'bg-gray-900 text-gray-500 hover:bg-gray-800'} ${estaCursandoEste && !estaSeleccionado ? 'border-b-2 border-green-500' : ''}`}
                  >
                    <span>{romano}</span>
                    {estaCursandoEste && (
                      <span className="text-[9px] font-black uppercase text-green-500 tracking-widest bg-green-950 px-2 py-0.5 rounded-full">
                        Cursando
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 print:grid-cols-1">
              {materias.filter(m => m.semestre === (semestreSeleccionado || semestreCursando)).map((materia, index) => {
                const IconComponent = IconosDisponibles[materia.icon] || BookOpen;
                const colorData = ColoresDisponibles.find(c => c.id === materia.color) || ColoresDisponibles[3];

                return (
                  <div key={index} className={`bg-gray-900 p-1 rounded-2xl border-l-4 ${colorData.border} shadow-lg flex flex-col transition-all`}>
                    <div className="flex justify-between items-start p-4 pb-0">
                      <div className={`p-3 rounded-lg ${colorData.bg} bg-opacity-20`}>
                        <IconComponent size={24} className={colorData.text} />
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); abrirModalEditar(materia); }}
                        className="p-2 text-gray-500 hover:text-gray-200 hover:bg-gray-700 rounded-full transition"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>
                    <button 
                      onClick={() => { 
                        setMateriaSeleccionada(materia.nombre); 
                        setSemestreCursando(materia.semestre); 
                        setPantallaActual('cuaderno'); 
                      }}
                      className="text-left p-4 pt-3 flex-1 active:scale-95 transition-transform"
                    >
                      <h2 className="text-lg font-bold text-gray-100">{materia.nombre}</h2>
                      <p className="text-xs text-gray-500 mt-1">Toca para abrir el cuaderno</p>
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
        
        <button 
          onClick={abrirModalNueva}
          className="fixed bottom-8 right-8 z-10 bg-green-600 h-16 w-16 rounded-full shadow-[0_0_25px_rgba(22,163,74,0.5)] flex items-center justify-center hover:bg-green-500 active:scale-90 transition-all"
        >
          <Plus size={32} color="white" />
        </button>

        {modalAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editandoId !== null ? 'Editar Materia' : 'Nueva Materia'}</h3>
                <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-white p-2">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nombre de la asignatura</label>
                  <input 
                    type="text" 
                    value={formMateria.nombre}
                    onChange={(e) => setFormMateria({...formMateria, nombre: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Icono representativo</label>
                  <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-950 rounded-xl border border-gray-800">
                    {Object.keys(IconosDisponibles).map(iconName => {
                      const Icono = IconosDisponibles[iconName];
                      return (
                        <button
                          key={iconName}
                          onClick={() => setFormMateria({...formMateria, icon: iconName})}
                          className={`p-3 rounded-xl flex justify-center items-center transition-all ${formMateria.icon === iconName ? 'bg-gray-700 shadow-inner scale-110 border border-gray-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          <Icono size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Color del cuaderno</label>
                  <div className="flex flex-wrap gap-4">
                    {ColoresDisponibles.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setFormMateria({...formMateria, color: color.id})}
                        className={`w-10 h-10 rounded-full ${color.bg} transition-all ${formMateria.color === color.id ? 'ring-4 ring-gray-400 ring-offset-4 ring-offset-gray-900 scale-110' : 'opacity-40 hover:opacity-100'}`}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                {editandoId !== null && (
                  <button 
                    onClick={eliminarMateria}
                    className="p-4 bg-red-950 text-red-500 hover:bg-red-900 rounded-xl transition"
                  >
                    <Trash2 size={24} />
                  </button>
                )}
                <button 
                  onClick={guardarMateria}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition active:scale-95"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (pantallaActual === 'cuaderno') {
    const apuntesDeEstaMateria = apuntes[materiaSeleccionada] || [];
    const tareasDeEstaMateria = tareas[materiaSeleccionada] || [];

    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col print:bg-white print:text-black">
        <header className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-950 sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setPantallaActual('semestres')} 
              className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
            >
              <ArrowLeft size={20} className="text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-100">{materiaSeleccionada}</h1>
              <p className="text-xs text-blue-400 font-mono">{estadoSincronizacion}</p>
            </div>
          </div>
          
          <button 
            onClick={() => window.print()}
            className="p-2 bg-blue-900 bg-opacity-30 text-blue-400 border border-blue-800 rounded-xl hover:bg-blue-800 hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
          >
            <Download size={16} /> PDF
          </button>
        </header>

        <div className="hidden print:block p-6 border-b border-gray-300 mb-6">
          <h1 className="text-3xl font-bold text-black">{materiaSeleccionada}</h1>
          <p className="text-gray-600">Apuntes de Ingeniería Ambiental y de Saneamiento - Ing. Jhon Jairo Villalobos</p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto pb-32">
          {tareasDeEstaMateria.length > 0 && (
            <div className="mb-10 bg-red-950 bg-opacity-20 border border-red-900 rounded-2xl p-5 shadow-lg print:border-red-500">
              <h3 className="text-red-500 font-bold flex items-center gap-2 mb-4">
                <AlertTriangle size={20} /> Tareas Detectadas por la IA
              </h3>
              <div className="space-y-3">
                {tareasDeEstaMateria.map(tarea => (
                  <div key={tarea.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${tarea.completada ? 'bg-gray-900 opacity-50 line-through text-gray-500 print:hidden' : 'bg-gray-900 bg-opacity-60 text-gray-200 print:text-black'}`}>
                    <button onClick={() => marcarTareaCompletada(materiaSeleccionada, tarea.id)} className={`mt-0.5 print:hidden ${tarea.completada ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}>
                      <CheckCircle2 size={18} />
                    </button>
                    <div className="flex-1 text-sm">
                      <span className="text-[10px] text-red-400 font-bold uppercase block mb-1">Anclado el {tarea.fecha}</span>
                      {tarea.texto}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-l-2 border-gray-800 pl-6 ml-2 space-y-10 relative print:border-gray-300">
            {apuntesDeEstaMateria.length === 0 ? (
              <div className="border-2 border-dashed border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-center mt-10">
                 <BookOpen size={48} className="text-gray-700 mb-4" />
                 <p className="text-gray-500 text-sm">El cuaderno de {materiaSeleccionada} está vacío.<br/>Inicia la clase para que la IA comience a tomar apuntes.</p>
              </div>
            ) : (
              apuntesDeEstaMateria.map((apunte) => (
                <div key={apunte.id} className="relative">
                  <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-4 border-gray-950 bg-green-500"></span>
                  <span className="text-xs font-bold text-green-500 uppercase tracking-wider">{apunte.fecha}</span>
                  <p className="mt-3 text-gray-300 leading-relaxed text-sm">
                    {apunte.texto}
                  </p>
                  
                  {apunte.formula && (
                    <div className="mt-4 bg-gray-900 border border-gray-700 p-4 rounded-xl flex flex-col gap-2 shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Camera size={12} /> Fórmula extraída de la pizarra
                      </span>
                      <div className="font-mono text-blue-300 overflow-x-auto py-2 text-center text-sm">
                        {apunte.formula}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-gray-950 via-gray-950 to-transparent print:hidden">
          <button 
            onClick={() => setPantallaActual('grabacion')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
          >
            <Mic size={24} />
            Iniciar Clase de Hoy
          </button>
        </div>
      </div>
    );
  }

  if (pantallaActual === 'grabacion') {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col justify-between">
        <header className="flex justify-between items-center bg-gray-900 p-4 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-red-500 tracking-wider">Grabando</h1>
              <span className="text-[10px] text-gray-400">{materiaSeleccionada}</span>
            </div>
          </div>
          <button 
            onClick={finalizarYGuardarClase} 
            className="p-3 bg-green-900 border border-green-700 rounded-xl hover:bg-green-800 text-green-400 font-bold text-xs flex gap-2 items-center transition-all shadow-[0_0_15px_rgba(22,163,74,0.3)]"
          >
            <StopCircle size={16} /> Finalizar & Guardar
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="h-32 w-32 rounded-full border-4 border-gray-800 flex items-center justify-center relative">
             <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse opacity-20"></div>
             <Mic size={48} className="text-blue-500" />
          </div>
          <p className="text-gray-400 text-sm font-medium px-8">
            Motor de IA activo.<br/>Escuchando y separando la voz del profesor...
          </p>

          {mensajeCamara && (
            <div className="bg-gray-900 border border-blue-500 text-blue-400 p-4 rounded-xl text-sm animate-bounce mt-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              {mensajeCamara}
            </div>
          )}
        </div>

        <div className="w-full max-w-md mx-auto mb-6 px-4 z-20">
          <div className="bg-gray-900 border border-purple-900 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3 text-purple-400 font-bold text-xs uppercase tracking-widest">
              <HelpCircle size={14} /> Asistente en vivo (Glosario)
            </div>
            
            {respuestaIA && (
              <div className="mb-4 p-3 bg-purple-950 bg-opacity-40 border border-purple-800 rounded-xl text-sm text-purple-200">
                {respuestaIA}
              </div>
            )}

            <form onSubmit={consultarConceptoIA} className="flex gap-2">
              <input 
                type="text" 
                value={consultaRapida}
                onChange={(e) => setConsultaRapida(e.target.value)}
                placeholder="Ej. ¿Qué es una piedra ígnea?" 
                className="flex-1 bg-gray-950 border border-gray-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
              />
              <button 
                type="submit" 
                disabled={cargandoIA || !consultaRapida.trim()}
                className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-500 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                {cargandoIA ? <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>

        <div className="pb-10 flex justify-center">
          <button 
            className={`bg-gray-900 px-8 py-6 rounded-full border-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center gap-2 active:scale-90 transition-all ${fotoTomada ? 'border-blue-500 text-blue-400' : 'border-gray-700 hover:border-blue-500 hover:text-blue-400'}`}
            onClick={() => {
              setMensajeCamara("📸 Cámara activada: Extrayendo fórmula y enviando a la IA...");
              setFotoTomada(true);
            }}
          >
            <Camera size={36} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {fotoTomada ? 'Fórmula Capturada' : 'Extraer Ecuación'}
            </span>
          </button>
        </div>
      </div>
    );
  }
}