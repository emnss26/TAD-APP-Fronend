import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-xl font-bold">An error has occurred.</h1>
          <p className="text-gray-600">Please reload the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
