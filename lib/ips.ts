export function isValidIPS(buffer: Uint8Array): boolean {
  const headerValid =
    String.fromCharCode.apply(null, Array.from(buffer.slice(0, 5))) === "PATCH";
  const eofValid =
    String.fromCharCode.apply(null, Array.from(buffer.slice(-3))) === "EOF";
  return headerValid && eofValid;
}

function isEOF(buffer: Uint8Array): boolean {
  return (
    buffer.length === 0 ||
    String.fromCharCode.apply(null, Array.from(buffer.slice(0, 3))) === "EOF"
  );
}

export function applyPatch(romFile: Uint8Array, patch: Uint8Array): Uint8Array {
  const patched = Array.from(romFile);
  let index = 5;

  while (!isEOF(patch.slice(index))) {
    let offset =
      (patch[index] << 16) + (patch[index + 1] << 8) + patch[index + 2];
    index += 3;
    let len = (patch[index] << 8) + patch[index + 1];
    index += 2;
    if (len) {
      for (let i = 0; i < len; i++) {
        patched[offset + i] = patch[index + i];
      }
      index += len;
    } else {
      len = (patch[index] << 8) + patch[index + 1];
      const val = patch[index + 2];
      index += 3;
      for (let i = 0; i < len; i++) {
        patched[offset + i] = val;
      }
    }
  }
  return new Uint8Array(patched);
}
