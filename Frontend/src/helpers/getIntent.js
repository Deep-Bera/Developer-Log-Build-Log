import axios from "../axiosConfig/axiosConfig";

// AI intent check fails then this will be executed..
export const isCreateLogIntent = (query) => {
  const keywords = [
    "create a log from git",
    "log from git",
    "log from my commit",
    "log from latest commit",
    "log from diff",
    "capture git diff",
    "create log from commit",
  ];
  return keywords.some((k) => query.toLowerCase().includes(k));
};

// categorize user intent using Gemini via backend (Option A)..
const getIntent = async (query, token) => {
  try {
    const res = await axios.post(
      "/api/ask/intent",
      { query },
      { headers: { Authorization: token } },
    );
    return res.data?.intent || "SEARCH";
  } catch (err) {
    console.log("Intent classification fallback:", err.message);
    return isCreateLogIntent(query) ? "CREATE" : "SEARCH";
  }
};

export default getIntent;
