import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

function walkFiles(root: string): string[] {
  const entries = readdirSync(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const absolutePath = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolutePath));
      continue;
    }
    files.push(absolutePath);
  }
  return files;
}

function relativeToRepo(absolutePath: string): string {
  return relative(process.cwd(), absolutePath);
}

describe("architecture guardrails", () => {
  it("does not allow route action modules in src/app", () => {
    const appFiles = walkFiles(join(process.cwd(), "src/app"));
    const legacyActionFiles = appFiles
      .map(relativeToRepo)
      .filter((path) => /\/actions(\.[a-z]+)?\.ts$/.test(path));

    expect(legacyActionFiles).toEqual([]);
  });

  it("does not allow server-action directives in non-api app routes", () => {
    const appFiles = walkFiles(join(process.cwd(), "src/app")).filter((path) => {
      return /\.(ts|tsx)$/.test(path) && !path.includes("/api/");
    });
    const forbiddenDirective = /(^|\n)\s*["']use server["'];?/m;
    const violatingFiles = appFiles
      .filter((path) => forbiddenDirective.test(readFileSync(path, "utf8")))
      .map(relativeToRepo);

    expect(violatingFiles).toEqual([]);
  });
});
