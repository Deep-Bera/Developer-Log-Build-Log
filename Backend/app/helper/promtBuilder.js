export default function buildPrompt(type, project, logs) {
  const stackStr =
    Array.isArray(project?.stack) && project.stack.length > 0
      ? project.stack.join(", ")
      : "Not specified";
  const startDateStr = project?.startDate
    ? new Date(project.startDate).toLocaleDateString()
    : "Not specified";

  const projectInfo = `
Project Name: ${project?.name || "Untitled"}
Tech Stack: ${stackStr}
Start Date: ${startDateStr}
Status: ${project?.status || "in-progress"}
  `.trim();

  const logsText = (logs || [])
    .map((log, i) => {
      const tagsStr =
        Array.isArray(log?.tags) && log.tags.length > 0
          ? log.tags.join(", ")
          : "none";
      const logDate = log?.createdAt
        ? new Date(log.createdAt).toLocaleDateString()
        : "unknown date";

      return `
Log ${i + 1}:
Type: ${log?.entryType || "Log"}
Content: ${log?.content || ""}
Tags: ${tagsStr}
Date: ${logDate}
      `.trim();
    })
    .join("\n\n");

  if (type === "readme") {
    return `
You are a technical writer. Based on the following project details and developer logs, generate a professional GitHub README.md file.

The README should include:
- Project title and description
- Tech stack
- Key features and decisions made during development
- Challenges faced and how they were solved
- Learnings and wins
- Getting started section (based on the stack)

Project Details:
${projectInfo}

Developer Logs:
${logsText}

Generate only the raw markdown content. Do not wrap it in code fences or backticks. Start directly with the # title.
    `.trim();
  }

  if (type === "interview-qa") {
    return `
You are a technical interview coach. Based on the following project details and developer logs, generate 6 insightful interview Q&A pairs.

The questions should cover:
- Key technical decisions made
- Challenges and how they were resolved
- Architecture choices
- Learnings from the project
- Wins and achievements

Format each Q&A exactly like this with a new line between Q and A:

Q: [question]

A: [detailed answer based on the logs]

---

Project Details:
${projectInfo}

Developer Logs:
${logsText}

Generate only the Q&A pairs, no extra explanation.
    `.trim();
  }
}
