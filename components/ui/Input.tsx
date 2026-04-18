import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="text-text-muted text-xs font-medium mb-2 uppercase tracking-widest">{label}</Text>}
      <TextInput
        {...props}
        placeholderTextColor="#A1A1AA"
        className={`bg-bg-surface border rounded-lg px-4 py-3 text-base text-text-primary ${
          error ? 'border-status-error' : 'border-border-default'
        }`}
      />
      {error && <Text className="text-status-error text-xs mt-1">{error}</Text>}
    </View>
  );
}
