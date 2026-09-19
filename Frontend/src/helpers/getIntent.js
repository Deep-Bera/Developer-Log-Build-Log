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

// check if user is asking about their own logs..
export const isSearchIntent = (query) => {
  return /\b(my |did i|i did|last week|this project|blockers|decisions|what.*i.*learn)\b/i.test(query);
};

// categorize user intent using Gemini via backend..
const getIntent = async (query, token, history = []) => {
  try {
    const res = await axios.post(
      "/api/ask/intent",
      { query, history: history.slice(-1) }, // only need last turn for pronoun resolution
      { headers: { Authorization: token } },
    );
    return res.data?.intent || "GENERAL";
  } catch (err) {
    console.log("Intent classification fallback:", err.message);
    if (isCreateLogIntent(query)) return "CREATE";
    if (isSearchIntent(query)) return "SEARCH";
    return "GENERAL";
  }
};

export default getIntent;
