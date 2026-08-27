export default function buildPrompt(type, project, logs) {
  const projectInfo = `
Project Name: ${project.name}
Tech Stack: ${project.stack.join(", ")}
Start Date: ${new Date(project.startDate).toLocaleDateString()}
Status: ${project.status}
  `.trim();

  const logsText = logs
    .map((log, i) =>
      `
Log ${i + 1}:
Type: ${log.entryType}
Content: ${log.content}
Tags: ${log.tags.join(", ") || "none"}
Date: ${new Date(log.createdAt).toLocaleDateString()}
      `.trim(),
    )
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

Generate only the markdown content, no extra explanation.
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

Format each Q&A exactly like this:
Q: [question]
A: [detailed answer based on the logs]

Project Details:
${projectInfo}

Developer Logs:
${logsText}

Generate only the Q&A pairs, no extra explanation.
    `.trim();
  }
}
