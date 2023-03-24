import { blue, bold, red, yellow } from "std/fmt/colors.ts";
import { getLevelName, LevelName, LogLevels } from "std/log/levels.ts";
import { assertNever, stringifyJson } from "../lib/mod.ts";

export { LogLevels } from "std/log/mod.ts";

export type LogData = string | { event: string; [key: string]: LogDatum };
export type LogDatum = string | number | Date;

const currentLevel = Deno.env.get("APP_TEST")
  ? LogLevels.ERROR
  : LogLevels.INFO;

export const logDebug = makeLogFunction(LogLevels.DEBUG);
export const logInfo = makeLogFunction(LogLevels.INFO);
export const logWarning = makeLogFunction(LogLevels.WARNING);
export const logError = makeLogFunction(LogLevels.ERROR);
export const logCritical = makeLogFunction(LogLevels.CRITICAL);

function getColourWrapper(level: LogLevels) {
  switch (level) {
    case LogLevels.DEBUG:
      return blue;
    case LogLevels.WARNING:
      return yellow;
    case LogLevels.ERROR:
      return red;
    case LogLevels.CRITICAL:
      return (s: string) => red(bold(s));
    default:
      return (s: string) => s;
  }
}

function makeLogFunction(level: LogLevels) {
  const name = getLevelName(level);
  const wrapper = getColourWrapper(level);
  return (data: LogData | (() => LogData)) => {
    log(level, name, wrapper, data);
  };
}

function log(
  level: LogLevels,
  levelName: LevelName,
  wrapper: (s: string) => string,
  data: LogData | (() => LogData),
) {
  if (level < currentLevel) return;

  // Log data can be a function to avoid expensive computation if the log level
  // is too low.
  const realisedData = typeof data === "function" ? data() : data;

  let output = levelName;
  if (typeof realisedData === "string") {
    output += ` event=${formatDatum(realisedData)}`;
  } else {
    for (const [key, value] of Object.entries(realisedData)) {
      output += ` ${key}=${formatDatum(value)}`;
    }
  }

  console.log(wrapper(output));
}

function formatDatum(datum: LogDatum): string {
  if (typeof datum === "string") {
    return stringifyJson(datum);
  } else if (typeof datum === "number") {
    return datum.toString();
  } else if (datum instanceof Date) {
    return datum.toISOString();
  } else {
    assertNever(datum);
  }
}
