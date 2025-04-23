const backendUrl = import.meta.env.VITE_API_BACKEND_BASE_URL;

export const fetchBIM360ProjectsData = async (access_token) => {
  try {
    const response = await fetch(`${backendUrl}/bim360/bim360projects/`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const { data } = await response.json();

    //console.log("BIM360 Projects Data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching BIM360 projects data:", error);
    throw error;
  }
};

export const fetchBIM360ProjectData = async (
  projectId,
  access_token,
  accountId
) => {
  try {
    const response = await fetch(
      `${backendUrl}/bim360/bim360projects/${accountId}/${projectId}`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const { data } = await response.json();

    //console.log("BIM360 Project Data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching bim360 project data:", error);
    throw error;
  }
};

const toBase64 = async (str) => {
  const bytes = new TextEncoder().encode(str);
  return btoa(String.fromCharCode(...bytes));
};

export const fetchBIM360FederatedModel = async (
  projectId,
  access_token,
  accountId
) => {
  try {
    const response = await fetch(
      `${backendUrl}/datamanagement/items/${accountId}/${projectId}/federatedmodel`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const { data } = await response.json();
    return data.federatedmodel ? await toBase64(data.federatedmodel) : null;
  } catch (error) {
    console.error("Error fetching federated model:", error);
    throw error;
  }
};

export const fechBIM360ProjectUsers = async (
  projectId,
  access_token,
  accountId
) => {
  try {
    const response = await fetch(
      `${backendUrl}/bim360/bim360projects/${accountId}/${projectId}/users`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const { data } = await response.json();

    //console.log("BIM360 Users Data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching project users:", error);
    throw error;
  }
};

export const fechBIM360ProjectIssues = async (
  projectId,
  access_token,
  accountId
) => {
  try {
    const response = await fetch(
      `${backendUrl}/bim360/bim360projects/${accountId}/${projectId}/issues`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const { data } = await response.json();

    //console.log("BIM360 Issues Data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching project issues:", error);
    throw error;
  }
};

export const fetchBIM360ProjectRFI = async (
  projectId,
  access_token,
  accountId
) => {
  try {
    const response = await fetch(
      `${backendUrl}/bim360/bim360projects/${accountId}/${projectId}/rfis`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const { data } = await response.json();

    //console.log("BIM360 RFIs Data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching project RFI:", error);
    throw error;
  }
};
