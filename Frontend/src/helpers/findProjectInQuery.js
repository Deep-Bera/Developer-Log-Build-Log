// check if any project name appears in the query..
const findProjectInQuery = (query, projects) => {
  const lowerQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  return projects.find((p) => {
    const lowerName = p.name.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    // check if project name words appear in the query..
    const nameWords = lowerName.split(" ").filter((w) => w.length > 2);
    return nameWords.every((word) => lowerQuery.includes(word));
  });
};
export default findProjectInQuery;
