import { Loader2 } from 'lucide-react';
import { baseButtonStyles, variantStyles } from './Button.styles';

type ButtonVariant = 'default' | 'ghost' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isGenerating?: boolean;
  variant?: ButtonVariant;
}

export default function Button({
  isGenerating,
  variant = 'default',
  onClick,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={isGenerating || props.disabled}
      onClick={onClick}
      className={`${baseButtonStyles} ${variantStyles[variant]} ${className || ''}`}
      {...props}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        children || 'Generate AAS'
      )}
    </button>
  );
}
