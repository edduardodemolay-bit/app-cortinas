import { formatBRL } from '@cortinas/shared';
import { Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, sizes } from '@/ui/theme';

export default function Home() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Orçamentos' }} />
      <Text style={styles.title}>Nenhum orçamento ainda</Text>
      <Text style={styles.body}>Total em aberto: {formatBRL(0)}</Text>
      <Pressable accessibilityRole="button" style={styles.button}>
        <Text style={styles.buttonText}>Novo orçamento</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: sizes.gutter, gap: 16, justifyContent: 'center' },
  title: { fontSize: sizes.fontTitle, fontWeight: '700', color: colors.text },
  body: { fontSize: sizes.fontBody, color: colors.textMuted },
  button: {
    minHeight: sizes.touchTarget,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 20, fontWeight: '700', color: colors.onPrimary },
});
