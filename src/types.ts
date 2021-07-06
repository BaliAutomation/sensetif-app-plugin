export interface SensetifAppSettings {
  customText?: string;
  customCheckbox?: boolean;
}

export interface ProjectSettings {
  name: string; // validate regexp:[a-z][A-Za-z0-9_]*
  title: string; // allow all characters
  city: string; // allow all characters
  country: string; // country list?
  timezone: string; // "UTC" or {continent}/{city}, ex Europe/Stockholm
  geolocation: string; // geo coordinates
  subsystems: SubsystemSettings[];
}

export interface SubsystemSettings {
  project: string;
  name: string; // validate regexp:[a-z][A-Za-z0-9_]*
  title: string; // allow all characters
  locallocation: string; // allow all characters
  datapoints: DatapointSettings[];
}

export interface DatapointSettings {
  project: string;
  subsystem: string;
  name: string; // validate regexp:[a-z][A-Za-z0-9_.]*
  interval: PollInterval;
  url: string; // validate URL, incl anchor and query arguments, but disallow user:pwd@

  // Authentication is going to need a lot in the future, but for now user/pass is fine
  authenticationType: AuthenticationType;
  auth?: {
    u: string;
    p: string;
  }; // If authenticationType===basic, then auth contains "u" and "p" for user and password.

  format: OriginDocumentFormat;
  valueExpression: string; // if format==xml, then xpath. if format==json, then jsonpath. If there is library available for validation, do that. If not, put in a function and we figure that out later.
  unit: string; // Allow all characters

  // Ideally only show k and m for ScalingFunctions that uses them, and show the formula with the scaling function
  scaling: ScalingFunction;
  k: number;
  m: number;

  timestampType: TimestampType;
  timestampExpression: string; // if format==xml, then xpath. if format==json, then jsonpath.
  timeToLive: TimeToLive;
}

export enum TimeToLive {
  a, // 3 months
  b, // 6 months
  c, // 1 year
  d, // 2 years
  e, // 3 years
  f, // 4 years
  g, // 5 years
  h, // forever
}

export enum TimestampType {
  epochMillis,
  epochSeconds,
  iso8601_zoned,
  iso8601_offset,
  polltime,
}

export enum ScalingFunction {
  /** f(x) = k * x + m */
  lin,

  /** f(x) = k * ln(m*x) */
  log,

  /** f(x) = k * e^(m*x) */
  exp,

  /** Inputs are degrees, to be converted to radians. */
  rad,

  /** Input are radians, to be converted to degrees. */
  deg,

  /** Input Fahrenheit, output Celsius */
  fToC,

  /** Input Celsius, output Fahrenheit */
  cToF,

  /** Input Kelvin, output Celsius */
  kToC,

  /** Input Celsius, output Kelvin */
  cToK,

  /** Input Fahrenheit, output Kelvin */
  fToK,

  /** Input Kelvin, output Fahrenheit */
  kTof,
}

export enum PollInterval {
  a, // 1 minutes (do not show)
  b, // 5 minutes
  c, // 10 minutes
  d, // 15 minutes
  e, // 30 minutes
  f, // 1 hour
  g, // 3 hours
  h, // 6 hours
  i, // 12 hours
  j, // 24 hours
}
export enum OriginDocumentFormat {
  json,
  xml,
  //  ttn,    // The Things Network
}

export enum AuthenticationType {
  none,
  basic,
  authorizationKey,
}

export interface GlobalSettings {}
