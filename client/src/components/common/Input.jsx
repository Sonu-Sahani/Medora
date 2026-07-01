const Input = ({ label, error, type = "text", className = "", ...rest }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`input-field ${
          error ? "border-danger focus:ring-danger" : ""
        } ${className}`}
        {...rest}
      />
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;