import axios from "axios";

export default async function createLog({
  projectId,
  entryType,
  content,
  tags,
  token,
  apiUrl,
}) {
  try {
    const response = await axios.post(
      `${apiUrl}/api/logs/${projectId}`,
      { entryType, content, tags },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      },
    );

    return { success: true, log: response.data.data };
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Failed to create log";
    return { success: false, message };
  }
}
