import { Request } from "express";
// import nodemailer from "nodemailer"
// import Axios from "axios"
// import ejs from "ejs"
import jwt from "jsonwebtoken";
import path from "path";
// import Mailjet from "node-mailjet"
import moment from "moment";

import CommonModel from "../models/CommonModel";

/* load models */
export default {
  regexEmail,
  regexDob,
  regexMobile,
  regexPassword,
  listFunction,
  stringCaseSkipping,
};
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
