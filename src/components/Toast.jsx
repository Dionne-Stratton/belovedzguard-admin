import { useEffect } from "react";
import "./Toast.css";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`} onClick={onClose}>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Toast;
