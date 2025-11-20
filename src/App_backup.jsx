import { useState } from 'react'
import { PROCEDENCIAS, LOCACIONES, TRANSPORTISTAS } from './data/constants'

function App() {
  // --- ESTADOS GLOBALES ---
  const [fechaReporte, setFechaReporte] = useState(new Date().toISOString().split('T')[0]);
  const [tecnicoResponsable, setTecnicoResponsable] = useState('');
  
  // Toggle Switches (Interruptores de Lógica)
  const [huboTratamiento, setHuboTratamiento] = useState(false);
  const [huboRecuperacion, setHuboRecuperacion] = useState(false);

  // 1. RECEPCIÓN DE FLUIDOS
  const [recepciones, setRecepciones] = useState([
    { id: 1, procedencia: '', locacion: '', transportista: 'ATLAS', placa: '', volumen: '' }
  ]);

  // 2. QUÍMICOS (Ahora con cálculo de stock)
  const [quimicos, setQuimicos] = useState({
    cal: { inicial: 0, consumo: 0 },
    sulfato: { inicial: 0, consumo: 0 },
    lipesa: { inicial: 0, consumo: 0 }
  });

  // 3. PISCINAS
  const [piscinas, setPiscinas] = useState({
    pit1: '', pit2: '', ranfla: '', api: '', filtro1: '', filtro2: ''
  });

  // 4. RECUPERACIÓN
  const [crudoEvacuado, setCrudoEvacuado] = useState('');

  // 5. EVACUACIÓN AGUA
  const [evacuacion, setEvacuacion] = useState({
    nivelPit2Control: '',
    usoBiocida: false,
    biocidaCantidad: '',
    aguaEvacuada: '',
    totalViajes: ''
  });

  // --- LÓGICA Y CALCULOS ---

  // Funciones de Tabla Recepción
  const agregarFila = () => {
    setRecepciones([...recepciones, { id: Date.now(), procedencia: '', locacion: '', transportista: 'ATLAS', placa: '', volumen: '' }]);
  };
  const eliminarFila = (id) => recepciones.length > 1 && setRecepciones(recepciones.filter(f => f.id !== id));
  const actualizarFila = (id, campo, valor) => {
    setRecepciones(recepciones.map(f => f.id === id ? { ...f, [campo]: valor } : f));
  };
  const totalRecepcion = recepciones.reduce((acc, curr) => acc + (parseFloat(curr.volumen) || 0), 0);

  // Actualizar Químicos
  const handleQuimico = (producto, campo, valor) => {
    setQuimicos({
      ...quimicos,
      [producto]: { ...quimicos[producto], [campo]: parseFloat(valor) || 0 }
    });
  };

  // Helper para alerta de stock
  const getStockFinal = (producto) => quimicos[producto].inicial - quimicos[producto].consumo;
  const esStockCritico = (producto) => getStockFinal(producto) <= 15;

  // --- PREPARACIÓN DEL ENVÍO ---
  const handleSubmit = () => {
    // Validación
    if (!tecnicoResponsable) {
      alert("Por favor, selecciona el Técnico de Aguas Responsable");
      return;
    }

    // Limpieza de datos: Si no hubo tratamiento, mandamos ceros
    const datosQuimicosFinal = huboTratamiento ? {
      cal: { inicial: quimicos.cal.inicial, consumo: quimicos.cal.consumo, saldo: getStockFinal('cal') },
      sulfato: { inicial: quimicos.sulfato.inicial, consumo: quimicos.sulfato.consumo, saldo: getStockFinal('sulfato') },
      lipesa: { inicial: quimicos.lipesa.inicial, consumo: quimicos.lipesa.consumo, saldo: getStockFinal('lipesa') }
    } : { 
      cal: { inicial: 0, consumo: 0, saldo: 0 }, 
      sulfato: { inicial: 0, consumo: 0, saldo: 0 }, 
      lipesa: { inicial: 0, consumo: 0, saldo: 0 } 
    };

    const datosRecuperacionFinal = huboRecuperacion ? parseFloat(crudoEvacuado) || 0 : 0;

    const payload = {
      meta: { 
        fecha: fechaReporte, 
        tecnicoResponsable: tecnicoResponsable,
        totalRecepcion: totalRecepcion
      },
      recepcion: recepciones.map(r => ({
        procedencia: r.procedencia,
        locacion: r.locacion,
        transportista: r.transportista,
        placa: r.placa.toUpperCase(),
        volumen: parseInt(r.volumen) || 0
      })),
      config: { 
        huboTratamiento, 
        huboRecuperacion 
      },
      quimicos: datosQuimicosFinal,
      piscinas: {
        pit1: parseInt(piscinas.pit1) || 0,
        pit2: parseInt(piscinas.pit2) || 0,
        ranfla: parseInt(piscinas.ranfla) || 0,
        api: parseInt(piscinas.api) || 0,
        filtro1: parseInt(piscinas.filtro1) || 0,
        filtro2: parseInt(piscinas.filtro2) || 0
      },
      recuperacionCrudo: { 
        crudoEvacuado: datosRecuperacionFinal 
      },
      evacuacion: {
        nivelPit2Control: parseInt(evacuacion.nivelPit2Control) || 0,
        usoBiocida: evacuacion.usoBiocida,
        biocidaCantidad: evacuacion.usoBiocida ? parseFloat(evacuacion.biocidaCantidad) || 0 : 0,
        aguaEvacuada: parseFloat(evacuacion.aguaEvacuada) || 0,
        totalViajes: parseInt(evacuacion.totalViajes) || 0
      }
    };

    console.log("📊 JSON LISTO PARA POWER AUTOMATE:", JSON.stringify(payload, null, 2));
    alert("✅ Reporte enviado para APROBACIÓN\n\nRevisalo en la consola.\n\nTotal Recepción: " + totalRecepcion.toFixed(0) + " Bbl");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 p-4 md:p-8 font-sans text-slate-800">
      <header className="max-w-6xl mx-auto mb-8 bg-white p-8 rounded-2xl shadow-xl border-t-4 border-green-600">
        <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-xl shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-.96-7-5.42-7-10V8.3l7-3.5 7 3.5V10c0 4.58-3.14 9.04-7 10zm-1-9h2v6h-2zm0-4h2v2h-2z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">GPower Group</h1>
              <p className="text-sm font-semibold text-green-700">Sistema de Reporte Diario de Aguas</p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-xs text-gray-500 font-medium">SUPERVISIÓN OPERACIONAL</p>
            <p className="text-sm font-bold text-gray-800">Bloques 14 y 17</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-6 font-medium">Ingrese la información operativa del día para generar el reporte consolidado</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">📅 Fecha del Reporte</label>
            <input 
              type="date" 
              value={fechaReporte} 
              onChange={(e) => setFechaReporte(e.target.value)} 
              className="border-2 border-gray-300 p-3 rounded-lg font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-green-400"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">👤 Tec. Aguas Responsable</label>
            <select 
              value={usuario} 
              onChange={(e) => setUsuario(e.target.value)} 
              className="border-2 border-gray-300 p-3 rounded-lg font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-green-400"
            >
              <option value="">Seleccionar técnico...</option>
              <option value="Jaime Aguinda">Jaime Aguinda</option>
              <option value="Juan Zapata">Juan Zapata</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        {/* SECCIÓN 1: Recepción de Fluidos */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-green-600">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <span className="bg-green-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
                Recepción de Fluidos
              </h2>
              <p className="text-sm text-gray-500 mt-1 ml-10">Registro de viajes recibidos en planta</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 px-6 py-3 rounded-xl border-2 border-green-200 shadow-md">
              <span className="text-xs text-green-700 font-bold uppercase tracking-wider block">Total Recibido</span>
              <div className="text-3xl font-black text-green-800">{totalVolumen.toFixed(0)} <span className="text-base font-semibold">Bbl</span></div>
            </div>
          </div>

          <div className="space-y-4">
            {recepciones.map((fila) => (
              <div key={fila.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-5 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:shadow-md transition-all">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Procedencia</label>
                  <select className="w-full p-2 border rounded text-sm bg-white" value={fila.procedencia} onChange={(e) => actualizarFila(fila.id, 'procedencia', e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {PROCEDENCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Locación</label>
                  <select className="w-full p-2 border rounded text-sm bg-white" value={fila.locacion} onChange={(e) => actualizarFila(fila.id, 'locacion', e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {LOCACIONES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Transportista</label>
                  <input type="text" className="w-full p-2 border rounded text-sm" value={fila.transportista} onChange={(e) => actualizarFila(fila.id, 'transportista', e.target.value)}/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Placa</label>
                  <input type="text" placeholder="AAA-1234" className="w-full p-2 border rounded text-sm uppercase" value={fila.placa} onChange={(e) => actualizarFila(fila.id, 'placa', e.target.value)}/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Volumen (Bbl)</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="1" 
                    placeholder="0" 
                    className="w-full p-2 border rounded text-sm font-mono font-bold text-right text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={fila.volumen} 
                    onChange={(e) => actualizarFila(fila.id, 'volumen', e.target.value)}
                  />
                </div>
                <div className="md:col-span-1 flex justify-center pb-1">
                  <button onClick={() => eliminarFila(fila.id)} className="text-red-400 hover:text-red-600 p-2" title="Eliminar fila">🗑️</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button onClick={agregarFila} className="flex items-center gap-2 bg-green-600 text-white font-bold hover:bg-green-700 px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
              <span className="text-xl">+</span> Agregar Otro Viaje
            </button>
          </div>
        </section>

        {/* SECCIÓN 2: Inventario de Químicos */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-blue-600">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
              Inventario de Químicos
            </h2>
            <p className="text-sm text-gray-500 mt-1 ml-10">Consumo de productos químicos del día</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Cal (Sacos)</label>
              <input 
                type="number" 
                min="0" 
                placeholder="0" 
                value={quimicos.cal} 
                onChange={(e) => actualizarQuimico('cal', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-lg font-mono text-right focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Sulfato de Aluminio (Sacos)</label>
              <input 
                type="number" 
                min="0" 
                placeholder="0" 
                value={quimicos.sulfato} 
                onChange={(e) => actualizarQuimico('sulfato', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-lg font-mono text-right focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Lipesa (Sacos)</label>
              <input 
                type="number" 
                min="0" 
                placeholder="0" 
                value={quimicos.lipesa} 
                onChange={(e) => actualizarQuimico('lipesa', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-lg font-mono text-right focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: Niveles de Piscinas */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-amber-600">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <span className="bg-amber-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
              Niveles de Piscinas (Estado)
            </h2>
            <p className="text-sm text-gray-500 mt-1 ml-10">Monitoreo de capacidad operativa</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries({
              pit1: 'Pit 1',
              pit2: 'Pit 2',
              ranfla: 'Ranfla',
              api: 'API',
              filtro1: 'Filtro 1',
              filtro2: 'Filtro 2'
            }).map(([key, label]) => {
              const esCritico = validarNivelCritico(piscinas[key]);
              return (
                <div key={key}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{label} (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="95" 
                    step="1"
                    placeholder="0" 
                    value={piscinas[key]} 
                    onChange={(e) => actualizarPiscina(key, e.target.value)}
                    className={`w-full p-3 border rounded-lg text-lg font-mono text-right focus:ring-2 outline-none ${
                      esCritico 
                        ? 'border-red-500 bg-red-50 text-red-700 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {esCritico && (
                    <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                      ⚠️ Nivel Crítico
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECCIÓN 4: Recuperación de Crudo */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-purple-600">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <span className="bg-purple-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">4</span>
              Recuperación de Crudo
            </h2>
            <p className="text-sm text-gray-500 mt-1 ml-10">Volumen de crudo recuperado</p>
          </div>
          <div className="max-w-md">
            <label className="block text-sm font-bold text-gray-700 mb-2">Crudo Evacuado (BBL)</label>
            <input 
              type="number" 
              min="0" 
              step="0.001"
              placeholder="0.000" 
              value={crudoEvacuado} 
              onChange={(e) => setCrudoEvacuado(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-lg font-mono text-right focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </section>

        {/* SECCIÓN 5: Evacuación de Agua Tratada */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-cyan-600">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <span className="bg-cyan-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">5</span>
              Evacuación de Agua Tratada
            </h2>
            <p className="text-sm text-gray-500 mt-1 ml-10">Control de disposición final de agua</p>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nivel Pit 2 (Control) (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.1"
                  placeholder="0.0" 
                  value={evacuacion.nivelPit2} 
                  onChange={(e) => actualizarEvacuacion('nivelPit2', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-lg font-mono text-right focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Uso de Biocida</label>
                <div className="flex gap-4 items-center h-12">
                  <button
                    onClick={() => actualizarEvacuacion('usaBiocida', true)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all transform ${
                      evacuacion.usaBiocida
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:scale-102'
                    }`}
                  >
                    ✓ Sí
                  </button>
                  <button
                    onClick={() => actualizarEvacuacion('usaBiocida', false)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all transform ${
                      !evacuacion.usaBiocida
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg scale-105'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:scale-102'
                    }`}
                  >
                    ✗ No
                  </button>
                </div>
              </div>
            </div>

            {/* Campo condicional de Biocida */}
            {evacuacion.usaBiocida && (
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200 animate-fade-in">
                <label className="block text-sm font-bold text-green-800 mb-2">Cantidad de Biocida (Galones) *</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.1"
                  placeholder="0.0" 
                  value={evacuacion.biocidaCantidad} 
                  onChange={(e) => actualizarEvacuacion('biocidaCantidad', e.target.value)}
                  className="w-full md:w-1/2 p-3 border border-green-300 rounded-lg text-lg font-mono text-right focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Agua Evacuada (BBL)</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.001"
                  placeholder="0.000" 
                  value={evacuacion.aguaEvacuada} 
                  onChange={(e) => actualizarEvacuacion('aguaEvacuada', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-lg font-mono text-right focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Total Viajes</label>
                <input 
                  type="number" 
                  min="0" 
                  step="1"
                  placeholder="0" 
                  value={evacuacion.totalViajes} 
                  onChange={(e) => actualizarEvacuacion('totalViajes', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-lg font-mono text-right focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Botón de Envío */}
        <div className="flex justify-center pt-8 pb-20">
          <button 
            onClick={handleSubmit} 
            className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl hover:shadow-green-500/50 transform hover:-translate-y-2 hover:scale-105 transition-all w-full md:w-auto flex items-center justify-center gap-3 border-2 border-green-900"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            GENERAR REPORTE OFICIAL
          </button>
        </div>
      </main>
    </div>
  )
}

export default App
