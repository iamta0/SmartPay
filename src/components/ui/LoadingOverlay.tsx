// src/components/ui/LoadingOverlay.tsx
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { Colors, FontSize } from '@/utils/theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = 'Please wait…' }: LoadingOverlayProps) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  box: {
    backgroundColor: Colors.white,
    borderRadius:    20,
    padding:         32,
    alignItems:      'center',
    gap:             16,
    minWidth:        160,
  },
  text: { fontSize: FontSize.sm, color: Colors.gray500, marginTop: 4 },
});
