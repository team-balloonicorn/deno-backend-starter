export type Config = {
  signingSecret: string;
  zeptomailApiKey: string;
  emailFromName: string;
  emailFromAddress: string;
};

// Load the config from the environment. If any environment variables are
// missing this is considered a fatal error and an exception is thrown.
export function loadFromEnvironmentVariables(): Config {
  const getEnv = (name: string): string => {
    const value = Deno.env.get(name);
    if (value === undefined) {
      throw new Error(`Missing environment variable ${name}`);
    }
    return value;
  };
  return {
    signingSecret: getEnv("SIGNING_SECRET"),
    zeptomailApiKey: getEnv("ZEPTOMAIL_API_KEY"),
    emailFromName: getEnv("EMAIL_FROM_NAME"),
    emailFromAddress: getEnv("EMAIL_FROM_ADDRESS"),
  };
}
