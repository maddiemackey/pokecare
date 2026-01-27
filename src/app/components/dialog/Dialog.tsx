import { useEffect, useState, useRef } from "react";
import "./Dialog.css";

type DialogProps = {
  message: string;
  onComplete?: () => void;
};

export default function Dialog({ message, onComplete }: DialogProps) {
  const [visibleText, setVisibleText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setVisibleText("");
    setIsDone(false);

    let index = 0;

    intervalRef.current = setInterval(() => {
      index++;
      setVisibleText(message.slice(0, index));

      if (index >= message.length) {
        clearInterval(intervalRef.current!);
        setIsDone(true);
      }
    }, 30);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [message]);

  const handleAdvance = () => {
    if (!isDone) {
      setVisibleText(message);
      setIsDone(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      onComplete?.();
    }
  };

  return (
    <div className="outer-dialog-box" onClick={handleAdvance}>
      <div className="dialog-box">
        <span className="dialog-ghost">{message}</span>
        <span className="dialog-visible">{visibleText}</span>
        {isDone && <span className="continue-indicator">▼</span>}
      </div>
    </div>
  );
}
