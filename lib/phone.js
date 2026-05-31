const PHONE_PATTERN = /^010-\d{4}-\d{4}$/;
const PHONE_DIGITS_PATTERN = /^010\d{8}$/;

export function formatPhoneNumber(phone) {
  const value = String(phone || "").trim();

  if (PHONE_PATTERN.test(value)) {
    return value;
  }

  if (PHONE_DIGITS_PATTERN.test(value)) {
    return `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
  }

  return value;
}

export function getRequiredFormattedPhone(formData) {
  const phone = String(formData.get("phone") || "").trim();

  if (!PHONE_PATTERN.test(phone)) {
    throw new Error("Phone must match 010-XXXX-XXXX.");
  }

  return phone;
}
