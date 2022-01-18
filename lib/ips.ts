export function isValidIPS(buffer: Uint8Array): boolean {
  const headerValid =
    String.fromCharCode.apply(null, Array.from(buffer.slice(0, 5))) === "PATCH";
  const eofValid =
    String.fromCharCode.apply(null, Array.from(buffer.slice(-3))) === "EOF";
  return headerValid && eofValid;
}
