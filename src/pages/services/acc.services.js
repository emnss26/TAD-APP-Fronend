const backendUrl = import.meta.env.VITE_API_BACKEND_BASE_URL;

export const fetchACCProjectsData = async (token) => {
  try {
    const response = await fetch(`${backendUrl}/acc/accprojects`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const { data } = await response.json();

    //console.log("ACC Projects Data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching ACC projects data:", error);
    throw error;
  }
};

export const fetchACCProjectData = async (projectId, token, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/acc/accprojects/${accountId}/${projectId}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const { data } = await response.json();

    //console.log("ACC Project Data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching ACC project data:", error);
    throw error;
  }
};

const toBase64 = async (str) => {
  const bytes = new TextEncoder().encode(str);
  return btoa(String.fromCharCode(...bytes));
};

export const fetchACCFederatedModel = async (projectId, token, accountId) => {
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

    //console.log("ACC Federated Model:", data.federatedmodel);

    return data.federatedmodel ? await toBase64(data.federatedmodel) : null;
  } catch (error) {
    console.error("Error fetching federated model:", error);
    throw error;
  }
};

export const fechACCProjectUsers = async (projectId, token, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/acc/accprojects/${accountId}/${projectId}/users`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const { data } = await response.json();

    //console.log("ACC Project Users:", data.users);

    return data;
  } catch (error) {
    console.error("Error fetching project users:", error);
    throw error;
  }
};

export const fechACCProjectIssues = async (projectId, token, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/acc/accprojects/${accountId}/${projectId}/issues`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const { data } = await response.json();

    //console.log("ACC Project Issues:", data.issues);

    return data;
  } catch (error) {
    console.error("Error fetching project issues:", error);
    throw error;
  }
};

export const fetchACCProjectRFI = async (projectId, token, accountId) => {
  try {
    const response = await fetch(
      `${backendUrl}/acc/accprojects/${accountId}/${projectId}/rfis`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const { data } = await response.json();

    //console.log("ACC Project RFI:", data.rfis);

    return data;
  } catch (error) {
    console.error("Error fetching project RFI:", error);
    throw error;
  }
};

export const fetchACCProjectSubmittals = async (
  projectId,
  token,
  accountId
) => {
  try {
    const response = await fetch(
      `${backendUrl}/acc/accprojects/${accountId}/${projectId}/submittals`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const { data } = await response.json();

    //console.log("ACC Project Submittals:", data.submittals);

    return data;
  } catch (error) {
    console.error("Error fetching project submittals:", error);
    throw error;
  }
};
