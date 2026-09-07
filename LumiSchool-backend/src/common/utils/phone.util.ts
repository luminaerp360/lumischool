import { BadRequestException } from "@nestjs/common";

/**
 * Normalizes a Kenyan phone number to the 2547xx format.
 * Accepts: 07xx, 7xx, +2547xx, 2547xx, 01xx, 1xx
 */
export function normalizeKenyanPhone(phone: string): string {
  if (!phone) {
    throw new BadRequestException("Phone number is required");
  }

  // Remove spaces, dashes, and other formatting
  let cleaned = phone.replace(/[\s\-()]/g, "");

  // Remove leading +
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // Convert various formats to 2547xx
  if (cleaned.startsWith("07") && cleaned.length === 10) {
    cleaned = "254" + cleaned.substring(1);
  } else if (cleaned.startsWith("01") && cleaned.length === 10) {
    cleaned = "254" + cleaned.substring(1);
  } else if (cleaned.startsWith("7") && cleaned.length === 9) {
    cleaned = "254" + cleaned;
  } else if (cleaned.startsWith("1") && cleaned.length === 9) {
    cleaned = "254" + cleaned;
  } else if (cleaned.startsWith("254") && cleaned.length === 12) {
    // Already in correct format
  } else {
    throw new BadRequestException(
      `Invalid Kenyan phone number format: ${phone}. Expected formats: 07xx, +2547xx, 2547xx`,
    );
  }

  // Validate final format
  if (!/^254[17]\d{8}$/.test(cleaned)) {
    throw new BadRequestException(`Invalid Kenyan phone number: ${phone}`);
  }

  return cleaned;
}
