import React, {
    useEffect,
    useRef,
    useState,
    useMemo,
    useCallback,
  } from "react";
  
  import { useParams } from "react-router-dom";
  import { useCookies } from "react-cookie";
  
import BIM360PlatformprojectsHeader from "../../components/platform_page_components/bim360.platform.header.projects";
import { Footer } from "../../components/general_pages_components/general.pages.footer";
import BIM360SideBar from "../../components/platform_page_components/platform.bim360.sidebar";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";

import { data5Dviewer } from "../../utils/Viewers/5D.viewer";