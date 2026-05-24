import "./Toast.css";

export default function Toast({ visible, message }) {
  return (
    <div className={`toast ${visible ? "show" : ""}`}>
      {message}
    </div>
  );
}