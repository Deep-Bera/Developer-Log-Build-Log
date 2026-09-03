export default async function createLog({ projectId, entryType, content, tags, token, apiUrl }) {
  try {
    const response = await fetch(`${apiUrl}/api/logs/${projectId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify({ entryType, content, tags }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to create log",
      };
    }

    return { success: true, log: data.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
