const phoneLib = require("libphonenumber-js");

function asCountryCode(value) {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

  if (!/^[A-Z]{2}$/.test(normalized)) {
    return undefined;
  }

  return normalized;
}

function normalizePhoneNumber(value, defaultCountry) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return {
      success: false,
      message: "Numero de telefono requerido.",
    };
  }

  try {
    const parsed = trimmed.startsWith("+")
      ? phoneLib.parsePhoneNumber(trimmed)
      : phoneLib.parsePhoneNumber(trimmed, asCountryCode(defaultCountry));

    if (!parsed || !parsed.isValid()) {
      return {
        success: false,
        message: "Numero de telefono invalido.",
      };
    }

    return {
      success: true,
      value: parsed.format("E.164"),
    };
  } catch {
    return {
      success: false,
      message: "Numero de telefono invalido.",
    };
  }
}

module.exports = {
  normalizePhoneNumber,
};
