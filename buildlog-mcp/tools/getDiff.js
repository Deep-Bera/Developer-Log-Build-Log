import { execSync } from "child_process";

const MAX_DIFF_LENGTH = 4000;

export default function getDiff() {
  console.log("Reading git diff from:", process.cwd());
  try {
    // try latest commit diff first..
    let diff = execSync("git diff HEAD~1 HEAD", {
      cwd: process.cwd(),
    })
      .toString()
      .trim();

    // fall back to staged changes..
    if (!diff) {
      diff = execSync("git diff --cached", {
        cwd: process.cwd(),
      })
        .toString()
        .trim();
    }

    // fall back to unstaged changes..
    if (!diff) {
      diff = execSync("git diff", {
        cwd: process.cwd(),
      })
        .toString()
        .trim();
    }

    if (!diff) {
      return { success: false, message: "No git changes found" };
    }

    // filter out lockfile noise manually after getting the diff..
    const filteredLines = diff.split("\n").filter((line) => {
      const skipFiles = [
        "package-lock.json",
        "pnpm-lock.yaml",
        "yarn.lock",
        ".min.js",
        ".min.css",
        ".svg",
      ];
      // if this is a diff header line pointing to a file we want to skip, remove it..
      if (line.startsWith("diff --git")) {
        return !skipFiles.some((f) => line.includes(f));
      }
      return true;
    });

    diff = filteredLines.join("\n").trim();

    if (!diff) {
      return {
        success: false,
        message: "No git changes found after filtering",
      };
    }

    // cap to avoid blowing gemini's token limit..
    if (diff.length > MAX_DIFF_LENGTH) {
      diff = diff.slice(0, MAX_DIFF_LENGTH) + "\n\n... (diff truncated)";
    }

    return { success: true, diff };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
