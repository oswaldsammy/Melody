import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <View
      {...props}
      className={`bg-bg-surface border border-border-default rounded-xl p-4 ${className}`}
    >
      {children}
    </View>
  );
}
