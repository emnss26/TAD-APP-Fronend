import React from "react";

import BIM360PlatformprojectsHeader from "./bim360.platform.header.projects";
import BIM360Sidebar from "./platform.bim360.sidebar";
import { Footer } from "../general_pages_components/general.pages.footer";

const BIM360PlatformLayout = ({ children, projectId, accountId }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BIM360PlatformprojectsHeader projectId={projectId} accountId={accountId} />
      <div className="flex flex-1 pt-16">
        <BIM360Sidebar />
        <main className="flex-1 p-3 overflow-y-auto">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default BIM360PlatformLayout;
