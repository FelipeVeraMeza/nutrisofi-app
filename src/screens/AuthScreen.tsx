import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { styles, colors } from '../theme/globalStyles';

export const AuthScreen = ({ email, setEmail, password, setPassword, modoRegistro, setModoRegistro, manejarAuth, cargando }: any) => (
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.containerAuth}>
    <View style={styles.authBox}>
      <Text style={styles.tituloAuth}>NutriSofi</Text>
      <Text style={styles.subtituloAuth}>{modoRegistro ? 'Únete y transforma tu dieta' : 'Bienvenido de nuevo'}</Text>
      
      <TextInput style={styles.inputAuth} placeholder="Correo electrónico" placeholderTextColor={colors.textLight} value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.inputAuth} placeholder="Contraseña" placeholderTextColor={colors.textLight} value={password} onChangeText={setPassword} secureTextEntry />
      
      <TouchableOpacity style={styles.botonAuth} onPress={manejarAuth}>
        {cargando ? <ActivityIndicator color="#fff"/> : <Text style={styles.textoBotonAuth}>{modoRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setModoRegistro(!modoRegistro)} style={{ marginTop: 25, paddingVertical: 10 }}>
        <Text style={{ textAlign: 'center', color: colors.textLight, fontWeight: '700' }}>{modoRegistro ? '¿Ya tienes cuenta? Entra aquí' : '¿Nuevo aquí? Regístrate'}</Text>
      </TouchableOpacity>
    </View>
  </KeyboardAvoidingView>
);
