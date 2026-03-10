import Loader from "./Loader";

export default function LoaderFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader label="Synchronizing Saga..." />
    </div>
  );
}
