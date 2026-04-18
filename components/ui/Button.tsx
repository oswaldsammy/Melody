import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  label: string;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-brand-primary',
    text: 'text-text-primary font-semibold',
  },
  secondary: {
    container: 'bg-bg-surface border border-border-default',
    text: 'text-text-primary font-semibold',
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-brand-primary font-semibold',
  },
  destructive: {
    container: 'bg-status-error',
    text: 'text-text-primary font-semibold',
  },
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'px-4 py-2 rounded-md', text: 'text-sm' },
  md: { container: 'px-6 py-3 rounded-lg', text: 'text-base' },
  lg: { container: 'px-8 py-4 rounded-xl', text: 'text-lg' },
};

export function Button({ variant = 'primary', size = 'md', loading, label, disabled, style, ...props }: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      className={`items-center justify-center ${v.container} ${s.container} ${isDisabled ? 'opacity-40' : 'opacity-100'}`}
    >
      {loading ? (
        <ActivityIndicator color="#FAFAFA" size="small" />
      ) : (
        <Text className={`${v.text} ${s.text}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
