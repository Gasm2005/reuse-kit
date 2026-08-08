import { describe, it, expect } from "vitest";
import { SITE_URL, absoluteUrl, OG_IMAGE } from "./site";

describe("site config", () => {
  it("has no trailing slash on SITE_URL", () => {
    expect(SITE_URL.endsWith("/")).toBe(false);
  });

  it("defaults to the owned .com domain", () => {
    expect(SITE_URL).toBe("https://theartspire.com");
  });

  it("builds absolute URLs correctly whether or not the path has a leading slash", () => {
    expect(absoluteUrl("/shop")).toBe(`${SITE_URL}/shop`);
    expect(absoluteUrl("shop")).toBe(`${SITE_URL}/shop`);
    expect(absoluteUrl()).toBe(SITE_URL);
  });

  it("points the OG image at a real, absolute asset", () => {
    expect(OG_IMAGE).toBe(`${SITE_URL}/og-image.jpg`);
    expect(OG_IMAGE.startsWith("https://")).toBe(true);
  });
});
