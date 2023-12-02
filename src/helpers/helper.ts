import { Request } from "express";
import nodemailer from "nodemailer";
// import Axios from "axios"
import ejs from "ejs";
import jwt from "jsonwebtoken";
import path from "path";
import Mailjet from "node-mailjet";
import moment from "moment";
import Crypto from "crypto";

import {
  ActiveNotificationService,
  Configuration,
  EmailAddressData,
  EmailBodyDetails,
  EmailTransportConfiguration,
  NotificationServiceDetails,
} from "../types/notification-services";
import { NotificationServices } from "../types/common";
import CommonModel from "../models/CommonModel";
import { BadRequestException } from "../libs/exceptions";
import eventEmitter from "../libs/logging";

/* load models */
export default {
  generateOtp,
  sendSMS,
  sendOtpToEmail,
  regexEmail,
  regexDob,
  regexMobile,
  regexPassword,
  listFunction,
  stringCaseSkipping,
  encryptionByCrypto,
  sendVerificationEmail,
};

export async function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000);
}

export async function sendSMS(mobile: any, message: any) {}

export async function getActiveEmailProvider() {
  const model = new CommonModel(
    "notificationServices",
    "notificationServiceId",
    [],
  );

  const activeMailService: NotificationServiceDetails[] = await model.list({
    isActive: true,
  });
  if (!activeMailService?.length) {
    return null;
  }
  const detailData: ActiveNotificationService = {
    service: activeMailService[0]?.service,
    serviceType: activeMailService[0]?.serviceType,
    configuration: activeMailService[0]?.configuration,
    host: activeMailService[0]?.host,
    port: activeMailService[0]?.port,
    encryption: activeMailService[0]?.encryption,
  };
  return activeMailService?.length ? detailData : null;
}

export async function sendOtpToEmail(
  email: string,
  otp: number,
  firstName: string,
) {
  // need to pass the email
  const notificationData: ActiveNotificationService | null =
    await getActiveEmailProvider();
  if (!notificationData) {
    throw "No active email found";
  }

  const configuration = {
    email: [email],
    from: notificationData.configuration?.from,
    publicKey: notificationData.configuration?.publicKey,
    privateKey: notificationData.configuration?.privateKey,
    subject: "Verify your email!",
    fileName: "otp_email.ejs",
    firstNameR: firstName,
    otp,
  };

  // sendMailByMailjet(configuration)
}

// get data from configuration
const encryptCred: {
  secret_key: string;
  secret_iv: string;
  encryption_method: string;
} = {
  secret_key: process.env.CRYPTO_SECRET_KEY as string,
  secret_iv: process.env.CRYPTO_SECRET_IV as string,
  encryption_method: process.env.CRYPTO_ENCRYPTION_METHOD as string,
};

// Generate secret hash with crypto to use for encryption
const key = Crypto.createHash("sha256")
  .update(encryptCred.secret_key)
  .digest("hex")
  .substring(0, 32);
const encryptionIV = Crypto.createHash("sha256")
  .update(encryptCred.secret_iv)
  .digest("hex")
  .substring(0, 16);

// encrypt by crypto aes 256
export async function encryptionByCrypto(data: any) {
  data = typeof data === "object" ? JSON.stringify(data) : data;
  if (
    !encryptCred.secret_key ||
    !encryptCred.secret_iv ||
    !encryptCred.encryption_method
  ) {
    throw new Error("secretKey, secretIV, and ecnryption Method are required");
  }

  // 	// Encrypt data
  const cipher = Crypto.createCipheriv(
    encryptCred.encryption_method,
    key,
    encryptionIV,
  );
  return Buffer.from(
    cipher.update(data, "utf8", "hex") + cipher.final("hex"),
  ).toString("base64");
}

// decrypt by crypto aes 256
export async function decryptBycrypto(encryptedData: string) {
  const buff = Buffer.from(encryptedData, "base64");
  const decipher = Crypto.createDecipheriv(
    encryptCred.encryption_method,
    key,
    encryptionIV,
  );
  return JSON.parse(
    decipher.update(buff.toString("utf8"), "hex", "utf8") +
      decipher.final("utf8"),
  );
}
export async function sendEmailToEmail(configuration: Configuration) {
  try {
    const emailProviderByService: ActiveNotificationService | null =
      await getActiveEmailProvider();
    if (!emailProviderByService) {
      throw new BadRequestException("No active notification service found");
    }
    if (!configuration.fileName) {
      configuration.fileName = "default.ejs";
    }
    // node mailer config
    const config: EmailTransportConfiguration = {
      host: emailProviderByService.host as string,
      port: parseInt(emailProviderByService.port as string),
      auth: {
        user: emailProviderByService.configuration?.publicKey as string,
        pass: emailProviderByService.configuration?.privateKey as string,
      },
    };
    const transport = nodemailer.createTransport(config);
    const emailArr: EmailAddressData[] = [];
    const ccEmailArr: string[] = [];
    const bccEmailArr: string[] = [];

    if (Array.isArray(configuration.email)) {
      configuration.email.forEach((email) => {
        emailArr.push({
          Email: email,
        });
      });
    } else if (configuration.email) {
      emailArr.push({
        Email: configuration.email,
      });
    }

    if (Array.isArray(configuration?.cc)) {
      configuration.cc.forEach((email) => {
        ccEmailArr.push(email);
      });
    } else if (configuration.cc) {
      ccEmailArr.push(configuration.cc);
    }

    if (Array.isArray(configuration.bcc)) {
      configuration.bcc?.forEach((email) => {
        bccEmailArr.push(email);
      });
    } else if (configuration.bcc) {
      bccEmailArr.push(configuration.bcc);
    }

    return new Promise((resolve, reject) => {
      ejs.renderFile(
        path.join(__dirname, `../../views/email/en/${configuration.fileName}`),
        configuration,
        (err, result) => {
          emailArr.forEach((_email) => {
            if (err) {
              eventEmitter.emit("logging", err?.message.toString());
              return reject(err);
            } else {
              const message: EmailBodyDetails = {
                from: configuration.from as string,
                to: _email.Email,
                cc: ccEmailArr,
                bcc: bccEmailArr,
                subject: configuration.subject as string,
                html: result,
                attachments: configuration.attachments,
              };
              transport.sendMail(message, function (err1, info) {
                if (err1) {
                  eventEmitter.emit("logging", err1?.message.toString());
                  return reject(err1);
                } else {
                  return resolve(info);
                }
              });
            }
          });
        },
      );
    });
  } catch (error: any) {
    eventEmitter.emit("logging", error?.message.toString());
    throw error;
  }
}

export async function sendMailByMailjet(configuration: Configuration) {
  try {
    return new Promise(async (resolve, reject) => {
      if (!configuration.fileName) {
        configuration.fileName = "default.ejs";
      }

      const mailjet = Mailjet.apiConnect(
        configuration.publicKey as string,
        configuration.privateKey as string,
      );
      const emailArr: EmailAddressData[] = [];
      if (Array.isArray(configuration.email)) {
        configuration.email.forEach((email) => {
          emailArr.push({
            Email: email,
          });
        });
      } else if (configuration.email) {
        emailArr.push({
          Email: configuration.email,
        });
      }

      // for Cc mails
      const ccEmailArr: EmailAddressData[] = [];
      if (Array.isArray(configuration?.cc)) {
        configuration.cc.forEach((email) => {
          ccEmailArr.push({
            Email: email,
          });
        });
      } else if (configuration.cc) {
        ccEmailArr.push({
          Email: configuration.cc,
        });
      }

      // for Bcc mails
      const bccEmailArr: EmailAddressData[] = [];

      if (Array.isArray(configuration?.bcc)) {
        configuration.bcc.forEach((email) => {
          bccEmailArr.push({
            Email: email,
          });
        });
      } else if (configuration.bcc) {
        bccEmailArr.push({
          Email: configuration.bcc,
        });
      }

      ejs.renderFile(
        path.join(__dirname, `../views/email/en/${configuration.fileName}`),
        configuration,
        (err, result) => {
          if (err) {
            return reject(err);
          }

          mailjet
            .post("send", { version: "v3.1" })
            .request({
              Messages: [
                {
                  From: {
                    Email: configuration.from,
                  },
                  To: emailArr,
                  Subject: configuration.subject,
                  TextPart: configuration.body,
                  HTMLPart: result,
                },
              ],
            })
            .then((result) => {
              return resolve(result.body);
            })
            .catch((err) => {
              return reject(err.response.data);
            });
        },
      );
    });
  } catch (error) {
    throw error;
  }
}

export function mailingServiceChecker(service: string, configuration: any) {
  if (service === NotificationServices.Mailjet) {
    sendMailByMailjet(configuration);
  } else if (service === NotificationServices.Google) {
    sendEmailToEmail(configuration);
  } else {
    throw new BadRequestException("Cannot send mail");
  }
}

export async function sendVerificationEmail(
  email: string,
  link: string,
  firstName: string,
) {
  // need to pass the email
  const notificationData: ActiveNotificationService | null =
    await getActiveEmailProvider();
  if (!notificationData) {
    throw new BadRequestException("Cannot send mail");
  }

  const configuration = {
    email: [email],
    from: notificationData.configuration?.from,
    publicKey: notificationData.configuration?.publicKey,
    privateKey: notificationData.configuration?.privateKey,
    subject: "Verify your email",
    fileName: "verification.ejs",
    firstNameR: firstName,
    link,
  };
  mailingServiceChecker(notificationData.service, configuration);
}

export async function regexEmail(email: string) {
  const emailRegex = new RegExp(
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  );
  const isValidEmail: boolean = emailRegex.test(email);
  return isValidEmail;
}

export async function regexMobile(mobile: string) {
  const phoneRegex = new RegExp(/^[6789]\d{9}$/);
  const isValidPhone: boolean = phoneRegex.test(mobile);
  return isValidPhone;
}

export async function regexDob(dob: string) {
  const dobRegex = new RegExp(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
  const isValidDob: boolean = dobRegex.test(dob);
  return isValidDob;
}

export async function regexPassword(password: string) {
  const clientSecretRegex = new RegExp(/[A-Za-z0-9]{8}/);
  const isValidPassword: boolean = clientSecretRegex.test(password);
  return isValidPassword;
}

export async function listFunction(inputData: any) {
  inputData.filter =
    [undefined, null].indexOf(inputData.filter) < 0
      ? typeof inputData.filter === "string"
        ? JSON.parse(inputData.filter)
        : inputData.filter
      : null;
  inputData.range =
    [undefined, null].indexOf(inputData.range) < 0
      ? typeof inputData.range === "string"
        ? JSON.parse(inputData.range)
        : inputData.range
      : null;
  inputData.sort =
    [undefined, null].indexOf(inputData.sort) < 0
      ? typeof inputData.sort === "string"
        ? JSON.parse(inputData.sort)
        : inputData.sort
      : null;

  return {
    filter: inputData.filter ?? null,
    range: inputData.range ?? null,
    sort: inputData.sort ?? null,
  };
}

// single quote double qoute case
export async function stringCaseSkipping(dataString: string) {
  //  return dataString
  if (dataString.includes("'")) {
    const stringArr = dataString.split("'");
    const stringFormat = stringArr.map((el) =>
      el.indexOf("'") ? el.replace(/'/g, "''") : el,
    );
    return stringFormat.join("''");
  } else if (dataString.includes('"')) {
    const stringArr = dataString.split('"');
    const stringFormat = stringArr.map((el) =>
      el.indexOf('"') ? el.replace(/"/g, '""') : el,
    );
    return stringFormat.join('""');
  }
  return dataString;
}
