// Verifies FR6, FR9 of add-remote-zone-rules-updates: the in-memory repository's own options.
import { SaveOutcome, StoredReleaseLoadStatus } from "@/ports";
import { buildReleaseDocument } from "@/test/zoneRules/buildReleaseDocument";
import { createInMemoryStoredReleaseRepository } from "./inMemoryStoredReleaseRepository";

describe("in-memory stored release repository", () => {
  it("should load the initial document", () => {
    const repository = createInMemoryStoredReleaseRepository({
      initialDocument: buildReleaseDocument("2026g"),
    });
    expect(repository.load().status).toBe(StoredReleaseLoadStatus.LOADED);
  });

  it("should load UNREADABLE for an initial document that is not a release", () => {
    const repository = createInMemoryStoredReleaseRepository({
      initialDocument: { release: 5 },
    });
    expect(repository.load().status).toBe(StoredReleaseLoadStatus.UNREADABLE);
  });

  it("should answer FAILED and keep the document when it is not writable", () => {
    const repository = createInMemoryStoredReleaseRepository({
      isWritable: false,
    });
    expect(repository.save(buildReleaseDocument("2026g"))).toBe(
      SaveOutcome.FAILED,
    );
    expect(repository.load().status).toBe(StoredReleaseLoadStatus.EMPTY);
  });
});
