// find if a project is mentioned in the user's query..
const findProjectInQuery = (query, projects = []) => {
  if (!query || !projects.length) return null;

  // Clean query and wrap in spaces so we can match whole words easily..
  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const queryWords = cleanQuery.split(/\s+/).filter(Boolean);
  const paddedQuery = ` ${queryWords.join(" ")} `;

  return (
    projects.find((p) => {
      if (!p?.name) return false;

      const projectName = p.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .trim();

      if (!projectName) return false;

      // 1. Exact project name match as a whole phrase (e.g. " ai " in " create log for ai ")..
      if (paddedQuery.includes(` ${projectName} `)) {
        return true;
      }

      // 2. For multi-word projects, check if all significant words appear in the query..
      const words = projectName.split(/\s+/).filter((w) => w.length > 2);
      if (words.length > 0 && words.every((w) => queryWords.includes(w))) {
        return true;
      }

      return false;
    }) || null
  );
};

export default findProjectInQuery;


