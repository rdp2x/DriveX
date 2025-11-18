import "../app/loader.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function LoadingSpinner({ 
  size = "medium", 
  className = "" 
}: LoadingSpinnerProps) {
  const sizeStyles = {
    small: { height: "30px" },
    medium: { height: "60px" },
    large: { height: "90px" },
  };

  return (
    <div 
      className={`loader ${className}`} 
      style={sizeStyles[size]}
    />
  );
}
