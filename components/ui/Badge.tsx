import { View, Text } from 'react-native';

type BadgeVariant = 'new' | 'active' | 'pending' | 'error' | 'default' | 'confirmed' | 'completed' | 'cancelled' | 'disputed' | 'in_progress';

const styles: Record<BadgeVariant, { bg: string; text: string }> = {
  new:       { bg: 'bg-indigo-500',         text: 'text-text-primary' },
  active:    { bg: 'bg-status-success',     text: 'text-bg-primary' },
  confirmed: { bg: 'bg-status-success',     text: 'text-bg-primary' },
  completed: { bg: 'bg-indigo-400',         text: 'text-bg-primary' },
  pending:   { bg: 'bg-status-warning',     text: 'text-bg-primary' },
  error:     { bg: 'bg-status-error',       text: 'text-text-primary' },
  disputed:  { bg: 'bg-status-error',       text: 'text-text-primary' },
  cancelled: { bg: 'bg-bg-surface',         text: 'text-text-muted' },
  in_progress:{ bg: 'bg-indigo-600',        text: 'text-text-primary' },
  default:   { bg: 'bg-bg-surface',         text: 'text-text-muted' },
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const s = styles[variant] ?? styles.default;
  return (
    <View className={`px-2 py-1 rounded-md ${s.bg}`}>
      <Text className={`text-xs font-medium capitalize ${s.text}`}>{label}</Text>
    </View>
  );
}
