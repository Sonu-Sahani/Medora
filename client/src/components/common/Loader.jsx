const Loader = ({ fullScreen = false }) => {
  const wrapperClass = fullScreen
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center py-10";

  return (
    <div className={wrapperClass}>
      <div className="h-10 w-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
};

export default Loader;