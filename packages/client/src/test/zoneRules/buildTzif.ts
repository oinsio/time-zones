/**
 * Writes TZif files for tests (RFC 9636 §3): a version 1 block, a 64-bit block
 * and the footer. Implements FR7 of add-zone-rules-from-iana.
 */

export type BuiltTzifType = {
  utcOffsetSeconds: number;
  isDaylightSavingTime: boolean;
  designation: string;
};

export type BuildTzifOptions = {
  version?: number;
  magic?: string;
  types: BuiltTzifType[];
  transitions: [epochSeconds: number, typeIndex: number][];
  footer: string;
  /** Bytes of the version 1 data block (it is skipped by readers). */
  versionOneBlock?: Uint8Array;
};

const HEADER_LENGTH = 44;
const MAGIC_LENGTH = 4;
const VERSION_OFFSET = 4;
const COUNTS_OFFSET = 20;
const COUNT_FIELD_LENGTH = 4;
const COUNTS_PER_HEADER = 6;
const TWO_POW_32 = 2 ** 32;
const NEWLINE = 10;

function buildHeader(
  magic: string,
  version: number,
  counts: { time: number; type: number; char: number },
): Uint8Array {
  const header = new Uint8Array(HEADER_LENGTH);
  const view = new DataView(header.buffer);
  for (let index = 0; index < MAGIC_LENGTH; index++) {
    header[index] = magic.charCodeAt(index);
  }
  header[VERSION_OFFSET] = version;
  const orderedCounts = [0, 0, 0, counts.time, counts.type, counts.char];
  for (let index = 0; index < COUNTS_PER_HEADER; index++) {
    view.setUint32(
      COUNTS_OFFSET + index * COUNT_FIELD_LENGTH,
      orderedCounts[index] ?? 0,
    );
  }
  return header;
}

function encodeDesignations(types: BuiltTzifType[]): {
  characters: number[];
  indices: number[];
} {
  const characters: number[] = [];
  const indices: number[] = [];
  for (const { designation } of types) {
    indices.push(characters.length);
    for (const character of designation)
      characters.push(character.charCodeAt(0));
    characters.push(0);
  }
  return { characters, indices };
}

function buildSixtyFourBitBlock(options: BuildTzifOptions): {
  counts: { time: number; type: number; char: number };
  bytes: Uint8Array;
} {
  const { characters, indices } = encodeDesignations(options.types);
  const timeLength = options.transitions.length;
  const bytes = new Uint8Array(
    timeLength * 9 + options.types.length * 6 + characters.length,
  );
  const view = new DataView(bytes.buffer);
  let offset = 0;
  for (const [epochSeconds] of options.transitions) {
    const high = Math.floor(epochSeconds / TWO_POW_32);
    view.setInt32(offset, high);
    view.setUint32(offset + 4, epochSeconds - high * TWO_POW_32);
    offset += 8;
  }
  for (const [, typeIndex] of options.transitions) bytes[offset++] = typeIndex;
  options.types.forEach((type, typeIndex) => {
    view.setInt32(offset, type.utcOffsetSeconds);
    bytes[offset + 4] = type.isDaylightSavingTime ? 1 : 0;
    bytes[offset + 5] = indices[typeIndex] ?? 0;
    offset += 6;
  });
  bytes.set(characters, offset);
  return {
    counts: {
      time: timeLength,
      type: options.types.length,
      char: characters.length,
    },
    bytes,
  };
}

export function buildTzif(options: BuildTzifOptions): Uint8Array {
  const magic = options.magic ?? "TZif";
  const version = options.version ?? 50;
  const versionOneBlock = options.versionOneBlock ?? new Uint8Array(7);
  const { counts, bytes } = buildSixtyFourBitBlock(options);
  const footer = new TextEncoder().encode(options.footer);
  const parts = [
    buildHeader(magic, version, { time: 0, type: 1, char: 1 }),
    versionOneBlock,
    buildHeader(magic, version, counts),
    bytes,
    Uint8Array.of(NEWLINE),
    footer,
    Uint8Array.of(NEWLINE),
  ];
  const file = new Uint8Array(
    parts.reduce((sum, part) => sum + part.length, 0),
  );
  let offset = 0;
  for (const part of parts) {
    file.set(part, offset);
    offset += part.length;
  }
  return file;
}
