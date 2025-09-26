import React, { useState } from "react";

interface TooltipButtonProps {
  tooltipText: string;
}

const TooltipButton: React.FC<TooltipButtonProps> = ({ tooltipText }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span style={styles.wrapper}>
      <button
        style={styles.questionButton}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        ?
      </button>
      {isHovered && (
        <div style={styles.tooltip}>
          {tooltipText.split("\n").map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </div>
      )}
    </span>
  );
};

const styles = {
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
    position: "relative" as const,
  },
  tooltip: {
    backgroundColor: "#333",
    color: "#fff",
    textAlign: "center" as const,
    borderRadius: "4px",
    padding: "5px",
    fontSize: "12px",
    position: "absolute" as const,
    zIndex: 1 as const,
    bottom: "125%",
    left: "50%",
    transform: "translateX(-50%)",
    whiteSpace: "nowrap" as const,
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  questionButton: {
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "5px",
  },
};

export default TooltipButton;