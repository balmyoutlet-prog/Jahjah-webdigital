// Run with: npm test   (Node >= 22.18 strips TypeScript types natively)
import { test } from "node:test";
import assert from "node:assert/strict";
import { routeIntent, resolveNumber, waLink, isValidWaNumber, buildMessage, INTENTS } from "../src/lib/whatsapp.ts";

test("architecture intents route to Shahinaz Jahjah", () => {
  for (const k of ["architectural-design", "floor-plans", "villa-architecture", "exterior-facade"] as const)
    assert.equal(routeIntent(k), "architecture");
});

test("interior intents route to Dima", () => {
  for (const k of ["interior-architecture", "residential-interior", "commercial-interior"] as const)
    assert.equal(routeIntent(k), "interiors");
});

test("mixed intents ask the visitor; other is general", () => {
  assert.equal(routeIntent("full-consultation"), "both");
  assert.equal(routeIntent("project-supervision"), "both");
  assert.equal(routeIntent("other"), "general");
  assert.equal(INTENTS.length, 10);
});

test("general falls back to interiors then architecture", () => {
  assert.equal(resolveNumber("general", { architecture: "9715", interiors: "", general: "" }), "9715");
  assert.equal(resolveNumber("general", { architecture: "1", interiors: "2", general: "" }), "2");
  assert.equal(resolveNumber("general", { architecture: "1", interiors: "2", general: "3" }), "3");
});

test("wa.me links use digits-only international numbers", () => {
  assert.ok(isValidWaNumber("96171123456"));
  assert.ok(!isValidWaNumber("071123456"));
  assert.ok(!isValidWaNumber("+96171123456"));
  assert.equal(waLink("96171123456", "Hi there"), "https://wa.me/96171123456?text=Hi%20there");
  assert.equal(waLink("", "Hi"), "https://wa.me/?text=Hi");
});

test("message matches the brief's example shape", () => {
  const m = buildMessage("en", {
    intentPhrase: "residential interior design",
    city: "Dubai",
    area: "250",
    style: "Contemporary Luxury",
  });
  assert.equal(
    m,
    "Hello DOS Design Studio,\nI would like to discuss a residential interior design project in Dubai.\nThe approximate area is 250 sqm.\nMy preferred style is Contemporary Luxury.\nPlease let me know the next steps for a consultation.",
  );
  assert.ok(!/DOZ/.test(m));
  assert.match(buildMessage("ar", { intentPhrase: "تصميم داخلي" }), /استوديو DOS/);
  assert.match(buildMessage("ar", { intentPhrase: "تصميم", city: "الرياض", country: "السعودية" }), /الرياض، السعودية/);
});
