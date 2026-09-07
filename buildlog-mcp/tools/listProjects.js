// this will not be used in the web version this will only be used for any MCP client like cursor 

import axios from "axios";

export default async function listProjects({ token, apiUrl }) {
  try {
    const response = await axios.get(`${apiUrl}/api/projects`, {
      headers: {
        Authorization: token,
      },
    });

    return { success: true, projects: response.data };
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Failed to fetch projects";
    return { success: false, message };
  }
}
