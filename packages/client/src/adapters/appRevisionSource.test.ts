// Verifies FR5, FR6 of apply-data-updates-silently: one contract, every adapter.
import { describe, expect, it, vi } from "vitest";
import { AppRevisionFailure } from "@/ports";
import { describeAppRevisionSourceContract } from "./appRevisionSource.contract";
import { createFetchAppRevisionSource } from "./fetchAppRevisionSource";
import { createInMemoryAppRevisionSource } from "./inMemoryAppRevisionSource";

describeAppRevisionSourceContract("in-memory", {
  createSource: (answer) => createInMemoryAppRevisionSource(answer),
});

const respondTo = (answer: string | AppRevisionFailure) => {
  if (answer === AppRevisionFailure.REQUEST_FAILED) {
    return new Response("missing", { status: 404 });
  }
  if (answer === AppRevisionFailure.UNPARSABLE) {
    return new Response("<html>not json</html>", { status: 200 });
  }
  return new Response(JSON.stringify({ appRevision: answer }), { status: 200 });
};

describeAppRevisionSourceContract("fetch", {
  createSource: (answer) =>
    createFetchAppRevisionSource({
      baseUrl: "/",
      fetchFile: async () => respondTo(answer),
    }),
});

describe("createFetchAppRevisionSource", () => {
  it("should request the file under the base path without trusting the HTTP cache", async () => {
    const fetchFile = vi.fn(async () => respondTo("c3"));
    await createFetchAppRevisionSource({
      baseUrl: "/time-zones/",
      fetchFile,
    }).fetchAppRevision();
    expect(fetchFile).toHaveBeenCalledWith("/time-zones/app-revision.json", {
      cache: "no-cache",
    });
  });

  it("should answer REQUEST_FAILED when the request throws", async () => {
    const source = createFetchAppRevisionSource({
      fetchFile: async () => {
        throw new Error("offline");
      },
    });
    expect(await source.fetchAppRevision()).toBe(
      AppRevisionFailure.REQUEST_FAILED,
    );
  });

  it.each([
    ["no revision", "{}"],
    ["an empty revision", '{"appRevision":""}'],
    ["a revision that is not text", '{"appRevision":3}'],
    ["a null document", "null"],
    ["a text document", '"c3"'],
  ])("should answer UNPARSABLE for %s", async (_name, body) => {
    const source = createFetchAppRevisionSource({
      fetchFile: async () => new Response(body, { status: 200 }),
    });
    expect(await source.fetchAppRevision()).toBe(AppRevisionFailure.UNPARSABLE);
  });
});

describe("createInMemoryAppRevisionSource", () => {
  it("should fail with REQUEST_FAILED until it is told an answer", async () => {
    expect(await createInMemoryAppRevisionSource().fetchAppRevision()).toBe(
      AppRevisionFailure.REQUEST_FAILED,
    );
  });

  it("should count requests and follow a changed answer", async () => {
    const source = createInMemoryAppRevisionSource("c3");
    await source.fetchAppRevision();
    source.setAnswer("d4");
    expect(await source.fetchAppRevision()).toBe("d4");
    expect(source.requestCount()).toBe(2);
  });
});
