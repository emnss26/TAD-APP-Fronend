import tadLoading from "../../../public/tadLoading.svg";

const LoadingOverlay = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
    <img src={tadLoading} alt="loading" width={250} />
  </div>
);

export default LoadingOverlay;
