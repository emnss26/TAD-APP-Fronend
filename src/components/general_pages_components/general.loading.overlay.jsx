import tad from "../../../public/tad.svg";

const LoadingOverlay = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
    <img src={tad} alt="loading" width={250} />
  </div>
);

export default LoadingOverlay;
