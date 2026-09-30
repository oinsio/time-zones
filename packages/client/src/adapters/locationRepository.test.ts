// Verifies FR11, FR13, FR14 of add-locations-via-search: one contract, every adapter.
import { LocationsLoadStatus, SaveOutcome } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "./inMemoryLocationRepository";
import { describeLocationRepositoryContract } from "./locationRepository.contract";

describeLocationRepositoryContract("in-memory", {
  createPair: () => {
    const backend = createInMemoryLocationBackend();
    return {
      first: createInMemoryLocationRepository({ backend }),
      second: createInMemoryLocationRepository({ backend }),
    };
  },
});

describe("in-memory location repository", () => {
  const moscow = buildLocation();

  it("should load the initial document", () => {
    const initialDocument = {
      status: LocationsLoadStatus.LOADED,
      locations: [moscow],
    } as const;
    expect(
      createInMemoryLocationRepository({ initialDocument }).load(),
    ).toEqual(initialDocument);
  });

  it("should answer FAILED to save when it is not writable", () => {
    const repository = createInMemoryLocationRepository({ isWritable: false });
    expect(repository.save([moscow])).toBe(SaveOutcome.FAILED);
  });

  it("should answer FAILED to clear when it is not writable", () => {
    const repository = createInMemoryLocationRepository({ isWritable: false });
    expect(repository.clear()).toBe(SaveOutcome.FAILED);
  });

  it("should keep the stored document when it is not writable", () => {
    const initialDocument = {
      status: LocationsLoadStatus.LOADED,
      locations: [moscow],
    } as const;
    const repository = createInMemoryLocationRepository({
      initialDocument,
      isWritable: false,
    });
    repository.save([]);
    repository.clear();
    expect(repository.load()).toEqual(initialDocument);
  });
});
