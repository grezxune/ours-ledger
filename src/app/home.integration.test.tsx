import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "./page";

describe("home page", () => {
  it("renders shared-household messaging and roadmap preview", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain("What&#x27;s mine is ours.");
    expect(html).toContain("Roadmap Preview");
    expect(html).toContain("Shared transaction feed");
  });
});
