import { StyleSheet, Platform } from 'react-native';

export const colors = {
  background: '#F9FAFB', 
  card: '#FFFFFF',
  text: '#111827',       
  textLight: '#9CA3AF',
  primary: '#000000',    
  protein: '#FF6B6B',    
  carbs: '#4CD964',      
  fat: '#5AC8FA',        
  border: '#F3F4F6',
  error: '#FF3B30',
  success: '#34C759'
};

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  
  // TOASTS
  toastContainer: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, right: 20, padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', zIndex: 9999, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 10 },
  toastError: { backgroundColor: colors.error },
  toastSuccess: { backgroundColor: colors.text },
  toastText: { color: 'white', fontWeight: '700', fontSize: 15, marginLeft: 10 },

  // LOGIN & ONBOARDING
  containerAuth: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
  authBox: { width: '100%', backgroundColor: colors.card, padding: 30, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  inputAuth: { backgroundColor: colors.background, borderRadius: 16, padding: 16, fontSize: 16, marginBottom: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  botonAuth: { backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  textoBotonAuth: { color: 'white', fontWeight: '800', fontSize: 16 },
  tituloAuth: { fontSize: 36, fontWeight: '900', color: colors.text, marginBottom: 10, textAlign: 'center', letterSpacing: -1 },
  subtituloAuth: { fontSize: 15, color: colors.textLight, textAlign: 'center', marginBottom: 30, fontWeight: '500' },

  // HEADER Y CALENDARIO INTERACTIVO
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  tituloApp: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  botonTuerca: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  
  calendarContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  dayCol: { alignItems: 'center', width: 44 },
  dayText: { fontSize: 13, color: colors.textLight, marginBottom: 8, fontWeight: '600', textTransform: 'capitalize' },
  dateCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  dateCircleActive: { backgroundColor: colors.text },
  dateText: { fontSize: 17, fontWeight: '800', color: colors.text },
  dateTextActive: { color: 'white' },

  // DASHBOARD PRINCIPAL
  dashboardContainer: { flex: 1 },
  seccionWrapper: { paddingHorizontal: 20 },
  tituloSeccion: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 15, letterSpacing: -0.5 },
  
  cardProgreso: { backgroundColor: colors.card, borderRadius: 32, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.03, shadowRadius: 15, elevation: 2, marginBottom: 25, alignItems: 'center' },
  circuloCentral: { width: 170, height: 170, borderRadius: 85, borderWidth: 10, borderColor: colors.text, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  numCaloriasGigante: { fontSize: 44, fontWeight: '900', color: colors.text, letterSpacing: -1.5 },
  labelCaloriasCentral: { fontSize: 13, color: colors.textLight, fontWeight: '600' },
  
  macrosContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  macroCol: { flex: 1, paddingHorizontal: 6 },
  macroHeader: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  macroNum: { fontSize: 15, fontWeight: '800', color: colors.text },
  macroTotal: { fontSize: 11, color: colors.textLight, fontWeight: '700', marginLeft: 2 },
  barraFondo: { width: '100%', height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  barraRelleno: { height: '100%', borderRadius: 3 },
  macroLabel: { fontSize: 12, color: colors.textLight, fontWeight: '700' },

  // LISTA DEL HISTORIAL (TIMELINE)
  cardTimeline: { backgroundColor: colors.card, borderRadius: 24, padding: 16, marginBottom: 12, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 1 },
  fotoTimeline: { width: 75, height: 75, borderRadius: 18, backgroundColor: colors.border, marginRight: 16 },
  infoTimeline: { flex: 1, justifyContent: 'space-between', paddingVertical: 2 },
  headerTimeline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tituloTimeline: { fontSize: 16, fontWeight: '800', color: colors.text, flex: 1, marginRight: 10 },
  horaTimeline: { fontSize: 12, color: colors.textLight, fontWeight: '600' },
  caloriasTimelineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  caloriasTimelineText: { fontSize: 16, fontWeight: '900', color: colors.text, marginLeft: 6 },
  macrosTimelineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  macroMiniItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  puntoMacro: { width: 8, height: 8, borderRadius: 4 },
  textoMiniMacro: { fontSize: 12, color: colors.textLight, fontWeight: '700' },

  // BOTÓN FLOTANTE (FAB)
  fab: { position: 'absolute', bottom: 35, alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 8 },

  // CÁMARA INMERSIVA
  camera: { flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  headerCamaraOverlay: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 10 },
  botonCircularTransparente: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  scannerFrameContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none', marginTop: -50 },
  scannerFrame: { width: 280, height: 280 },
  corner: { width: 30, height: 30, borderColor: 'white', position: 'absolute' },
  topLeftCorner: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 20 },
  topRightCorner: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 20 },
  bottomLeftCorner: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 20 },
  bottomRightCorner: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 20 },
  cameraModesContainer: { position: 'absolute', bottom: 130, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 10, paddingHorizontal: 15 },
  cameraModeBtn: { backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 16, paddingHorizontal: 12, borderRadius: 18, alignItems: 'center', width: 85 },
  cameraModeIcon: { fontSize: 26, marginBottom: 6 },
  cameraModeText: { fontSize: 10, fontWeight: '800', color: colors.text, textAlign: 'center' },
  overlayCamaraBottom: { position: 'absolute', bottom: 35, width: '100%', justifyContent: 'center', alignItems: 'center' },
  captureButton: { width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255, 255, 255, 0.4)', justifyContent: 'center', alignItems: 'center' },
  captureInnerButton: { width: 62, height: 62, borderRadius: 31, backgroundColor: 'white' },

  // RESULTADOS IA
  previewImageMini: { width: '100%', height: 250, borderRadius: 24, resizeMode: 'cover', marginBottom: 25 },
  itemResultadoLight: { backgroundColor: colors.card, borderRadius: 20, padding: 20, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1 },
  totalBoxLight: { backgroundColor: colors.text, padding: 25, borderRadius: 24, alignItems: 'center', marginVertical: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 5 },
  
  // PERFIL
  labelPerfil: { fontSize: 14, fontWeight: '700', color: colors.textLight, marginBottom: 8, marginTop: 15 },
  inputPerfil: { backgroundColor: colors.card, borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '600', color: colors.text, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },

  // MODAL DETALLE DE COMIDA (NUEVO)
  modalDetalleContenedor: { width: '100%', backgroundColor: colors.card, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, elevation: 20 },
  modalDetalleImagen: { width: '100%', height: 260, borderRadius: 24, marginBottom: 25 },
  modalDetalleTitulo: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: 4, letterSpacing: -0.5 },
  modalDetalleSubtitulo: { fontSize: 15, color: colors.textLight, marginBottom: 25, fontWeight: '600', textTransform: 'uppercase' },
  macrosDetalleContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 30 },
  macroDetalleBox: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  macroDetalleValor: { fontSize: 20, fontWeight: '900', color: colors.text, marginTop: 8 },
  macroDetalleLabel: { fontSize: 13, color: colors.textLight, fontWeight: '700', marginTop: 2 },
});
