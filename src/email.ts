import { JsonValue } from "std/json/mod.ts";
import { Config } from "src/config.ts";
import { error, info } from "src/log.ts";

class EmailSendingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailSendingError";
  }
}

export type Email = {
  toAddress: string;
  toName: string;
  subject: string;
  body: string;
};

export async function sendEmail(
  email: Email,
  config: Config,
): Promise<null | EmailSendingError> {
  const url = "https://api.zeptomail.com/v1.1/email";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "authorization": config.zeptomailApiKey,
    },
    body: JSON.stringify(emailJson(config, email)),
  });

  if (response.ok) {
    return emailSent(email);
  } else {
    return emailFailed(email, response);
  }
}

function emailSent(email: Email) {
  info({
    event: "email-sent",
    emailSubject: email.subject,
    emailToName: email.toName,
  });
  return null;
}

function emailJson(config: Config, email: Email): JsonValue {
  return {
    from: {
      name: config.emailFromName,
      address: config.emailFromAddress,
    },
    to: [{ email_address: { name: email.toName, address: email.toAddress } }],
    subject: email.subject,
    textbody: email.body,
  };
}

async function emailFailed(
  email: Email,
  response: Response,
): Promise<EmailSendingError> {
  const body = await response.text();
  error({
    event: "email-send-failed",
    emailSubject: email.subject,
    emailToName: email.toName,
    status: response.status,
    error: body,
  });
  const message =
    `Failed to send email "${email.subject}" to ${email.toName} ${response.statusText} ${body}`;
  return new EmailSendingError(message);
}
