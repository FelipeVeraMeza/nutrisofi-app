import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles, colors } from '../theme/globalStyles';
import { supabase } from '../../supabase';

export const TimelineItem = ({ item, onPress }: any) => {
  // Obtenemos la URL pública de la foto guardada en Supabase o usamos una imagen de reemplazo limpia
  const urlFoto = item.ruta_foto 
    ? supabase.storage.from('fotos_comida').getPublicUrl(item.ruta_foto).data.publicUrl 
    : '[https://via.placeholder.com/150/E5E7EB/9CA3AF?text=Comida](https://via.placeholder.com/150/E5E7EB/9CA3AF?text=Comida)';
    
  const hora = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <TouchableOpacity style={styles.cardTimeline} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: urlFoto }} style={styles.fotoTimeline} />
      <View style={styles.infoTimeline}>
        <View style={styles.headerTimeline}>
          <Text style={styles.tituloTimeline} numberOfLines={1}>{item.alimento_nombre}</Text>
          <Text style={styles.horaTimeline}>{hora}</Text>
        </View>
        <View style={styles.caloriasTimelineRow}>
          <Text style={{fontSize: 16}}>🔥</Text>
          <Text style={styles.caloriasTimelineText}>{Math.round(item.calorias)}kcal</Text>
        </View>
        <View style={styles.macrosTimelineRow}>
          <View style={styles.macroMiniItem}><View style={[styles.puntoMacro, {backgroundColor: colors.protein}]} /><Text style={styles.textoMiniMacro}>{Math.round(item.proteinas)}g</Text></View>
          <View style={styles.macroMiniItem}><View style={[styles.puntoMacro, {backgroundColor: colors.carbs}]} /><Text style={styles.textoMiniMacro}>{Math.round(item.carbohidratos)}g</Text></View>
          <View style={styles.macroMiniItem}><View style={[styles.puntoMacro, {backgroundColor: colors.fat}]} /><Text style={styles.textoMiniMacro}>{Math.round(item.grasas)}g</Text></View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
