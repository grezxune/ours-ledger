import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SignInForm } from "@/app/signin/signin-form";

describe("sign in form", () => {
  it("renders industry-standard Google sign-in CTA and developer fallback", () => {
    const html = renderToStaticMarkup(<SignInForm />);

    expect(html).toContain("Continue with Google");
    expect(html).toContain("Developer access");
    expect(html).toContain("Dev Passphrase");
  });
});
