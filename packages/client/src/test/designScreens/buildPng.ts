// Verifies FR5 of make-location-menu-button-vertical.
import {
  PNG_HEADER_BYTES,
  PNG_HEIGHT_OFFSET,
  PNG_SIGNATURE,
  PNG_WIDTH_OFFSET,
} from "../../../scripts/designScreens/constants.ts";

const IHDR_LENGTH = 13;

export function buildPng(width: number, height: number, marker = 0) {
  const bytes = Buffer.alloc(PNG_HEADER_BYTES + 1);
  Buffer.from(PNG_SIGNATURE).copy(bytes);
  bytes.writeUInt32BE(IHDR_LENGTH, PNG_SIGNATURE.length);
  bytes.write("IHDR", PNG_SIGNATURE.length + 4, "ascii");
  bytes.writeUInt32BE(width, PNG_WIDTH_OFFSET);
  bytes.writeUInt32BE(height, PNG_HEIGHT_OFFSET);
  bytes.writeUInt8(marker, PNG_HEADER_BYTES);
  return bytes;
}
