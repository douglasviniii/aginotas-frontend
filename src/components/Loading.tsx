// LogoLoading.tsx
import React from "react";

interface LogoLoadingProps {
  size?: number;
  text?: string; 
}

export const LogoLoading: React.FC<LogoLoadingProps> = ({
  size = 80,
  text,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-4">
      <img
        src={'src/public/aginotaslogoescura.svg'}
        alt="Logo"
        style={{ width: size, height: size }}
        className="animate-fadeInOut"
      />
      {text && <span className="text-gray-600 font-medium">{text}</span>}
    </div>
  );
};
