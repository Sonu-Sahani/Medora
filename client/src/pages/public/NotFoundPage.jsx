import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
      <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
      <p className="text-slate-500 mb-6">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn-primary">
        Go back home
      </Link>
    </div>
  );
};

export default NotFoundPage;