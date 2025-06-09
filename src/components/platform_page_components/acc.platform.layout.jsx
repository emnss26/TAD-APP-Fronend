import React from "react";

import ACCPlatformprojectsHeader from "./acc.platform.header.projects";
import ACCSidebar from "./platform.acc.sidebar";
import { Footer } from "../general_pages_components/general.pages.footer";

const ACCPlatformLayout = ({ children, projectId, accountId }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <ACCPlatformprojectsHeader projectId={projectId} accountId={accountId} />
      <div className="flex flex-1 pt-16">
        <ACCSidebar />
        <main className="flex-1 p-3 overflow-y-auto">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default ACCPlatformLayout;
