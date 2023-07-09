export type AvailableLanguages = "en" | "es";

export type Translated = {
  [ key in AvailableLanguages]: string;
}