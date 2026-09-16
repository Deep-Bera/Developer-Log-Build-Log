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
You are an interview preparation coach. Based on the following project details and logs, generate 6 insightful STAR-method interview Q&A pairs.

The questions should cover:
- Key decisions made and rationale
- Major challenges/blockers and how they were resolved
- Methods, tools, and approaches used
- Core learnings from the project
- Wins and achievements

Format each Q&A exactly like this with a new line between Q and A:

Q: [question]

A: [detailed answer based on the logs]

---

Project Details:
${projectInfo}

Logs:
${logsText}

Generate only the Q&A pairs, no extra explanation.
    `.trim();
  }

  if (type === "study-summary") {
    return `
You are an expert academic tutor and study coach. Based on the following project/study details and learning logs, generate a comprehensive, structured Study & Revision Guide.

The document should include:
- # Study & Revision Guide: ${project?.name || "Topic Overview"}
- 📌 Overview & Core Learning Objectives
- 🧠 Key Concepts & Takeaways (synthesized deeply from the "Learn" logs)
- ⚠️ Common Pitfalls & Resolved Doubts (synthesized from the "Blocker" logs)
- 💡 Key Decisions & Problem Solving Methods (from the "Decision" logs)
- 📝 Self-Assessment Review Questions (3-4 conceptual questions with answers in blockquotes)

Project/Subject Details:
${projectInfo}

Logs:
${logsText}

Generate clean, well-formatted Markdown. Do not wrap in outer code fences. Start directly with the # title.
    `.trim();
  }

  if (type === "progress-report") {
    return `
You are an executive project coordinator and academic mentor. Based on the following project logs, generate a formal, professional Progress Report suitable for submission to a professor, mentor, or client.

The report should include:
- # Progress Report: ${project?.name || "Project Progress"}
- 📊 Executive Summary & Status Overview
- ✅ Milestones & Deliverables Completed (organized from "Win" and "Decision" logs)
- 🚧 Challenges, Roadblocks & How They Were Handled (from "Blocker" logs)
- 📈 Key Knowledge Gained (from "Learn" logs)
- 📅 Next Steps & Action Plan

Project Details:
${projectInfo}

Logs:
${logsText}

Generate clean, professional Markdown suitable for official review. Start directly with the # title.
    `.trim();
  }

  if (type === "work-summary") {
    return `
You are a senior team lead and product manager. Based on the following project logs, generate a crisp, executive Work & Sprint Digest for team updates, managers, and performance reviews.

The digest should include:
- # Work & Sprint Digest: ${project?.name || "Sprint Summary"}
- 🚀 Highlights & High-Impact Wins (from "Win" logs)
- 🎯 Key Decisions Made & Rationale (from "Decision" logs)
- 🛑 Cross-team Dependencies & Overcome Roadblocks (from "Blocker" logs)
- 📈 Growth, Learnings & Best Practices (from "Learn" logs)

Project Details:
${projectInfo}

Logs:
${logsText}

Generate concise, bullet-pointed Markdown ready for Slack, email, or performance appraisals. Start directly with the # title.
    `.trim();
  }

  if (type === "lesson-reflection") {
    return `
You are an instructional coach and educational consultant. Based on the following teaching and classroom logs, generate a structured Pedagogical Lesson Reflection.

The reflection should include:
- # Lesson & Teaching Reflection: ${project?.name || "Lesson Overview"}
- 🎯 Learning Outcomes Addressed
- ✨ What Worked Well (successful explanations, student engagement, milestones from "Win" logs)
- ⚠️ Student Struggle Areas & Conceptual Hurdles (from "Blocker" logs)
- 🔄 Pedagogical Takeaways & Adjustments for Next Class (from "Learn" and "Decision" logs)

Course/Topic Details:
${projectInfo}

Logs:
${logsText}

Generate structured, thoughtful Markdown starting directly with the # title.
    `.trim();
  }
}
