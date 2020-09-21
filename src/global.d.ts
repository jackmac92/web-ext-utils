export {}; // do not remove

declare global {
  interface JsonArray extends Array<JsonValue> {}

  type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

  type JsonObject = { [Key in string]?: JsonValue };
}
