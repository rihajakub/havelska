import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function key() {
  const encoded = process.env.CHECKIN_DATA_ENCRYPTION_KEY;
  if (!encoded) throw new Error("CHECKIN_DATA_ENCRYPTION_KEY není nastavený.");
  const value = Buffer.from(encoded, "base64");
  if (value.length !== 32) throw new Error("CHECKIN_DATA_ENCRYPTION_KEY musí být Base64 klíč o 32 bytech.");
  return value;
}

export function encryptCheckInData(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptCheckInData(value: string) {
  const [iv, tag, encrypted] = value.split(".");
  if (!iv || !tag || !encrypted) throw new Error("Zašifrovaný záznam má neplatný formát.");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}
