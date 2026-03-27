import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../theme/globalStyles';

export const MacroBar = ({ label, current, total, color }: any) => {
  const porcentaje = Math.min(100, Math.max(0, (total && total > 0) ? (current / total) * 100 : 0));
  return (
    <View style={styles.macroCol}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroNum}>{Math.round(current)}</Text>
        <Text style={styles.macroTotal}>/{total}g</Text>
      </View>
      <View style={styles.barraFondo}>
        <View style={[styles.barraRelleno, { width: `${porcentaje}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
};
