// Builds a static "Pix Copia e Cola" BR Code (EMV QR Code) payload, the same
// format banking apps generate/scan for Pix transfers, with no fixed amount.

function tlv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

function sanitize(value: string, maxLength: number): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .toUpperCase();
  return (normalized || "NA").slice(0, maxLength);
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc =
        (crc & 0x8000) !== 0
          ? ((crc << 1) ^ 0x1021) & 0xffff
          : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixPayload(
  pixKey: string,
  merchantName: string,
  merchantCity = "BRASIL",
): string {
  const merchantAccountInfo = tlv("00", "br.gov.bcb.pix") + tlv("01", pixKey);
  const additionalData = tlv("05", "***");

  const payloadWithoutCrc =
    tlv("00", "01") +
    tlv("26", merchantAccountInfo) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("58", "BR") +
    tlv("59", sanitize(merchantName, 25)) +
    tlv("60", sanitize(merchantCity, 15)) +
    tlv("62", additionalData) +
    "6304";

  return payloadWithoutCrc + crc16(payloadWithoutCrc);
}
