"use client";

import { useEffect, useRef, useState } from "react";
import * as phoneLib from "libphonenumber-js";

const COUNTRY_NAMES: Record<string, string> = {
  AR: "Argentina",
  US: "Estados Unidos",
  MX: "Mexico",
  ES: "Espana",
  CO: "Colombia",
  CL: "Chile",
  PE: "Peru",
  VE: "Venezuela",
  EC: "Ecuador",
  UY: "Uruguay",
  PY: "Paraguay",
  BO: "Bolivia",
  BR: "Brasil",
  CA: "Canada",
  GB: "Reino Unido",
  DE: "Alemania",
  FR: "Francia",
  IT: "Italia",
  PT: "Portugal",
  CR: "Costa Rica",
  PA: "Panama",
  GT: "Guatemala",
  SV: "El Salvador",
  HN: "Honduras",
  NI: "Nicaragua",
  DO: "Rep. Dominicana",
  PR: "Puerto Rico",
  CU: "Cuba",
  AU: "Australia",
  NZ: "Nueva Zelanda",
  JP: "Japon",
  CN: "China",
  IN: "India",
  RU: "Rusia",
  ZA: "Sudafrica",
  NG: "Nigeria",
  EG: "Egipto",
  KE: "Kenia",
  GH: "Ghana",
  TR: "Turquia",
  SA: "Arabia Saudita",
  AE: "Emiratos Arabes",
  IL: "Israel",
  KR: "Corea del Sur",
  TH: "Tailandia",
  SG: "Singapur",
  MY: "Malasia",
  PH: "Filipinas",
  ID: "Indonesia",
  VN: "Vietnam",
  PK: "Pakistan",
  BD: "Bangladesh",
  NL: "Paises Bajos",
  BE: "Belgica",
  CH: "Suiza",
  AT: "Austria",
  SE: "Suecia",
  NO: "Noruega",
  DK: "Dinamarca",
  FI: "Finlandia",
  PL: "Polonia",
  CZ: "Republica Checa",
  GR: "Grecia",
  IE: "Irlanda",
  HU: "Hungria",
  RO: "Rumania",
  UA: "Ucrania",
};

const POPULAR_COUNTRIES: phoneLib.CountryCode[] = [
  "AR",
  "US",
  "MX",
  "ES",
  "CO",
  "CL",
  "BR",
  "PE",
  "VE",
  "EC",
  "UY",
  "CR",
];

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function getCountryName(code: string) {
  return COUNTRY_NAMES[code] || code;
}

function getSubmittedPhoneValue(
  value: string,
  country: phoneLib.CountryCode,
) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const parsed = trimmed.startsWith("+")
      ? phoneLib.parsePhoneNumber(trimmed)
      : phoneLib.parsePhoneNumber(trimmed, country);

    if (parsed?.isValid()) {
      return parsed.format("E.164");
    }
  } catch {
    // Keep best-effort fallback below.
  }

  const digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (trimmed.startsWith("+")) {
    return `+${digits}`;
  }

  return `+${phoneLib.getCountryCallingCode(country)}${digits}`;
}

type PhoneInputProps = {
  name: string;
  defaultValue?: string;
  defaultCountry?: phoneLib.CountryCode;
  required?: boolean;
  placeholder?: string;
};

export function PhoneInput({
  name,
  defaultValue = "",
  defaultCountry = "AR",
  required = false,
  placeholder = "",
}: PhoneInputProps) {
  const countries = phoneLib.getCountries();
  const initialParsed = defaultValue
    ? (() => {
        try {
          return phoneLib.parsePhoneNumber(defaultValue);
        } catch {
          return null;
        }
      })()
    : null;

  const [selectedCountry, setSelectedCountry] = useState<phoneLib.CountryCode>(
    initialParsed?.country || defaultCountry,
  );
  const [phoneNumber, setPhoneNumber] = useState(
    initialParsed ? initialParsed.formatNational() : "",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = countries.filter((country) => {
    const name = getCountryName(country).toLowerCase();
    const code = country.toLowerCase();
    const calling = phoneLib.getCountryCallingCode(country);
    const search = searchTerm.toLowerCase();

    return (
      name.includes(search) ||
      code.includes(search) ||
      calling.includes(search)
    );
  });

  const sortedCountries = [
    ...filteredCountries.filter((country) => POPULAR_COUNTRIES.includes(country)),
    ...filteredCountries.filter((country) => !POPULAR_COUNTRIES.includes(country)),
  ];

  const handlePhoneChange = (value: string) => {
    const formatter = new phoneLib.AsYouType(selectedCountry);
    setPhoneNumber(formatter.input(value));
  };

  const handleCountrySelect = (country: phoneLib.CountryCode) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchTerm("");
    setFocusedIndex(0);

    if (!phoneNumber) {
      return;
    }

    try {
      const parsed = phoneLib.parsePhoneNumber(phoneNumber, country);
      if (parsed?.isValid()) {
        setPhoneNumber(parsed.formatNational());
      }
    } catch {
      const formatter = new phoneLib.AsYouType(country);
      setPhoneNumber(formatter.input(phoneNumber));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev < sortedCountries.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        event.preventDefault();
        if (sortedCountries[focusedIndex]) {
          handleCountrySelect(sortedCountries[focusedIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  const callingCode = phoneLib.getCountryCallingCode(selectedCountry);
  const submittedValue = getSubmittedPhoneValue(phoneNumber, selectedCountry);

  return (
    <div className="phone-input-container">
      <input
        type="hidden"
        name={name}
        value={submittedValue}
        readOnly
        required={required}
      />
      <input
        type="hidden"
        name={`${name}_country`}
        value={selectedCountry}
        readOnly
      />

      <div className="phone-input-wrapper">
        <div
          className={`phone-country-selector ${isOpen ? "is-open" : ""}`}
          ref={dropdownRef}
        >
          <button
            type="button"
            className="phone-country-button"
            onClick={() => setIsOpen((open) => !open)}
            onKeyDown={handleKeyDown}
            aria-label="Seleccionar pais"
            aria-expanded={isOpen}
          >
            <span className="phone-flag">{getFlagEmoji(selectedCountry)}</span>
            <svg
              className={`phone-chevron ${isOpen ? "is-open" : ""}`}
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
            >
              <path
                d="M2 3.5L5 6.5L8 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {isOpen ? (
            <div className="phone-dropdown">
              <div className="phone-dropdown-search">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar pais..."
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setFocusedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  className="phone-search-input"
                />
              </div>
              <div className="phone-dropdown-list">
                {sortedCountries.map((country, index) => (
                  <button
                    key={country}
                    type="button"
                    className={`phone-dropdown-item ${
                      index === focusedIndex ? "is-focused" : ""
                    } ${country === selectedCountry ? "is-selected" : ""}`}
                    onClick={() => handleCountrySelect(country)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <span className="phone-flag">{getFlagEmoji(country)}</span>
                    <span className="phone-country-name">
                      {getCountryName(country)}
                    </span>
                    <span className="phone-calling-code">
                      +{phoneLib.getCountryCallingCode(country)}
                    </span>
                  </button>
                ))}
                {sortedCountries.length === 0 ? (
                  <div className="phone-dropdown-empty">
                    No se encontraron paises
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <input
          type="tel"
          className="phone-number-input"
          value={phoneNumber}
          onChange={(event) => handlePhoneChange(event.target.value)}
          placeholder={placeholder || "Numero de telefono"}
          aria-label="Numero de telefono"
        />
      </div>

      <small className="field-hint">
        {phoneNumber
          ? `Formato: +${callingCode} ${phoneNumber.replace(/\D/g, "").substring(0, 3)} ${phoneNumber.replace(/\D/g, "").substring(3)}`
          : `Escribe tu numero sin el codigo de pais (+${callingCode})`}
      </small>
    </div>
  );
}
