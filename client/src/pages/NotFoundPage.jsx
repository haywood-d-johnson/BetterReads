import { Link } from "react-router-dom";
import EmptyState from "../components/shared/EmptyState.jsx";
export default function NotFoundPage() {
  return (
    <EmptyState
      icon="404"
      title="Page Not Found"
      message="The page you are looking for does not exist."
      action={
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      }
    />
  );
}
