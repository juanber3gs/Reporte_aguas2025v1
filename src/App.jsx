import { useState } from 'react'
import { PROCEDENCIAS, LOCACIONES_ALFABETICAS, TRANSPORTISTAS } from './data/constants'

function App() {
  // --- ESTADOS GLOBALES ---
  const [fechaReporte, setFechaReporte] = useState(new Date().toISOString().split('T')[0]);
  const [tecnicoResponsable, setTecnicoResponsable] = useState('');
  
  // Toggle Switches (Interruptores de Lógica)
  const [huboTratamiento, setHuboTratamiento] = useState(false);
  const [huboRecuperacion, setHuboRecuperacion] = useState(false);
  const [huboRecepcion, setHuboRecepcion] = useState(true); // nueva decisión para recepción de fluidos
  const [huboEvacuacion, setHuboEvacuacion] = useState(true); // decisión para evacuación agua tratada
  // Modal de resumen previo al envío
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [payloadPreview, setPayloadPreview] = useState(null);
  const [mensajeGracias, setMensajeGracias] = useState(false);

  // 1. RECEPCIÓN DE FLUIDOS
  const [recepciones, setRecepciones] = useState([
    { id: 1, procedencia: '', locacion: '', transportista: 'ATLAS', placa: '', volumen: '' }
  ]);

  // 2. QUÍMICOS (Ahora con cálculo de stock)
  const [quimicos, setQuimicos] = useState({
    cal: { inicial: 30, consumo: 0 },
    sulfato: { inicial: 30, consumo: 0 },
    lipesa: { inicial: 30, consumo: 0 }
  });
  // Biocida externo en tratamiento químico
  const [biocidaTratamiento, setBiocidaTratamiento] = useState({
    usado: false,
    cantidad: ''
  });
  const [biocidaTratamientoCustom, setBiocidaTratamientoCustom] = useState(false);

  // 3. PISCINAS
  const [piscinas, setPiscinas] = useState({
    pit1: '', pit2: '', ranfla: '', api: '', filtro1: '', filtro2: ''
  });

  // 4. RECUPERACIÓN
  const [crudoEvacuado, setCrudoEvacuado] = useState('');

  // 5. EVACUACIÓN AGUA
  const [evacuacion, setEvacuacion] = useState({
    usoBiocida: false,
    biocidaCantidad: '',
    aguaEvacuada: '',
    totalViajes: ''
  });
  // Modo personalizado para biocida ("Otro")
  const [biocidaCustom, setBiocidaCustom] = useState(false);

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
  const totalRecepcionDecidido = huboRecepcion ? totalRecepcion : 0;

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
  const construirPayload = () => {
    const datosQuimicosFinal = huboTratamiento ? {
      cal: { inicial: quimicos.cal.inicial, consumo: quimicos.cal.consumo, saldo: getStockFinal('cal') },
      sulfato: { inicial: quimicos.sulfato.inicial, consumo: quimicos.sulfato.consumo, saldo: getStockFinal('sulfato') },
      lipesa: { inicial: quimicos.lipesa.inicial, consumo: quimicos.lipesa.consumo, saldo: getStockFinal('lipesa') },
      biocida: { usado: biocidaTratamiento.usado, cantidad: biocidaTratamiento.usado ? parseFloat(biocidaTratamiento.cantidad) || 0 : 0 }
    } : { 
      cal: { inicial: 0, consumo: 0, saldo: 0 }, 
      sulfato: { inicial: 0, consumo: 0, saldo: 0 }, 
      lipesa: { inicial: 0, consumo: 0, saldo: 0 },
      biocida: { usado: false, cantidad: 0 }
    };

    const datosRecuperacionFinal = huboRecuperacion ? parseFloat(crudoEvacuado) || 0 : 0;

    return {
      meta: { 
        fecha: fechaReporte, 
        tecnicoResponsable: tecnicoResponsable,
        totalRecepcion: totalRecepcionDecidido
      },
      recepcion: huboRecepcion ? recepciones.map(r => ({
        procedencia: r.procedencia,
        locacion: r.locacion,
        transportista: r.transportista,
        placa: r.placa.toUpperCase(),
        volumen: parseInt(r.volumen) || 0
      })) : [],
      config: { 
        huboTratamiento, 
        huboRecuperacion,
        huboRecepcion,
        huboEvacuacion
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
      evacuacion: huboEvacuacion ? {
        usoBiocida: evacuacion.usoBiocida,
        biocidaCantidad: evacuacion.usoBiocida ? parseFloat(evacuacion.biocidaCantidad) || 0 : 0,
        aguaEvacuada: parseFloat(evacuacion.aguaEvacuada) || 0,
        totalViajes: parseInt(evacuacion.totalViajes) || 0
      } : {
        usoBiocida: false,
        biocidaCantidad: 0,
        aguaEvacuada: 0,
        totalViajes: 0
      }
    };
  };

  const handleSubmit = () => {
    // Validación
    if (!tecnicoResponsable) {
      alert("Por favor, selecciona el Técnico de Aguas Responsable");
      return;
    }

    // Reglas: no negativos y alerta de faltantes antes de confirmar envío
    const missing = [];
    const negatives = [];

    // 1. Recepciones (solo si hubo recepción)
    if (huboRecepcion) {
      recepciones.forEach((r, idx) => {
        const label = `Viaje #${idx + 1}`;
        if (!r.procedencia) missing.push(`${label}: procedencia`);
        if (!r.locacion) missing.push(`${label}: locación`);
        if (!r.transportista) missing.push(`${label}: transportista`);
        if (!r.placa) missing.push(`${label}: placa`);
        if (r.volumen === '' || r.volumen === null) missing.push(`${label}: volumen`);
        if (parseFloat(r.volumen) < 0) negatives.push(`${label}: volumen negativo`);
      });
    }

    // 2. Químicos (solo si hubo tratamiento)
    if (huboTratamiento) {
      ['cal','sulfato','lipesa'].forEach(prod => {
        if (quimicos[prod].consumo === '' || quimicos[prod].consumo === null) missing.push(`Químico ${prod}: consumo`);
        if (quimicos[prod].consumo < 0) negatives.push(`Químico ${prod}: consumo negativo`);
      });
      if (biocidaTratamiento.usado) {
        if (biocidaTratamiento.cantidad === '' || biocidaTratamiento.cantidad === null) missing.push('Biocida (Tratamiento): cantidad');
        if (parseFloat(biocidaTratamiento.cantidad) < 0) negatives.push('Biocida (Tratamiento): cantidad negativa');
      }
    }

    // 3. Piscinas (todos requeridos para monitoreo)
    Object.entries(piscinas).forEach(([key,val]) => {
      if (val === '' || val === null) missing.push(`Piscina ${key}: nivel`);
      if (parseFloat(val) < 0) negatives.push(`Piscina ${key}: nivel negativo`);
    });

    // 4. Recuperación (si aplica)
    if (huboRecuperacion) {
      if (crudoEvacuado === '' || crudoEvacuado === null) missing.push('Recuperación: crudo evacuado');
      if (parseFloat(crudoEvacuado) < 0) negatives.push('Recuperación: crudo evacuado negativo');
    }

    // 5. Evacuación agua (solo si hubo evacuación)
    if (huboEvacuacion) {
      if (evacuacion.aguaEvacuada === '' || evacuacion.aguaEvacuada === null) missing.push('Evacuación: agua evacuada');
      if (parseFloat(evacuacion.aguaEvacuada) < 0) negatives.push('Evacuación: agua evacuada negativa');
      if (evacuacion.totalViajes === '' || evacuacion.totalViajes === null) missing.push('Evacuación: total viajes');
      if (parseInt(evacuacion.totalViajes) < 0) negatives.push('Evacuación: total viajes negativo');
      if (evacuacion.usoBiocida) {
        if (evacuacion.biocidaCantidad === '' || evacuacion.biocidaCantidad === null) missing.push('Evacuación: biocida cantidad');
        if (parseFloat(evacuacion.biocidaCantidad) < 0) negatives.push('Evacuación: biocida cantidad negativa');
      }
    }

    // Bloquear si hay negativos
    if (negatives.length > 0) {
      alert(`❌ Valores negativos detectados:\n- ${negatives.join('\n- ')}\nCorrige antes de enviar.`);
      return;
    }

    // Confirmar si hay faltantes
    if (missing.length > 0) {
      const proceed = window.confirm(`⚠️ Hay ${missing.length} datos sin ingresar:\n- ${missing.slice(0,15).join('\n- ')}${missing.length>15 ? '\n...': ''}\n\n¿Desea continuar y enviar de todas formas?`);
      if (!proceed) return;
    }

    // Construir payload y abrir modal resumen
    const payload = construirPayload();
    setPayloadPreview(payload);
    setMostrarResumen(true);
  };

  const confirmarEnvioFinal = async () => {
    if (!payloadPreview) return;
    
    setMostrarResumen(false);
    
    try {
      // URL del flujo Power Automate - CONFIGURADA
      const WEBHOOK_URL = "https://defaultb08db26f29d647d18313beeda6a064.a4.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/02405806a4094ac1ab5417b0f6e46df0/triggers/manual/paths/invoke?api-version=1";
      
      if (WEBHOOK_URL.includes("xxxxx")) {
        alert("⚠️ Falta configurar la URL del flujo de Power Automate en el código.\n\nContacta al administrador para obtenerla.");
        setMostrarResumen(true);
        return;
      }

      // Mostrar indicador de carga
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadPreview)
      });

      if (response.ok) {
        // Envío exitoso
        console.log("✅ Reporte enviado a Power Automate:", payloadPreview);
        setMensajeGracias(true);
        setTimeout(() => setMensajeGracias(false), 6000);
        alert("✅ Reporte enviado para aprobación.\n\nEl supervisor revisará los datos antes de generar el correo final.");
        // Opcional: limpiar formulario para nuevo reporte
        // window.location.reload();
      } else {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error de envío:", error);
      setPayloadPreview(null);
      alert(`❌ Error al enviar el reporte:\n${error.message}\n\nVerifica tu conexión y la URL de Power Automate.`);
      setMostrarResumen(true);
    }
  };

  const cancelarResumen = () => {
    setMostrarResumen(false);
    setPayloadPreview(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans pb-32 text-[var(--gray-dark)]">
      
      {/* CABECERA - Estilo minimalista profesional */}
      <header className="max-w-6xl mx-auto mb-8 bg-white p-8 rounded-lg shadow-md border-l-4" style={{borderColor:'var(--navy)'}}>
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-lg icon-hover">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Reporte Diario PetroOriental</h1>
              <p className="text-lg text-[var(--aqua-light)] font-semibold">Gestión de Aguas Industriales CAMI</p>
              <p className="text-base text-[var(--sage)] mt-1 font-medium">Elaborado y supervisado por: Bernardo Galindo</p>
            </div>
          </div>
        </div>
        <p className="text-slate-600 text-sm mb-6">Complete la información operativa del día</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="font-semibold text-slate-700 mb-2 text-sm">📅 Fecha del Reporte</label>
            <input 
              type="date" 
              value={fechaReporte} 
              onChange={(e) => setFechaReporte(e.target.value)} 
              className="border border-gray-300 p-3 rounded-md font-medium focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold text-slate-700 mb-2 text-sm">👤 Técnico de Aguas Responsable</label>
            <select 
              value={tecnicoResponsable} 
              onChange={(e) => setTecnicoResponsable(e.target.value)} 
              className="border border-gray-300 p-3 rounded-md font-medium focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
            >
              <option value="">Seleccionar técnico...</option>
              <option value="Jaime Aguinda">Jaime Aguinda</option>
              <option value="Juan Zapata">Juan Zapata</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        {/* DECISIÓN: RECEPCIÓN DE FLUIDOS */}
        <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center border-l-4" style={{borderColor:'var(--navy)'}}>
          <div>
            <h2 className="text-xl font-bold text-[var(--gray-dark)] flex items-center gap-2">
              <span className="badge-step">0</span>
              Recepción de Fluidos del Día
            </h2>
            <p className="text-xs text-gray-600 mt-1 ml-10">¿Se recibieron fluidos hoy?</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setHuboRecepcion(false)} className={`px-6 py-3 rounded-md text-sm font-semibold transition-all ${!huboRecepcion ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-600'}`}>NO</button>
            <button onClick={() => setHuboRecepcion(true)} className={`px-6 py-3 rounded-md text-sm font-semibold transition-all ${huboRecepcion ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-600'}`}>SÍ</button>
          </div>
        </div>

        {/* 1. RECEPCIÓN DE FLUIDOS (CONDICIONAL) */}
        {huboRecepcion && (
        <section className="bg-white p-8 rounded-lg shadow-md border-l-4" style={{borderColor:'var(--navy)'}}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[var(--gray-dark)] flex items-center gap-2">
              <span className="badge-step">1</span>
              Recepción de Fluidos
            </h2>
            <p className="text-sm text-slate-600 mt-1 ml-10">Registro de viajes recibidos en planta</p>
          </div>
          {recepciones.map((fila, idx) => (
            <div key={fila.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 bg-slate-50 p-5 rounded-lg border border-slate-200 hover:border-slate-400 hover:shadow-sm transition-all">
              <div className="md:col-span-1 flex items-center">
                <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">Procedencia</label>
                <select className={`w-full p-2 border rounded text-sm bg-white ${fila.procedencia === '' ? 'missing-field' : 'border-gray-300'}`} value={fila.procedencia} onChange={e => actualizarFila(fila.id, 'procedencia', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {PROCEDENCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 mb-1">Locación</label>
                <select className={`w-full p-2 border rounded text-sm bg-white ${fila.locacion === '' ? 'missing-field' : 'border-gray-300'}`} value={fila.locacion} onChange={e => actualizarFila(fila.id, 'locacion', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {LOCACIONES_ALFABETICAS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">Transportista</label>
                <input type="text" className={`w-full p-2 border rounded text-sm ${fila.transportista === '' ? 'missing-field' : 'border-gray-300'}`} value={fila.transportista} onChange={e => actualizarFila(fila.id, 'transportista', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">Placa</label>
                <input type="text" placeholder="AAA-1234" className={`w-full p-2 border rounded text-sm uppercase ${fila.placa === '' ? 'missing-field' : 'border-gray-300'}`} value={fila.placa} onChange={e => actualizarFila(fila.id, 'placa', e.target.value)} />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-500 mb-1">Vol (Bbl)</label>
                <input type="number" min="0" step="1" placeholder="0" className={`w-full p-2 border rounded text-sm font-mono font-bold text-right text-[var(--navy)] ${fila.volumen === '' ? 'missing-field' : 'border-gray-300'}`} value={fila.volumen} onChange={e => actualizarFila(fila.id, 'volumen', e.target.value)} />
              </div>
              <div className="md:col-span-1 flex items-end pb-1">
                <button onClick={() => eliminarFila(fila.id)} className="text-gray-500 font-bold hover:text-[var(--navy)] text-xl">×</button>
              </div>
            </div>
          ))}
          <div className="mt-6 flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
            <button onClick={agregarFila} className="flex items-center gap-2 bg-primary text-white font-semibold hover:bg-[var(--navy)] px-6 py-3 rounded-md shadow-sm hover:shadow-md transition-all w-full md:w-auto">
              <span className="text-xl">+</span> Agregar Otro Viaje
            </button>
            <div className="bg-slate-100 px-6 py-4 rounded-lg border border-slate-300 w-full md:w-auto flex items-center justify-between md:justify-center gap-6">
              <div className="text-center">
                <span className="text-xs text-slate-600 font-semibold uppercase block tracking-wide">Total Recibido</span>
                <div className="text-3xl font-bold text-slate-800">{totalRecepcionDecidido.toFixed(0)} <span className="text-base font-medium">Bbl</span></div>
              </div>
            </div>
          </div>
        </section>
        )}
        {!huboRecepcion && (
          <section className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{borderColor:'var(--navy)'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="badge-step">1</span>
                <h3 className="text-lg font-semibold text-[var(--gray-dark)]">Sin Recepción de Fluidos</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total del Día</p>
                <p className="text-2xl font-bold text-[var(--gray-dark)]">0 Bbl</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">Se registrará una recepción en 0 para la fecha seleccionada.</p>
          </section>
        )}

        {/* DECISIÓN: TRATAMIENTO QUÍMICO */}
        <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center border-l-4" style={{borderColor:'var(--navy)'}}>
          <div>
            <h2 className="text-xl font-bold text-[var(--gray-dark)] flex items-center gap-2">
              <span className="badge-step">2</span>
              Tratamiento de Aguas Industriales
            </h2>
            <p className="text-xs text-slate-600 mt-1 ml-10">¿Se realizó dosificación de químicos hoy?</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setHuboTratamiento(false)} className={`px-6 py-3 rounded-md text-sm font-semibold transition-all ${!huboTratamiento ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-600'}`}>NO</button>
            <button onClick={() => setHuboTratamiento(true)} className={`px-6 py-3 rounded-md text-sm font-semibold transition-all ${huboTratamiento ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-600'}`}>SÍ</button>
          </div>
        </div>

        {/* SECCIÓN 2: QUÍMICOS (CONDICIONAL) */}
        {huboTratamiento && (
          <section className="p-8 rounded-2xl border-2 animate-fade-in" style={{background:'linear-gradient(135deg,#f5f6f7,#e6e8ea)',borderColor:'var(--navy)'}}>
            <p className="text-sm text-blue-800 font-semibold mb-4">📦 Control de Stock e Inventario</p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-blue-200 bg-white rounded-lg text-sm">
                <thead>
                  <tr style={{background:'#dfe3e6',color:'var(--navy)'}}>
                    <th className="p-3 font-bold text-center">Concepto</th>
                    <th className="p-3 font-bold text-center">CAL</th>
                    <th className="p-3 font-bold text-center">SULFATO</th>
                    <th className="p-3 font-bold text-center">LIPESA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3 font-semibold text-gray-600">Stock Inicial</td>
                    {['cal','sulfato','lipesa'].map(prod => (
                      <td key={prod} className="p-3 text-center font-bold text-gray-800">{quimicos[prod].inicial}</td>
                    ))}
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-semibold text-gray-600">Consumo (Sacos)</td>
                    {['cal','sulfato','lipesa'].map(prod => (
                      <td key={prod} className="p-3">
                        <input
                          type="number"
                          min="0"
                          className={`w-full border rounded-md p-2 font-bold text-center ${quimicos[prod].consumo === 0 ? 'missing-field' : 'border-gray-300'}`}
                          value={quimicos[prod].consumo || ''}
                          onChange={(e) => handleQuimico(prod, 'consumo', e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-semibold text-gray-600">Stock Final</td>
                    {['cal','sulfato','lipesa'].map(prod => {
                      const stockFinal = getStockFinal(prod);
                      const critico = esStockCritico(prod);
                      return (
                        <td key={prod} className="p-3 text-center">
                          <div className={`rounded-md p-2 font-black text-xs md:text-sm ${critico ? 'critical-field' : 'summary-cell'}`}>{stockFinal}{critico && <span className="block text-[10px] mt-1">⚠ Crítico</span>}</div>
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Biocida Externo (Opcional) */}
            <div className="mt-6 border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-700">Biocida</h3>
                  <p className="text-[10px] text-gray-500 mt-1">Usada principalmente previo al tratamiento químico para minimizar la carga bacteriana del lote tratado</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setBiocidaTratamiento({...biocidaTratamiento, usado: false, cantidad: ''})} className={`px-3 py-2 rounded-md text-xs font-semibold transition-all ${!biocidaTratamiento.usado ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-600'}`}>NO</button>
                  <button onClick={() => setBiocidaTratamiento({...biocidaTratamiento, usado: true})} className={`px-3 py-2 rounded-md text-xs font-semibold transition-all ${biocidaTratamiento.usado ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-600'}`}>SÍ</button>
                </div>
              </div>
              {biocidaTratamiento.usado && (
                <div className="animate-fade-in space-y-3 bg-white p-3 rounded-lg border border-gray-200">
                  <label className="text-xs font-bold text-[var(--navy)] uppercase tracking-wide">Cantidad (Galones)</label>
                  <div className="flex flex-wrap gap-2 items-start">
                    {[10,20,30,40,50,60,70,80,90].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => { setBiocidaTratamiento({...biocidaTratamiento, cantidad: val}); setBiocidaTratamientoCustom(false); }}
                        className={`px-3 py-2 rounded-md text-sm font-semibold transition-all ${!biocidaTratamientoCustom && Number(biocidaTratamiento.cantidad)===val ? 'option-btn-selected' : 'option-btn'}`}
                      >{val}</button>
                    ))}
                    <button
                      type="button"
                      onClick={() => { setBiocidaTratamientoCustom(true); setBiocidaTratamiento({...biocidaTratamiento, cantidad: ''}); }}
                      className={`px-3 py-2 rounded-md text-sm font-semibold transition-all ${biocidaTratamientoCustom ? 'option-btn-selected' : 'option-btn'}`}
                    >Otro</button>
                    {biocidaTratamientoCustom && (
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        className={`w-24 p-2 border rounded-md font-semibold text-center bg-white ${biocidaTratamiento.cantidad === '' ? 'missing-field' : 'border-gray-300'}`}
                        value={biocidaTratamiento.cantidad}
                        onChange={(e) => setBiocidaTratamiento({...biocidaTratamiento, cantidad: e.target.value})}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3. NIVELES DE PISCINAS */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border-l-4" style={{borderColor:'var(--navy)'}}>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[var(--gray-dark)] flex items-center gap-2">
              <span className="badge-step">3</span>
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
                      step="5"
                      className={`w-full p-4 border rounded-xl font-mono text-2xl font-black text-center focus:outline-none focus:ring-2 ${piscinas[piscina] === '' ? 'missing-field' : critico ? 'critical-field' : 'border-gray-300 text-gray-700'}`}
                      value={piscinas[piscina]}
                      onChange={(e) => setPiscinas({...piscinas, [piscina]: e.target.value})}
                    />
                    <span className="absolute right-4 top-4 text-gray-400 text-lg font-bold">%</span>
                  </div>
                  {critico && <p className="text-xs text-[var(--navy)] font-bold mt-2 text-center">Nivel Alto</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* DECISIÓN: RECUPERACIÓN */}
        <div className="bg-white p-6 rounded-2xl shadow-lg flex justify-between items-center border-l-4" style={{borderColor:'var(--navy)'}}>
          <div>
            <h2 className="text-xl font-black text-[var(--gray-dark)] flex items-center gap-2">
              <span className="badge-step">4</span>
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
          <section className="p-8 rounded-2xl border-2 animate-fade-in" style={{background:'linear-gradient(135deg,#f5f6f7,#e6e8ea)',borderColor:'var(--navy)'}}>
            <label className="block text-base font-black text-purple-900 mb-3">Cantidad de Crudo Evacuado (BBL)</label>
            <input 
              type="number" 
              className={`w-full md:w-1/2 p-4 border rounded-xl text-3xl font-black placeholder-gray-400 focus:ring-2 focus:ring-[var(--navy)] outline-none ${crudoEvacuado === '' ? 'missing-field' : 'border-gray-300 text-[var(--navy)]'}`} 
              placeholder="0"
              value={crudoEvacuado}
              onChange={(e) => setCrudoEvacuado(e.target.value)}
            />
          </section>
        )}

        {/* DECISIÓN: EVACUACIÓN AGUA TRATADA */}
        <div className="bg-white p-6 rounded-2xl shadow-lg flex justify-between items-center border-l-4" style={{borderColor:'var(--navy)'}}>
          <div>
            <h2 className="text-xl font-black text-[var(--gray-dark)] flex items-center gap-2">
              <span className="badge-step">5</span>
              Evacuación Agua Tratada
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-10">¿Se evacuó agua tratada hoy?</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setHuboEvacuacion(false)} className={`px-6 py-3 rounded-md text-sm font-semibold transition-all ${!huboEvacuacion ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-600'}`}>NO</button>
            <button onClick={() => setHuboEvacuacion(true)} className={`px-6 py-3 rounded-md text-sm font-semibold transition-all ${huboEvacuacion ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-600'}`}>SÍ</button>
          </div>
        </div>

        {/* SECCIÓN 5: EVACUACIÓN (CONDICIONAL) */}
        {huboEvacuacion && (
          <section className="bg-white p-8 rounded-2xl shadow-lg border-l-4" style={{borderColor:'var(--navy)'}}>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-[var(--gray-dark)] flex items-center gap-2">
                <span className="badge-step">5</span>
                Detalle de Evacuación Agua Tratada
              </h2>
              <p className="text-sm text-gray-500 mt-1 ml-10">Control de disposición final de agua</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Agua Evacuada (BBL)</label>
                <input type="number" className={`w-full p-3 border rounded-lg ${evacuacion.aguaEvacuada === '' ? 'missing-field' : 'border-gray-300'}`} value={evacuacion.aguaEvacuada} onChange={(e) => setEvacuacion({...evacuacion, aguaEvacuada: e.target.value})} />
              </div>
              
              {/* Biocida Toggle */}
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border-2 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">¿Uso de Biocida?</span>
                  <div className="flex gap-2">
                      <button onClick={() => setEvacuacion({...evacuacion, usoBiocida: false, biocidaCantidad: ''})} className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${!evacuacion.usoBiocida ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-600'}`}>NO</button>
                      <button onClick={() => setEvacuacion({...evacuacion, usoBiocida: true})} className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${evacuacion.usoBiocida ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-600'}`}>SÍ</button>
                  </div>
                </div>
                {evacuacion.usoBiocida && (
                  <div className="animate-fade-in space-y-3">
                    <label className="text-xs font-bold text-[var(--navy)] uppercase tracking-wide">Cantidad Biocida (Galones)</label>
                    <div className="flex flex-wrap gap-2 items-start">
                      {[10,20,30,40,50,60,70,80,90].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => { setEvacuacion({...evacuacion, biocidaCantidad: val}); setBiocidaCustom(false); }}
                          className={`px-3 py-2 rounded-md text-sm font-semibold transition-all ${!biocidaCustom && Number(evacuacion.biocidaCantidad)===val ? 'option-btn-selected' : 'option-btn'}`}
                        >{val}</button>
                      ))}
                      <button
                        type="button"
                        onClick={() => { setBiocidaCustom(true); setEvacuacion({...evacuacion, biocidaCantidad: ''}); }}
                        className={`px-3 py-2 rounded-md text-sm font-semibold transition-all ${biocidaCustom ? 'option-btn-selected' : 'option-btn'}`}
                      >Otro</button>
                      {biocidaCustom && (
                        <input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          className={`w-24 p-2 border rounded-md font-semibold text-center bg-white ${evacuacion.biocidaCantidad === '' ? 'missing-field' : 'border-gray-300'}`}
                          value={evacuacion.biocidaCantidad}
                          onChange={(e) => setEvacuacion({...evacuacion, biocidaCantidad: e.target.value})}
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Seleccione un valor rápido o pulse "Otro" para ingresar uno personalizado (decimales permitidos).</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-3">Total Viajes</label>
                <div className={`flex flex-wrap gap-2 ${evacuacion.totalViajes === '' ? 'missing-field rounded-md p-2' : ''}` }>
                  {[1,2,3,4,5,6,7,8,9,10].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setEvacuacion({...evacuacion, totalViajes: v})}
                      className={`px-3 py-2 rounded-md text-sm font-semibold transition-all ${Number(evacuacion.totalViajes)===v ? 'option-btn-selected' : 'option-btn'}`}
                    >{v}</button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Pulse un número para registrar los viajes del día.</p>
              </div>
            </div>
          </section>
        )}
        {!huboEvacuacion && (
          <section className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{borderColor:'var(--navy)'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="badge-step">5</span>
                <h3 className="text-lg font-semibold text-[var(--gray-dark)]">Sin Evacuación de Agua Tratada</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total del Día</p>
                <p className="text-2xl font-bold text-[var(--gray-dark)]">0 Bbl</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">Se registrará una evacuación de agua tratada en 0 para la fecha seleccionada.</p>
          </section>
        )}

        {/* BOTÓN ENVIAR PARA APROBACIÓN */}
        <button onClick={handleSubmit} className="w-full bg-primary text-white font-bold py-5 rounded-lg shadow-lg hover:bg-[var(--navy)] hover:shadow-xl transition-all text-xl flex items-center justify-center gap-3">
          <svg className="w-6 h-6 icon-hover" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          ENVIAR REPORTE PARA APROBACIÓN
        </button>

      </main>
      {/* MODAL RESUMEN PRE-ENVÍO */}
      {mostrarResumen && payloadPreview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white w-full max-w-[680px] rounded-lg shadow-xl border border-gray-300 overflow-hidden">
            <div className="px-4 py-2 border-b flex items-center gap-2" style={{background:'var(--navy)'}}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/></svg>
              <h3 className="text-sm font-semibold text-white">Resumen Día {payloadPreview.meta.fecha}</h3>
            </div>
            <div className="p-3 space-y-3 text-[11px] leading-tight">
              {/* Fila compacta principal */}
              <div className="flex gap-2 w-full">
                <div className="flex-1 border rounded-md p-2 bg-gray-50 flex flex-col">
                  <span className="font-semibold text-gray-600">Recepción</span>
                  <span className="text-xl font-black text-gray-800">{payloadPreview.meta.totalRecepcion}<span className="text-xs font-medium"> Bbl</span></span>
                  <span className="text-[9px] text-gray-500">{payloadPreview.config.huboRecepcion ? `${payloadPreview.recepcion.length} viaje(s)` : 'Sin recepción'}</span>
                </div>
                <div className="flex-1 border rounded-md p-2 bg-gray-50 flex flex-col">
                  <span className="font-semibold text-gray-600">Evacuación</span>
                  <span className="text-xl font-black text-gray-800">{payloadPreview.evacuacion.aguaEvacuada}<span className="text-xs font-medium"> Bbl</span></span>
                  <span className="text-[9px] text-gray-500">{payloadPreview.config.huboEvacuacion ? `${payloadPreview.evacuacion.totalViajes} viaje(s)` : 'Sin evacuación'}</span>
                </div>
                <div className="flex-1 border rounded-md p-2 bg-gray-50 flex flex-col">
                  <span className="font-semibold text-gray-600">Recuperación</span>
                  <span className="text-xl font-black text-gray-800">{payloadPreview.recuperacionCrudo.crudoEvacuado}<span className="text-xs font-medium"> Bbl</span></span>
                  <span className="text-[9px] text-gray-500">{payloadPreview.config.huboRecuperacion ? 'Operación' : 'No aplica'}</span>
                </div>
              </div>
              {/* Piscinas */}
              <div className="border rounded-md p-2 bg-gray-50">
                <span className="font-semibold text-gray-600 text-[11px]">Piscinas (%)</span>
                <div className="grid grid-cols-6 gap-1 mt-1">
                  {Object.entries(payloadPreview.piscinas).map(([k,v]) => (
                    <div key={k} className="bg-white border rounded px-1 py-1 text-center">
                      <span className="block text-[9px] font-semibold text-gray-600 uppercase">{k}</span>
                      <span className="text-[10px] font-bold text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Químicos */}
              {payloadPreview.config.huboTratamiento && (
                <div className="border rounded-md p-2 bg-gray-50">
                  <span className="font-semibold text-gray-600 text-[11px]">Químicos Primarios</span>
                  <div className="flex gap-1 mt-1">
                    {['cal','sulfato','lipesa'].map(k => {
                      const v = payloadPreview.quimicos[k];
                      return (
                        <div key={k} className="flex-1 bg-white border rounded px-1 py-1 text-center">
                          <span className="block text-[9px] font-semibold text-gray-600 uppercase">{k}</span>
                          <span className="block text-[10px] font-bold text-blue-700">{v.consumo}</span>
                          <span className="block text-[10px] font-bold text-green-700">{v.saldo}</span>
                        </div>
                      )
                    })}
                  </div>
                  {payloadPreview.quimicos.biocida && payloadPreview.quimicos.biocida.usado && (
                    <div className="mt-1 text-[9px] font-semibold text-gray-600">Biocida (ext): {payloadPreview.quimicos.biocida.cantidad} Gal</div>
                  )}
                </div>
              )}
              {/* Biocida */}
              {payloadPreview.evacuacion.usoBiocida && payloadPreview.config.huboEvacuacion && (
                <div className="border rounded-md p-2 bg-gray-50 flex items-center justify-between">
                  <span className="font-semibold text-gray-600 text-[11px]">Biocida (Gal)</span>
                  <span className="text-sm font-black text-green-700">{payloadPreview.evacuacion.biocidaCantidad}</span>
                </div>
              )}
            </div>
            <div className="px-3 py-2 bg-gray-100 flex gap-2 justify-end">
              <button onClick={cancelarResumen} className="px-3 py-2 rounded text-[11px] font-semibold bg-gray-300 text-gray-700 hover:bg-gray-400 transition">Revisar</button>
              <button onClick={confirmarEnvioFinal} className="px-3 py-2 rounded text-[11px] font-bold bg-primary text-white hover:bg-[var(--navy)] shadow transition">Confirmar & Enviar</button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Gracias */}
      {mensajeGracias && (
        <div className="fixed bottom-4 right-4 bg-white border border-green-300 rounded-lg shadow-lg p-4 flex items-center gap-3 animate-fade-in">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          <p className="text-sm font-semibold text-green-700">Gracias. El reporte fue enviado para aprobación.</p>
        </div>
      )}
    </div>
  )
}

export default App
