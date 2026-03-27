import React, { useState, useRef, useEffect } from 'react';
import { Text, View, TouchableOpacity, Image, ActivityIndicator, ScrollView, Modal, TextInput, SafeAreaView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../../supabase'; 
import { decode } from 'base64-arraybuffer';
import { Session } from '@supabase/supabase-js';

import { styles, colors } from '../../src/theme/globalStyles';
import { analizarImagenConGemini } from '../../src/services/geminiApi';
import { MacroBar } from '../../src/components/MacroBar';
import { TimelineItem } from '../../src/components/TimelineItem';
import { AuthScreen } from '../../src/screens/AuthScreen';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [session, setSession] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(false); 
  
  // SISTEMA DE NAVEGACIÓN
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'camara' | 'resultados' | 'perfil' | 'onboarding'>('dashboard');
  
  // SISTEMA DE TOASTS
  const [toast, setToast] = useState<{visible: boolean, msg: string, type: 'error'|'success'}>({visible: false, msg: '', type: 'success'});
  
  const showToast = (msg: string, type: 'error'|'success' = 'success') => {
    setToast({visible: true, msg, type});
    setTimeout(() => setToast({visible: false, msg: '', type: 'success'}), 4000);
  };

  // CALENDARIO INTERACTIVO
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  const obtenerSemana = () => {
    let week = [];
    let curr = new Date(fechaSeleccionada);
    let primerDia = curr.getDate() - (curr.getDay() === 0 ? 6 : curr.getDay() - 1);
    for (let i = 0; i < 7; i++) {
      let day = new Date(curr.setDate(primerDia + i));
      week.push(new Date(day));
    }
    return week;
  };
  const diasSemanaNombres = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

  // DATOS DEL USUARIO Y BD
  const [perfil, setPerfil] = useState({ nombre: '', rut: '', meta_calorias: 0, meta_proteinas: 0, meta_carbs: 0, meta_grasas: 0, edad: 0, peso_kg: 0, altura_cm: 0 });
  const [historialDia, setHistorialDia] = useState<any[]>([]);
  const [nombresAlimentos, setNombresAlimentos] = useState<string>("");

  // ESTADOS DE CÁMARA E IA
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null); 
  const [resultadosDB, setResultadosDB] = useState<any[]>([]);
  const [totalCaloriasPlato, setTotalCaloriasPlato] = useState(0);
  const [ayudaCamaraVisible, setAyudaCamaraVisible] = useState(false);

  // MODALES (EDICIÓN Y DETALLE INTERACTIVO)
  const [modalVisible, setModalVisible] = useState(false);
  const [itemAEditar, setItemAEditar] = useState<number | null>(null);
  const [textoCorreccion, setTextoCorreccion] = useState('');
  const [cantidadModal, setCantidadModal] = useState<number>(1);
  
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [itemDetalle, setItemDetalle] = useState<any>(null);

  // AUTH
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modoRegistro, setModoRegistro] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  // ==========================================
  // EFECTOS Y CARGA DE DATOS
  // ==========================================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  useEffect(() => {
    if (session) { cargarDatosDashboard(); cargarDiccionario(); }
  }, [session, fechaSeleccionada, vistaActual]);

  const cargarDiccionario = async () => {
    const { data } = await supabase.from('alimentos').select('nombre');
    if (data) setNombresAlimentos(data.map(item => item.nombre).join(' | '));
  };

  const cargarDatosDashboard = async () => {
    if (!session) return;
    setCargando(true);
    try {
      const { data: perfilData } = await supabase.from('perfiles_usuarios').select('*').eq('id_usuario', session.user.id).single();
      if (perfilData) {
        setPerfil(perfilData);
        if ((!perfilData.meta_calorias || perfilData.meta_calorias === 0) && vistaActual === 'dashboard') {
          setVistaActual('onboarding');
        }
      }

      const fechaStr = fechaSeleccionada.toISOString().split('T')[0];
      const { data: historialData } = await supabase.from('historial_comidas')
        .select('*')
        .eq('id_usuario', session.user.id)
        .eq('fecha', fechaStr)
        .order('created_at', { ascending: false }); 
      
      if (historialData) setHistorialDia(historialData);
    } catch (error) { 
      console.error("Error cargando dashboard", error); 
    } finally { setCargando(false); }
  };

  // ==========================================
  // AUTENTICACIÓN
  // ==========================================
  const manejarAuth = async () => {
    if (!email || !password) { showToast('Por favor llena ambos campos', 'error'); return; }
    setCargando(true);
    
    if (modoRegistro) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) showToast(error.message, 'error'); 
      else showToast('¡Cuenta creada exitosamente!', 'success');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          showToast('La cuenta no existe o la contraseña es incorrecta.', 'error');
        } else {
          showToast(error.message, 'error');
        }
      }
    }
    setCargando(false);
  };

  const guardarPerfil = async (esOnboarding = false) => {
    if (!perfil.nombre || !perfil.meta_calorias) { showToast('Nombre y Calorías son obligatorios', 'error'); return; }
    setCargando(true);
    try {
      const { error } = await supabase.from('perfiles_usuarios').update({
        nombre: perfil.nombre, rut: perfil.rut,
        edad: perfil.edad, peso_kg: perfil.peso_kg, altura_cm: perfil.altura_cm,
        meta_calorias: perfil.meta_calorias, meta_proteinas: perfil.meta_proteinas,
        meta_carbs: perfil.meta_carbs, meta_grasas: perfil.meta_grasas
      }).eq('id_usuario', session!.user.id);
      
      if (error) throw error;
      showToast('Datos guardados correctamente', 'success');
      setVistaActual('dashboard');
    } catch (err: any) { showToast(err.message, 'error'); } finally { setCargando(false); }
  };

  // ==========================================
  // CÁMARA E IA
  // ==========================================
  const abrirCamaraDirecta = () => {
    const hoy = new Date();
    if (fechaSeleccionada.toDateString() !== hoy.toDateString()) {
      setFechaSeleccionada(hoy);
    }
    setFotoUri(null); setFotoBase64(null); setResultadosDB([]);
    setVistaActual('camara');
  };

  const tomarFoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });
      if (photo) { setFotoUri(photo.uri); setFotoBase64(photo.base64 ?? null); setVistaActual('resultados'); }
    }
  };

  const analizarPlato = async () => {
    if (!fotoBase64 || !session) return;
    setCargando(true); 
    try {
      const { data: memoria } = await supabase.from('feedback_ia').select('nombre_alimento_visto, asociado_a_nombre_db').eq('id_usuario', session.user.id);
      let reglasMemoria = memoria && memoria.length > 0 ? "\nREGLAS APRENDIDAS:\n" + memoria.map(m => `- Si ves "${m.nombre_alimento_visto}", asócialo a "${m.asociado_a_nombre_db}".`).join('\n') : "";
      
      const datosGemini = await analizarImagenConGemini(fotoBase64, nombresAlimentos, reglasMemoria);
      
      let arrayResultados = []; let sumaCals = 0;
      for (const item of datosGemini.ingredientes) {
        const termino = item.nombre_db.substring(0, 15).trim();
        const { data } = await supabase.from('alimentos').select(`id, nombre, medida_casera, categorias_intercambio ( calorias, proteinas_g, carbohidratos_g, lipidos_g )`).ilike('nombre', `${termino}%`).limit(1);
        const mult = item.cantidad_porciones || 1;

        if (data && data.length > 0) {
          arrayResultados.push({ visto_original: item.alimento_visto, nombre_db: data[0].nombre, porcion_vista: item.medida_casera_vista, cantidad_porciones: mult, calorias_base: (data[0].categorias_intercambio as any).calorias, macros: data[0].categorias_intercambio, encontrado: true, editado: false });
          sumaCals += ((data[0].categorias_intercambio as any).calorias * mult);
        } else {
          arrayResultados.push({ visto_original: item.alimento_visto, nombre_db: item.nombre_db, porcion_vista: item.medida_casera_vista, cantidad_porciones: mult, calorias_base: 0, encontrado: false, editado: false });
        }
      }
      setResultadosDB(arrayResultados); setTotalCaloriasPlato(Math.round(sumaCals));
    } catch (error: any) { showToast(error.message, 'error'); } finally { setCargando(false); }
  };

  const recalcularTotal = (nuevaLista: any[]) => {
    let t = 0; nuevaLista.forEach(i => { if (i.encontrado) t += (i.calorias_base * i.cantidad_porciones); });
    setTotalCaloriasPlato(Math.round(t));
  };

  const procesarModal = async () => {
    if (itemAEditar === null) return;
    setModalVisible(false); setCargando(true);
    try {
      const palabraClave = textoCorreccion.trim();
      const nuevaLista = [...resultadosDB];

      if (palabraClave !== '') {
        let { data } = await supabase.from('alimentos').select('id, nombre, categorias_intercambio ( calorias, proteinas_g, carbohidratos_g, lipidos_g )').ilike('nombre', `${palabraClave}%`).limit(1);
        let alimento = data?.[0];
        if (!alimento) { showToast(`No encontré "${palabraClave}" en la guía`, 'error'); setCargando(false); return; }

        const macros = alimento.categorias_intercambio as any;
        if (itemAEditar === -1) {
          nuevaLista.push({ visto_original: "Manual", nombre_db: alimento.nombre, porcion_vista: "Ajuste manual", cantidad_porciones: cantidadModal, calorias_base: macros.calorias, macros: macros, encontrado: true, editado: false });
        } else {
          nuevaLista[itemAEditar] = { ...nuevaLista[itemAEditar], nombre_db: alimento.nombre, calorias_base: macros.calorias, macros: macros, encontrado: true, editado: true, cantidad_porciones: cantidadModal };
        }
      } else { if (itemAEditar !== -1) nuevaLista[itemAEditar].cantidad_porciones = cantidadModal; }
      setResultadosDB(nuevaLista); recalcularTotal(nuevaLista);
    } catch (err) { showToast("Problema al buscar.", 'error'); } finally { setCargando(false); }
  };

  const guardarHistorialYFeedback = async () => {
    setCargando(true);
    try {
      const user_id = session!.user.id;
      const rutaSupabase = fotoBase64 ? `usuarios/${user_id}/${Date.now()}.jpeg` : null;
      if (fotoBase64 && rutaSupabase) await supabase.storage.from('fotos_comida').upload(rutaSupabase, decode(fotoBase64), { contentType: 'image/jpeg', upsert: true });

      const itemsCorregidos = resultadosDB.filter(i => i.editado === true && i.visto_original !== "Manual");
      for (const item of itemsCorregidos) await supabase.from('feedback_ia').insert({ id_usuario: user_id, ruta_foto_supabase: rutaSupabase, nombre_alimento_visto: item.visto_original, asociado_a_nombre_db: item.nombre_db });

      const itemsGuardar = resultadosDB.filter(i => i.encontrado);
      
      const horaActual = new Date().getHours();
      let tipoAuto = 'Cena';
      if(horaActual < 11) tipoAuto = 'Desayuno';
      else if(horaActual < 16) tipoAuto = 'Almuerzo';
      else if(horaActual < 19) tipoAuto = 'Snack';
      
      for(const item of itemsGuardar) {
        await supabase.from('historial_comidas').insert({
          id_usuario: user_id, tipo_comida: tipoAuto, alimento_nombre: item.nombre_db, porcion_texto: `${item.cantidad_porciones}x`,
          calorias: item.calorias_base * item.cantidad_porciones, proteinas: (item.macros.proteinas_g || 0) * item.cantidad_porciones, carbohidratos: (item.macros.carbohidratos_g || 0) * item.cantidad_porciones, grasas: (item.macros.lipidos_g || 0) * item.cantidad_porciones, ruta_foto: rutaSupabase
        });
      }
      showToast('¡Plato registrado!', 'success');
      setVistaActual('dashboard'); 
    } catch (err: any) { showToast(err.message, 'error'); } finally { setCargando(false); }
  };

  // ==========================================
  // COMPONENTES PRINCIPALES DE INTERFAZ
  // ==========================================
  if (!permission) return <View style={styles.safeArea} />;
  
  if (!session) {
    return (
      <View style={{flex: 1}}>
        {toast.visible && (
          <View style={[styles.toastContainer, toast.type === 'error' ? styles.toastError : styles.toastSuccess]}>
            <Text style={{fontSize: 20}}>{toast.type === 'error' ? '⚠️' : '✅'}</Text>
            <Text style={styles.toastText}>{toast.msg}</Text>
          </View>
        )}
        <AuthScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} modoRegistro={modoRegistro} setModoRegistro={setModoRegistro} manejarAuth={manejarAuth} cargando={cargando} />
      </View>
    );
  }

  if (!permission.granted) return ( <View style={styles.containerAuth}><Text style={{ textAlign: 'center', marginBottom: 20 }}>Necesitamos permiso de cámara</Text><TouchableOpacity style={styles.botonAuth} onPress={requestPermission}><Text style={styles.textoBotonAuth}>Dar Permiso</Text></TouchableOpacity></View> );

  const calConsumidas = historialDia.reduce((sum, item) => sum + Number(item.calorias), 0);
  const protConsumidas = historialDia.reduce((sum, item) => sum + Number(item.proteinas), 0);
  const carbConsumidas = historialDia.reduce((sum, item) => sum + Number(item.carbohidratos), 0);
  const grasasConsumidas = historialDia.reduce((sum, item) => sum + Number(item.grasas), 0);
  const calRestantes = Math.max(0, perfil.meta_calorias - calConsumidas);

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* TOAST NOTIFICATIONS GLOBALES */}
      {toast.visible && (
        <View style={[styles.toastContainer, toast.type === 'error' ? styles.toastError : styles.toastSuccess]}>
          <Text style={{fontSize: 20}}>{toast.type === 'error' ? '⚠️' : '✅'}</Text>
          <Text style={styles.toastText}>{toast.msg}</Text>
        </View>
      )}

      {/* VISTA 0: ONBOARDING OBLIGATORIO PARA CUENTAS NUEVAS */}
      {vistaActual === 'onboarding' && (
        <ScrollView style={[styles.dashboardContainer, {paddingHorizontal: 20, paddingTop: 40}]}>
          <Text style={styles.tituloApp}>Bienvenido a NutriSofi 🍏</Text>
          <Text style={{color: colors.textLight, marginTop: 10, marginBottom: 30, fontSize: 16}}>Para personalizar tu experiencia, necesitamos tus datos personales y la pauta de tu nutricionista.</Text>
          
          <View style={styles.cardTimeline}>
            <View style={{flex: 1}}>
              <Text style={styles.tituloSeccion}>Datos Personales</Text>
              <Text style={styles.labelPerfil}>Nombre completo *</Text><TextInput style={styles.inputPerfil} value={perfil.nombre} onChangeText={(t) => setPerfil({...perfil, nombre: t})} placeholder="Ej: Sofía Pérez" />
              <Text style={styles.labelPerfil}>RUT</Text><TextInput style={styles.inputPerfil} value={perfil.rut} onChangeText={(t) => setPerfil({...perfil, rut: t})} placeholder="Ej: 12.345.678-9" />
              
              <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
                <View style={{flex: 1}}><Text style={styles.labelPerfil}>Edad</Text><TextInput style={styles.inputPerfil} keyboardType="numeric" value={perfil.edad ? perfil.edad.toString() : ''} onChangeText={(t) => setPerfil({...perfil, edad: Number(t)})} placeholder="Años"/></View>
                <View style={{flex: 1}}><Text style={styles.labelPerfil}>Peso</Text><TextInput style={styles.inputPerfil} keyboardType="numeric" value={perfil.peso_kg ? perfil.peso_kg.toString() : ''} onChangeText={(t) => setPerfil({...perfil, peso_kg: Number(t)})} placeholder="Kg"/></View>
                <View style={{flex: 1}}><Text style={styles.labelPerfil}>Altura</Text><TextInput style={styles.inputPerfil} keyboardType="numeric" value={perfil.altura_cm ? perfil.altura_cm.toString() : ''} onChangeText={(t) => setPerfil({...perfil, altura_cm: Number(t)})} placeholder="cm"/></View>
              </View>
            </View>
          </View>

          <View style={styles.cardTimeline}>
             <View style={{flex: 1}}>
              <Text style={styles.tituloSeccion}>Tu Pauta Nutricional</Text>
              <Text style={styles.labelPerfil}>🔥 Calorías Diarias (Meta) *</Text><TextInput style={styles.inputPerfil} keyboardType="numeric" value={perfil.meta_calorias ? perfil.meta_calorias.toString() : ''} onChangeText={(t) => setPerfil({...perfil, meta_calorias: Number(t)})} placeholder="Ej: 1800" />
              <Text style={styles.labelPerfil}>🥩 Proteínas (g)</Text><TextInput style={styles.inputPerfil} keyboardType="numeric" value={perfil.meta_proteinas ? perfil.meta_proteinas.toString() : ''} onChangeText={(t) => setPerfil({...perfil, meta_proteinas: Number(t)})} placeholder="Ej: 130" />
              <Text style={styles.labelPerfil}>🍚 Glúcidos (g)</Text><TextInput style={styles.inputPerfil} keyboardType="numeric" value={perfil.meta_carbs ? perfil.meta_carbs.toString() : ''} onChangeText={(t) => setPerfil({...perfil, meta_carbs: Number(t)})} placeholder="Ej: 150" />
              <Text style={styles.labelPerfil}>🥑 Grasas (g)</Text><TextInput style={styles.inputPerfil} keyboardType="numeric" value={perfil.meta_grasas ? perfil.meta_grasas.toString() : ''} onChangeText={(t) => setPerfil({...perfil, meta_grasas: Number(t)})} placeholder="Ej: 50" />
             </View>
          </View>
          <TouchableOpacity style={[styles.botonAuth, {marginBottom: 80, marginTop: 10}]} onPress={() => guardarPerfil(true)}>
            {cargando ? <ActivityIndicator color="#fff"/> : <Text style={styles.textoBotonAuth}>Comenzar a usar NutriSofi</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
      
      {/* VISTA 1: DASHBOARD PRINCIPAL */}
      {vistaActual === 'dashboard' && (
        <View style={{ flex: 1 }}>
          
          <View style={styles.headerTop}>
            <Text style={styles.tituloApp}>NutriSofi</Text>
            <View style={{flexDirection: 'row', gap: 12}}>
              <TouchableOpacity style={styles.botonTuerca} onPress={() => setVistaActual('perfil')}><Text style={{fontSize: 20}}>⚙️</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => supabase.auth.signOut()} style={{justifyContent: 'center', marginLeft: 5}}><Text style={{color: colors.error, fontWeight: '700'}}>Salir</Text></TouchableOpacity>
            </View>
          </View>

          {/* CALENDARIO INTERACTIVO */}
          <View style={styles.calendarContainer}>
            {obtenerSemana().map((dia, idx) => {
              const isSelected = dia.toDateString() === fechaSeleccionada.toDateString();
              const isToday = dia.toDateString() === new Date().toDateString();
              
              return (
                <TouchableOpacity key={idx} style={styles.dayCol} onPress={() => setFechaSeleccionada(dia)}>
                  <Text style={[styles.dayText, isSelected && {color: colors.text, fontWeight: '800'}]}>
                    {isToday ? 'hoy' : diasSemanaNombres[idx]}
                  </Text>
                  <View style={[styles.dateCircle, isSelected && styles.dateCircleActive]}>
                    <Text style={[styles.dateText, isSelected && styles.dateTextActive]}>{dia.getDate()}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView style={styles.dashboardContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.seccionWrapper}>
              <Text style={{fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 10}}>Calorías ingeridas</Text>
              
              <View style={styles.cardProgreso}>
                <View style={styles.circuloCentral}>
                  <Text style={styles.numCaloriasGigante}>{Math.round(calRestantes)}</Text>
                  <Text style={styles.labelCaloriasCentral}>Calorías restantes</Text>
                </View>
                <View style={styles.macrosContainer}>
                  <MacroBar label="Proteínas" current={protConsumidas} total={perfil.meta_proteinas} color={colors.protein} />
                  <MacroBar label="Glúcidos" current={carbConsumidas} total={perfil.meta_carbs} color={colors.carbs} />
                  <MacroBar label="Grasa" current={grasasConsumidas} total={perfil.meta_grasas} color={colors.fat} />
                </View>
              </View>

              <Text style={styles.tituloSeccion}>Registrados este día</Text>
              
              {historialDia.length === 0 ? (
                <Text style={{textAlign: 'center', color: colors.textLight, marginTop: 20}}>No hay registros para esta fecha.</Text>
              ) : (
                historialDia.map((item, index) => (
                  // INTERACTIVIDAD: Al presionar, guardamos el item y mostramos el modal de detalles
                  <TimelineItem key={index} item={item} onPress={() => { setItemDetalle(item); setModalDetalleVisible(true); }} />
                ))
              )}
              
              <View style={{height: 120}} />
            </View>
          </ScrollView>

          {/* BOTÓN FLOTANTE (FAB) NEGRO */}
          {fechaSeleccionada.toDateString() === new Date().toDateString() && (
            <TouchableOpacity style={styles.fab} onPress={abrirCamaraDirecta} activeOpacity={0.9}>
              <Text style={{ color: 'white', fontSize: 36, fontWeight: '300', marginTop: -4 }}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* VISTA 1.5: PERFIL (AJUSTES) */}
      {vistaActual === 'perfil' && (
        <ScrollView style={[styles.dashboardContainer, {paddingHorizontal: 20, paddingTop: 20}]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
            <Text style={styles.tituloApp}>Ajustes</Text>
            <TouchableOpacity onPress={() => setVistaActual('dashboard')}><Text style={{color: colors.textLight, fontWeight: 'bold', fontSize: 16}}>Volver</Text></TouchableOpacity>
          </View>
          
          <View style={styles.cardTimeline}>
            <View style={{flex: 1}}>
              <Text style={styles.tituloSeccion}>Datos Personales</Text>
              <Text style={styles.labelPerfil}>Nombre</Text><TextInput style={styles.inputPerfil} value={perfil.nombre} onChangeText={(t) => setPerfil({...perfil, nombre: t})} />
              <Text style={styles.labelPerfil}>RUT</Text><TextInput style={styles.inputPerfil} value={perfil.rut} onChangeText={(t) => setPerfil({...perfil, rut: t})} />
              <View style={{flexDirection: 'row', gap: 10}}>
                <View style={{flex: 1}}><Text style={styles.labelPerfil}>Edad</Text><TextInput style={styles.inputPerfil} keyboardType="numeric" value={perfil.edad.toString()} onChangeText={(t) => setPerfil({...perfil, edad: Number(t)})} /></View>
                <View style={{flex: 1}}><Text style={styles.labelPerfil}>Peso (kg)</Text><TextInput style={styles.inputPerfil} keyboardType="numeric" value={perfil.peso_kg.toString()} onChangeText={(t) => setPerfil({...perfil, peso_kg: Number(t)})} /></View>
                <View style={{flex: 1}}><Text style={styles.labelPerfil}>Altura (cm)</Text><TextInput style={styles.inputPerfil} keyboardType="numeric" value={perfil.altura_cm.toString()} onChangeText={(t) => setPerfil({...perfil, altura_cm: Number(t)})} /></View>
              </View>
            </View>
          </View>

          <View style={styles.cardTimeline}>
             <View style={{flex: 1}}>
              <Text style={styles.tituloSeccion}>Tus Objetivos</Text>
              <Text style={styles.labelPerfil}>Calorías Diarias</Text><TextInput style={styles.inputPerfil} keyboardType="numeric" value={perfil.meta_calorias.toString()} onChangeText={(t) => setPerfil({...perfil, meta_calorias: Number(t)})} />
              <Text style={styles.labelPerfil}>Proteínas (g)</Text><TextInput style={styles.inputPerfil} keyboardType="numeric" value={perfil.meta_proteinas.toString()} onChangeText={(t) => setPerfil({...perfil, meta_proteinas: Number(t)})} />
              <Text style={styles.labelPerfil}>Glúcidos (g)</Text><TextInput style={styles.inputPerfil} keyboardType="numeric" value={perfil.meta_carbs.toString()} onChangeText={(t) => setPerfil({...perfil, meta_carbs: Number(t)})} />
              <Text style={styles.labelPerfil}>Grasas (g)</Text><TextInput style={styles.inputPerfil} keyboardType="numeric" value={perfil.meta_grasas.toString()} onChangeText={(t) => setPerfil({...perfil, meta_grasas: Number(t)})} />
             </View>
          </View>
          <TouchableOpacity style={[styles.botonAuth, {marginBottom: 50}]} onPress={() => guardarPerfil(false)}>
            {cargando ? <ActivityIndicator color="#fff"/> : <Text style={styles.textoBotonAuth}>Guardar Cambios</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* VISTA 2: CÁMARA INMERSIVA CON AYUDA */}
      {vistaActual === 'camara' && (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <CameraView style={styles.camera} facing="back" ref={cameraRef} />
          
          <SafeAreaView style={styles.headerCamaraOverlay}>
            <TouchableOpacity style={styles.botonCircularTransparente} onPress={() => setAyudaCamaraVisible(true)}><Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>?</Text></TouchableOpacity>
            <TouchableOpacity style={styles.botonCircularTransparente} onPress={() => setVistaActual('dashboard')}><Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✕</Text></TouchableOpacity>
          </SafeAreaView>
          
          <View style={styles.scannerFrameContainer}>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.topLeftCorner]} />
              <View style={[styles.corner, styles.topRightCorner]} />
              <View style={[styles.corner, styles.bottomLeftCorner]} />
              <View style={[styles.corner, styles.bottomRightCorner]} />
            </View>
          </View>

          <View style={styles.cameraModesContainer}>
            <View style={styles.cameraModeBtn}><Text style={styles.cameraModeIcon}>📷</Text><Text style={styles.cameraModeText}>Escanear ali...</Text></View>
            <View style={[styles.cameraModeBtn, {opacity: 0.7}]}><Text style={styles.cameraModeIcon}>🏷️</Text><Text style={styles.cameraModeText}>Código de...</Text></View>
            <View style={[styles.cameraModeBtn, {opacity: 0.7}]}><Text style={styles.cameraModeIcon}>📄</Text><Text style={styles.cameraModeText}>Etiqueta de...</Text></View>
            <View style={[styles.cameraModeBtn, {opacity: 0.7}]}><Text style={styles.cameraModeIcon}>🖼️</Text><Text style={styles.cameraModeText}>Galería</Text></View>
          </View>

          <View style={styles.overlayCamaraBottom}>
            <TouchableOpacity style={styles.captureButton} onPress={tomarFoto}><View style={styles.captureInnerButton} /></TouchableOpacity>
          </View>

          {/* Modal Explicativo de la Cámara */}
          <Modal animationType="fade" transparent={true} visible={ayudaCamaraVisible} onRequestClose={() => setAyudaCamaraVisible(false)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <View style={{ width: '100%', backgroundColor: colors.card, borderRadius: 24, padding: 30, alignItems: 'center' }}>
                <Text style={{fontSize: 40, marginBottom: 10}}>📷</Text>
                <Text style={{ fontSize: 22, fontWeight: '900', marginBottom: 15, color: colors.text, textAlign: 'center' }}>¿Cómo escanear?</Text>
                <Text style={{ fontSize: 16, color: colors.textLight, textAlign: 'center', marginBottom: 10, lineHeight: 22 }}>Asegúrate de que todo tu plato esté visible dentro del marco blanco de la pantalla.</Text>
                <Text style={{ fontSize: 16, color: colors.textLight, textAlign: 'center', marginBottom: 30, lineHeight: 22 }}>Toma la foto desde arriba con buena iluminación para que la IA analice tus alimentos.</Text>
                <TouchableOpacity style={[styles.botonAuth, {width: '100%'}]} onPress={() => setAyudaCamaraVisible(false)}><Text style={styles.textoBotonAuth}>Entendido</Text></TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      )}

      {/* VISTA 3: RESULTADOS */}
      {vistaActual === 'resultados' && (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <SafeAreaView style={{ backgroundColor: colors.card, paddingHorizontal: 20, paddingBottom: 15, paddingTop: Platform.OS === 'ios' ? 0 : 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setVistaActual('camara')}><Text style={{color: colors.textLight, fontSize: 16, fontWeight: '600'}}>Volver</Text></TouchableOpacity>
            <Text style={{color: colors.text, fontSize: 18, fontWeight:'900'}}>Confirmar</Text><View style={{width: 60}} />
          </SafeAreaView>

          {cargando ? (
             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
               <ActivityIndicator size="large" color={colors.text} /><Text style={{ marginTop: 20, color: colors.textLight, fontSize: 16, fontWeight: '600' }}>Procesando imagen...</Text>
             </View>
          ) : (
            <ScrollView style={{ flex: 1, padding: 20 }}>
              <Image source={{ uri: fotoUri! }} style={styles.previewImageMini} />
              {resultadosDB.length > 0 ? (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
                    <Text style={styles.tituloSeccion}>Alimentos detectados</Text>
                    <TouchableOpacity onPress={() => { setItemAEditar(-1); setTextoCorreccion(''); setCantidadModal(1); setModalVisible(true); }}><Text style={{ color: colors.text, fontWeight: '900', fontSize: 24, marginTop: -15 }}>+</Text></TouchableOpacity>
                  </View>

                  {resultadosDB.map((item, index) => (
                    <View key={index} style={styles.itemResultadoLight}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: item.encontrado ? colors.text : colors.protein, fontSize: 16, fontWeight: '800' }}>{item.encontrado ? item.nombre_db : `${item.nombre_db} (No BD)`}</Text>
                        <Text style={{ color: colors.textLight, fontSize: 14, marginTop: 4, fontWeight: '600' }}>{item.cantidad_porciones}x porción</Text>
                        <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16, marginTop: 4 }}>{Math.round(item.calorias_base * item.cantidad_porciones)} kcal</Text>
                      </View>
                      <View style={{flexDirection: 'row', gap: 15}}>
                         <TouchableOpacity onPress={() => { setItemAEditar(index); setTextoCorreccion(item.nombre_db); setCantidadModal(item.cantidad_porciones); setModalVisible(true); }}><Text style={{ fontSize: 20 }}>✏️</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => { const nl = [...resultadosDB]; nl.splice(index, 1); setResultadosDB(nl); recalcularTotal(nl); }}><Text style={{ fontSize: 20 }}>🗑️</Text></TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  <View style={styles.totalBoxLight}>
                    <Text style={{ fontSize: 16, color: colors.background, fontWeight: '600' }}>Total a Registrar</Text>
                    <Text style={{ fontSize: 40, fontWeight: '900', color: colors.card }}>{totalCaloriasPlato} kcal</Text>
                  </View>
                  
                  <TouchableOpacity style={[styles.botonAuth, {marginBottom: 40}]} onPress={guardarHistorialYFeedback}><Text style={styles.textoBotonAuth}>Guardar en Diario</Text></TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.botonAuth} onPress={analizarPlato}><Text style={styles.textoBotonAuth}>🔍 Analizar Plato</Text></TouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: EDICIÓN DE CANTIDAD */}
      {/* ==================================================== */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', backgroundColor: colors.card, borderRadius: 24, padding: 30 }}>
            <Text style={{ fontSize: 24, fontWeight: '900', marginBottom: 20, color: colors.text, textAlign: 'center' }}>{itemAEditar === -1 ? "Añadir alimento" : "Ajustar porción"}</Text>
            <TextInput style={[styles.inputAuth, {backgroundColor: colors.background}]} placeholder="Ej: Arroz" value={textoCorreccion} onChangeText={setTextoCorreccion} placeholderTextColor={colors.textLight} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 10 }}>
              <Text style={{ fontSize: 16, color: colors.textLight, fontWeight: '700' }}>Cantidad:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={styles.botonCircularTransparente} onPress={() => setCantidadModal(Math.max(0.25, cantidadModal - 0.25))}><Text style={{fontSize: 24, fontWeight: '900', color: colors.text}}>-</Text></TouchableOpacity>
                <Text style={{ fontSize: 24, fontWeight: '900', marginHorizontal: 20, color: colors.text }}>{cantidadModal}</Text>
                <TouchableOpacity style={styles.botonCircularTransparente} onPress={() => setCantidadModal(cantidadModal + 0.25)}><Text style={{fontSize: 24, fontWeight: '900', color: colors.text}}>+</Text></TouchableOpacity>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.botonAuth, { flex: 1, backgroundColor: colors.border }]} onPress={() => setModalVisible(false)}><Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.botonAuth, { flex: 1 }]} onPress={procesarModal}><Text style={styles.textoBotonAuth}>Listo</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 2: DETALLE DE COMIDA (NUEVO) */}
      {/* ==================================================== */}
      <Modal animationType="slide" transparent={true} visible={modalDetalleVisible} onRequestClose={() => setModalDetalleVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={styles.modalDetalleContenedor}>
            {itemDetalle && (
              <>
                <Image 
                  source={{ uri: itemDetalle.ruta_foto ? supabase.storage.from('fotos_comida').getPublicUrl(itemDetalle.ruta_foto).data.publicUrl : '[https://via.placeholder.com/400?text=Sin+Foto](https://via.placeholder.com/400?text=Sin+Foto)' }} 
                  style={styles.modalDetalleImagen} 
                />
                
                <Text style={styles.modalDetalleTitulo}>{itemDetalle.alimento_nombre}</Text>
                <Text style={styles.modalDetalleSubtitulo}>{itemDetalle.tipo_comida} • {new Date(itemDetalle.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>

                <View style={{flexDirection: 'row', alignItems: 'flex-end', marginBottom: 25}}>
                   <Text style={{fontSize: 48, fontWeight: '900', color: colors.text, letterSpacing: -2}}>{Math.round(itemDetalle.calorias)}</Text>
                   <Text style={{fontSize: 18, color: colors.textLight, fontWeight: '700', marginLeft: 6, marginBottom: 8}}>kcal</Text>
                </View>

                <View style={styles.macrosDetalleContainer}>
                  <View style={styles.macroDetalleBox}>
                    <View style={[styles.puntoMacro, {backgroundColor: colors.protein, width: 14, height: 14, borderRadius: 7}]} />
                    <Text style={styles.macroDetalleValor}>{Math.round(itemDetalle.proteinas)}g</Text>
                    <Text style={styles.macroDetalleLabel}>Proteínas</Text>
                  </View>
                  <View style={styles.macroDetalleBox}>
                    <View style={[styles.puntoMacro, {backgroundColor: colors.carbs, width: 14, height: 14, borderRadius: 7}]} />
                    <Text style={styles.macroDetalleValor}>{Math.round(itemDetalle.carbohidratos)}g</Text>
                    <Text style={styles.macroDetalleLabel}>Glúcidos</Text>
                  </View>
                  <View style={styles.macroDetalleBox}>
                    <View style={[styles.puntoMacro, {backgroundColor: colors.fat, width: 14, height: 14, borderRadius: 7}]} />
                    <Text style={styles.macroDetalleValor}>{Math.round(itemDetalle.grasas)}g</Text>
                    <Text style={styles.macroDetalleLabel}>Grasas</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.botonAuth} onPress={() => setModalDetalleVisible(false)}>
                  <Text style={styles.textoBotonAuth}>Cerrar Detalle</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
