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

    console.log("📊 JSON LISTO PARA POWER AUTOMATE (APROBACIÓN):", JSON.stringify(payload, null, 2));
    alert("✅ Reporte enviado para APROBACIÓN\n\nRevísalo en la consola.\n\nTotal Recepción: " + totalRecepcion.toFixed(0) + " Bbl");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 p-4 md:p-8 font-sans text-slate-800 pb-32">
      
      {/* CABECERA */}
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
              value={tecnicoResponsable} 
              onChange={(e) => setTecnicoResponsable(e.target.value)} 
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

        {/* 1. RECEPCIÓN DE FLUIDOS */}
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
              <div className="text-3xl font-black text-green-800">{totalRecepcion.toFixed(0)} <span className="text-base font-semibold">Bbl</span></div>
            </div>
          </div>
          {recepciones.map((fila, idx) => (
            <div key={fila.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 bg-gradient-to-r from-gray-50 to-green-50 p-5 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:shadow-md transition-all">
              <div className="md:col-span-1 flex items-center">
                <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">Procedencia</label>
                <select className="w-full p-2 border rounded text-sm bg-white" value={fila.procedencia} onChange={e => actualizarFila(fila.id, 'procedencia', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {PROCEDENCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 mb-1">Locación</label>
                <select className="w-full p-2 border rounded text-sm bg-white" value={fila.locacion} onChange={e => actualizarFila(fila.id, 'locacion', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {LOCACIONES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">Transportista</label>
                <input type="text" className="w-full p-2 border rounded text-sm" value={fila.transportista} onChange={e => actualizarFila(fila.id, 'transportista', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">Placa</label>
                <input type="text" placeholder="AAA-1234" className="w-full p-2 border rounded text-sm uppercase" value={fila.placa} onChange={e => actualizarFila(fila.id, 'placa', e.target.value)} />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-500 mb-1">Vol (Bbl)</label>
                <input type="number" min="0" step="1" placeholder="0" className="w-full p-2 border rounded text-sm font-mono font-bold text-right text-blue-700" value={fila.volumen} onChange={e => actualizarFila(fila.id, 'volumen', e.target.value)} />
              </div>
              <div className="md:col-span-1 flex items-end pb-1">
                <button onClick={() => eliminarFila(fila.id)} className="text-red-500 font-bold hover:text-red-700 text-xl">×</button>
              </div>
            </div>
          ))}
          <button onClick={agregarFila} className="flex items-center gap-2 bg-green-600 text-white font-bold hover:bg-green-700 px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
            <span className="text-xl">+</span> Agregar Otro Viaje
          </button>
        </section>

        {/* DECISIÓN: TRATAMIENTO QUÍMICO */}
        <div className="bg-white p-6 rounded-2xl shadow-lg flex justify-between items-center border-l-4 border-blue-600">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
              Tratamiento Químico
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-10">¿Se realizó dosificación de químicos hoy?</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setHuboTratamiento(false)} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${!huboTratamiento ? 'bg-gray-800 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>NO</button>
            <button onClick={() => setHuboTratamiento(true)} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${huboTratamiento ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>SÍ</button>
          </div>
        </div>

        {/* SECCIÓN 2: QUÍMICOS (CONDICIONAL) */}
        {huboTratamiento && (
          <section className="bg-blue-50 p-8 rounded-2xl border-2 border-blue-200 animate-fade-in">
            <p className="text-sm text-blue-800 font-semibold mb-4">📦 Control de Stock e Inventario</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['cal', 'sulfato', 'lipesa'].map((prod) => {
                const stockFinal = getStockFinal(prod);
                const critico = esStockCritico(prod);
                return (
                  <div key={prod} className={`bg-white p-6 rounded-xl border-t-4 ${critico ? 'border-red-500 shadow-lg' : 'border-green-500'} shadow-md`}>
                    <h3 className="font-black text-gray-800 uppercase mb-4 text-lg">{prod}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 font-bold">Stock Inicial</label>
                        <input type="number" className="w-full border-2 p-2 rounded-lg mt-1" value={quimicos[prod].inicial || ''} onChange={(e) => handleQuimico(prod, 'inicial', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-bold">Consumo (Sacos)</label>
                        <input type="number" className="w-full border-2 p-2 rounded-lg mt-1 font-bold" value={quimicos[prod].consumo || ''} onChange={(e) => handleQuimico(prod, 'consumo', e.target.value)} />
                      </div>
                      <div className={`mt-3 p-3 rounded-lg text-center text-base font-black ${critico ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        Stock Final: {stockFinal}
                        {critico && <div className="text-xs uppercase mt-1 flex items-center justify-center gap-1"><span>⚠️</span> Stock Crítico</div>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 3. NIVELES DE PISCINAS */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-amber-600">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <span className="bg-amber-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
              Niveles de Piscinas
            </h2>
            <p className="text-sm text-gray-500 mt-1 ml-10">Monitoreo de capacidad operativa (0% - 95%)</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.keys(piscinas).map((piscina) => {
              const critico = piscinas[piscina] > 90;
              return (
                <div key={piscina}>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{piscina}</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      max="95"
                      step="1"
                      className={`w-full p-4 border-2 rounded-xl font-mono text-2xl font-black text-center focus:outline-none focus:ring-2 ${critico ? 'border-red-500 ring-red-200 text-red-600 bg-red-50' : 'border-gray-300 ring-amber-100 text-gray-700'}`}
                      value={piscinas[piscina]}
                      onChange={(e) => setPiscinas({...piscinas, [piscina]: e.target.value})}
                    />
                    <span className="absolute right-4 top-4 text-gray-400 text-lg font-bold">%</span>
                  </div>
                  {critico && <p className="text-xs text-red-600 font-bold mt-2 text-center">⚠️ Nivel Alto</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* DECISIÓN: RECUPERACIÓN */}
        <div className="bg-white p-6 rounded-2xl shadow-lg flex justify-between items-center border-l-4 border-purple-600">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <span className="bg-purple-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">4</span>
              Recuperación de Crudo
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-10">¿Se realizó evacuación de crudo recuperado?</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setHuboRecuperacion(false)} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${!huboRecuperacion ? 'bg-gray-800 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>NO</button>
            <button onClick={() => setHuboRecuperacion(true)} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${huboRecuperacion ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>SÍ</button>
          </div>
        </div>

        {/* SECCIÓN 4: RECUPERACIÓN (CONDICIONAL) */}
        {huboRecuperacion && (
          <section className="bg-purple-50 p-8 rounded-2xl border-2 border-purple-200 animate-fade-in">
            <label className="block text-base font-black text-purple-900 mb-3">Cantidad de Crudo Evacuado (BBL)</label>
            <input 
              type="number" 
              className="w-full md:w-1/2 p-4 border-2 border-purple-300 rounded-xl text-3xl font-black text-purple-800 placeholder-purple-300 focus:ring-2 focus:ring-purple-500 outline-none" 
              placeholder="0"
              value={crudoEvacuado}
              onChange={(e) => setCrudoEvacuado(e.target.value)}
            />
          </section>
        )}

        {/* 5. EVACUACIÓN AGUA */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-cyan-600">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <span className="bg-cyan-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">5</span>
              Evacuación Agua Tratada
            </h2>
            <p className="text-sm text-gray-500 mt-1 ml-10">Control de disposición final de agua</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Nivel Pit 2 (Control) %</label>
              <input type="number" min="0" max="95" className="w-full p-3 border-2 rounded-lg" value={evacuacion.nivelPit2Control} onChange={(e) => setEvacuacion({...evacuacion, nivelPit2Control: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Agua Evacuada (BBL)</label>
              <input type="number" className="w-full p-3 border-2 rounded-lg" value={evacuacion.aguaEvacuada} onChange={(e) => setEvacuacion({...evacuacion, aguaEvacuada: e.target.value})} />
            </div>
            
            {/* Biocida Toggle */}
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border-2 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-700">¿Uso de Biocida?</span>
                <div className="flex gap-2">
                    <button onClick={() => setEvacuacion({...evacuacion, usoBiocida: false, biocidaCantidad: ''})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!evacuacion.usoBiocida ? 'bg-gray-700 text-white shadow-md' : 'bg-gray-200'}`}>NO</button>
                    <button onClick={() => setEvacuacion({...evacuacion, usoBiocida: true})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${evacuacion.usoBiocida ? 'bg-green-600 text-white shadow-md' : 'bg-gray-200'}`}>SÍ</button>
                </div>
              </div>
              {evacuacion.usoBiocida && (
                 <input 
                    type="number" 
                    placeholder="Cantidad (Galones)" 
                    className="w-full p-3 border-2 border-green-300 rounded-lg bg-white font-bold animate-fade-in"
                    value={evacuacion.biocidaCantidad} 
                    onChange={(e) => setEvacuacion({...evacuacion, biocidaCantidad: e.target.value})}
                 />
              )}
            </div>

            <div>
               <label className="text-sm font-bold text-gray-700 block mb-2">Total Viajes</label>
               <input type="number" min="0" className="w-full p-3 border-2 rounded-lg" value={evacuacion.totalViajes} onChange={(e) => setEvacuacion({...evacuacion, totalViajes: e.target.value})} />
            </div>
          </div>
        </section>

        {/* BOTÓN ENVIAR PARA APROBACIÓN */}
        <button onClick={handleSubmit} className="w-full bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white font-black py-5 rounded-2xl shadow-2xl hover:shadow-green-500/50 transform hover:-translate-y-2 hover:scale-105 transition-all text-xl border-2 border-green-900 flex items-center justify-center gap-3">
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          ENVIAR REPORTE PARA APROBACIÓN
        </button>

      </main>
    </div>
  )
}

export default App
