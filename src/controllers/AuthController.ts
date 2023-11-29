import { Request, Response, NextFunction } from "express";
import moment from "moment";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  Headers,
  Roles,
  AccountApprovalStatus,
  LogInWith,
  VerificationFor,
} from "../types/common";
import {
  CreateAuthPayload,
  SignInPayload,
  VerifyOtpByHash,
  VerifyOtpPayload,
  ResetPasswordPayload,
  DecryptData,
  AuthDetails,
  RegisterAPIPayload,
  SendOtpPayload,
  SendOtpByHashPayload,
  AuthTableData,
  AuthShortDetails,
  ChangePasswordPayload,
  CreateProfilePayload,
  ForgetPassword,
} from "../types/auths";
import {
  UserShortDetails,
  UserDetails,
  CreateUserApiPayload,
  CreateUserPayload,
} from "../types/users";
import { RoleDetails } from "../types/roles";
import CommonModel from "../models/CommonModel";

import helper, {
  generateOtp,
  sendSMS,
  sendOtpToEmail,
  decryptBycrypto,
  encryptionByCrypto,
} from "../helpers/helper";
import { BadRequestException, UnauthorizedException } from "../libs/exceptions";
import eventEmitter from "../libs/logging";
import { ApiResponse } from "../libs/ApiResponse";
import {
  VerificationDetails,
  VerificationTableData,
} from "../types/verifications";

class AuthController {
  private authCredentialModel;
  private roleModel;
  private verificationModel;
  private userModel;

  private authCredentialIdColumn: string = "credentialId";
  private userIdColumn: string = "userId";
  private roleIdColumn: string = "roleId";
  private verificationIdColumn: string = "verificationId";

  constructor() {
    this.authCredentialModel = new CommonModel(
      "authCredentials",
      this.authCredentialIdColumn,
      [],
    );
    this.roleModel = new CommonModel("roles", this.roleIdColumn, []);
    this.userModel = new CommonModel("users", this.userIdColumn, []);
    this.verificationModel = new CommonModel(
      "userVerifications",
      this.verificationIdColumn,
      [],
    );

    this.register = this.register.bind(this);
    this.sendOtpWithHash = this.sendOtpWithHash.bind(this);
    this.verifyingByHashOtp = this.verifyingByHashOtp.bind(this);
    this.verifyOtpAndUpdatePassword =
      this.verifyOtpAndUpdatePassword.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.signIn = this.signIn.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  public async register(req: Request, res: Response, next: NextFunction) {
    const response = new ApiResponse(res);
    try {
      await response.accumulatedAPITransactionBegin();

      let inputData: RegisterAPIPayload = req.body;

      // if (
      // 	(inputData.email ?? "").toString().trim() === "" &&
      // 	(inputData.mobile ?? "").toString().trim() === ""
      // ) {
      // 	throw new BadRequestException(
      // 		"Please enter a valid email id or mobile number.",
      // 		"not_found"
      // 	)
      // }

      // check if email id is of valid format
      if (!(await helper.regexEmail(inputData.email))) {
        throw new BadRequestException("Invalid email id.");
      }

      // check if email id already exists
      const [emailExist]: AuthShortDetails[] =
        await this.authCredentialModel.list({
          email: inputData.email,
          status: true,
        });

      if (emailExist) {
        throw new BadRequestException("User email already exists.");
      }

      // check if email id is of valid format
      if (!(await helper.regexMobile(inputData.mobile))) {
        throw new BadRequestException("Invalid mobile no.");
      }

      // check if email id already exists
      const [mobileExist]: AuthShortDetails[] =
        await this.authCredentialModel.list({
          mobile: inputData.mobile,
          status: true,
        });

      if (mobileExist) {
        throw new BadRequestException("Mobile number already exists.");
      }

      // validate roleid
      const [roleExist]: RoleDetails[] = await this.roleModel.list({
        roleId: inputData.roleId,
        status: true,
      });

      if (!roleExist) {
        throw new BadRequestException(
          `Role id ${inputData.roleId} not found.`,
          "not_found",
        );
      }

      // create new user
      const [createdUserData]: [UserDetails] = await this.userModel.bulkCreate(
        [
          {
            roleId: inputData.roleId,
            salutation: inputData.salutation,
            firstName: inputData.firstName,
            lastName: inputData.lastName,
            gender: inputData.gender,
            dob: inputData.dob,
          },
        ],
        Roles.SuperAdmin,
      );

      if (!createdUserData) {
        throw new BadRequestException("Unable to create user.");
      }

      // hashing password
      const salt: string = await bcrypt.genSalt(
        parseInt(process.env.SALT_ROUNDS as string),
      );
      const encryptedPassword = await bcrypt.hash(
        inputData.password.trim(),
        salt,
      );

      // create user auth credentials
      const [userAuthCreation]: [AuthDetails] =
        await this.authCredentialModel.bulkCreate([
          {
            userId: createdUserData.userId,
            email: inputData.email,
            mobile: inputData.mobile,
            password: encryptedPassword,
            createdBy: createdUserData.userId,
            updatedBy: createdUserData.userId,
          },
        ]);

      // sent verification link on email
      // encryption data
      const hashString: string = await helper.encryptionByCrypto({
        userId: userAuthCreation.userId,
        email: inputData.email,
      });

      const link: string = `${process.env.BASE_URL_WEB}/verify?hash=${hashString}`;

      // save hash in user
      await this.userModel.update(
        {
          secretHash: hashString,
        },
        createdUserData.userId,
      );

      // generate opt
      const otp: number = await helper.generateOtp();

      const encryptedOtp = await helper.encryptionByCrypto({
        otp,
        expiresIn: moment().add(
          Number(process.env.OTP_EXPIRATION_IN_MINUTES),
          "minutes",
        ),
      });

      await Promise.all([
        // send verification mail
        helper.sendVerificationEmail(
          userAuthCreation.email ?? "",
          link,
          `User`,
        ),
        // send otp to mobile
        helper.sendSMS(userAuthCreation.mobile, otp),
      ]);

      // verification code
      await this.verificationModel.bulkCreate(
        [
          {
            userId: userAuthCreation.userId,
            valueForMobile: userAuthCreation.mobile,
            otpForMobile: encryptedOtp,
          },
        ],
        userAuthCreation.userId,
      );

      await response.accumulatedAPITransactionSucceed();
      // return response
      return response.successResponse({
        message: `User created successfully`,
        data: createdUserData,
      });
    } catch (error) {
      await response.accumulatedAPITransactionFailed();

      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }

  public async sendOtpWithHash(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const response = new ApiResponse(res);
      const { hash }: SendOtpByHashPayload = req.body;
      // check for valid hash
      const [userData]: UserDetails[] = await this.userModel.list({
        secretHash: hash.toString().trim(),
      });

      if (!userData) {
        throw new BadRequestException("Invalid link");
      }

      // decrypt hash
      const decryptData: DecryptData = await decryptBycrypto(hash);
      const { email, userId }: DecryptData = decryptData;

      // check if user exists
      const [authDetails]: AuthDetails[] = await this.authCredentialModel.list({
        userId,
      });
      if (!authDetails) {
        throw new BadRequestException("Invalid user.");
      }

      // generate otp
      const otp: number = await generateOtp();

      // create encryption
      const encryptedOtp: string = await helper.encryptionByCrypto({
        otp,
        expiresIn: moment().add(
          Number(process.env.OTP_EXPIRATION_IN_MINUTES),
          "minutes",
        ),
      });

      const [verificationExists]: [VerificationDetails] =
        await this.verificationModel.list({
          userId,
          status: true,
        });

      if (verificationExists) {
        await this.verificationModel.update(
          {
            valueForEmail: authDetails.email,
            isEmailVerified: false,
            otpForEmail: encryptedOtp,
          },
          verificationExists.verificationId,
        );
      } else {
        await this.verificationModel.bulkCreate(
          [
            {
              valueForEmail: authDetails.email,
              isEmailVerified: false,
              verificationFor: VerificationFor.Auth,
              otpForEmail: encryptedOtp,
            },
          ],
          userId,
        );
      }
      // delete existing non-verified entries
      // await this.verificationModel.softDeleteByFilter(
      // 	{
      // 		value: authDetails.email,
      // 		isEmailVerified: false
      // 	},
      // 	userId
      // )
      // await this.verificationModel.bulkCreate(
      // 	[
      // 		{
      // 			verificationType: LogInWith.Email,
      // 			value: authDetails.userName,
      // 			isVerified: false,
      // 			verificationFor: VerificationFor.Auth,
      // 			otp: encryptedOtp
      // 		}
      // 	],
      // 	userId
      // )

      // send otp to email
      await sendOtpToEmail(email, otp, "User");

      return response.successResponse({
        success: true,
        message: `OTP sent successfully`,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }

  public async verifyingByHashOtp(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const response = new ApiResponse(res);
      const { hash, otp }: VerifyOtpByHash = req.body;
      const decryptData: DecryptData = await decryptBycrypto(hash);
      const { email, userId }: DecryptData = decryptData;

      // check for valid hash
      const [userData]: UserShortDetails[] = await this.userModel.list({
        secretHash: hash.toString().trim(),
      });

      // check if otp is valid
      const [verificationData]: VerificationTableData[] =
        await this.verificationModel.list({
          valueForEmail: email,
          isEmailVerified: false,
          verificationFor: VerificationFor.Auth,
          status: true,
        });
      if (!verificationData) {
        throw new BadRequestException("Invalid user.");
      }

      if (!userData) {
        throw new BadRequestException("Invalid link.");
      }

      let decoded: any = await decryptBycrypto(
        (verificationData?.otpForEmail).toString().trim(),
      );

      if (
        parseInt(decoded?.otp) !== parseInt(otp.toString()) ||
        moment().diff(moment(decoded.expiresIn)) > 0
      ) {
        throw new BadRequestException(
          "Invalid OTP. Please resend and try again.",
        );
      }

      // mark OTP as used
      await this.verificationModel.update(
        { isEmailVerified: true },
        verificationData.verificationId,
      );

      // remove hash
      await this.userModel.update(
        {
          secretHash: null,
        },
        userId,
      );

      return response.successResponse({
        success: true,
        message: `OTP verified successfully`,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }

  public async verifyOtpAndUpdatePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const response = new ApiResponse(res);
      let { hash, otp, password }: ResetPasswordPayload = req.body;

      // check for valid hash
      const [userData]: UserDetails[] = await this.userModel.list({
        secretHash: hash.toString().trim(),
      });
      if (!userData) {
        throw new BadRequestException("Invalid link.");
      }

      // encrypt password
      // const isValidPassword: boolean = await helper.regexPassword(password)
      // if (!isValidPassword) {
      // 	throw new BadRequestException(
      // 		"Password must be more then 8 char.",
      // 		"validation_error"
      // 	)
      // }
      // hashing password
      const salt: string = await bcrypt.genSalt(
        parseInt(process.env.SALT_ROUNDS as string),
      );
      password = await bcrypt.hash(password.trim(), salt);

      const decryptData: DecryptData = await decryptBycrypto(hash);
      const { email, userId } = decryptData;
      // check if user & verification exist
      const [[authCredential], [verificationData]]: [
        AuthDetails[],
        VerificationTableData[],
      ] = await Promise.all([
        // authCredential
        this.authCredentialModel.list({ email }),

        // verification
        this.verificationModel.list({
          valueForEmail: email,
          isEmailVerified: false,
          verificationFor: VerificationFor.Auth,
          status: true,
        }),
      ]);

      // check if otp is valid
      let decoded: any = await decryptBycrypto(
        (verificationData?.otpForEmail).toString().trim(),
      );

      if (
        parseInt(decoded?.otp) !== parseInt(otp.toString()) ||
        moment().diff(moment(decoded.expiresIn)) > 0
      ) {
        throw new BadRequestException(
          "Invalid OTP. Please resend and try again.",
        );
      }

      if (!authCredential && !verificationData) {
        await Promise.all([
          this.verificationModel.bulkCreate([
            {
              valueForEmail: email,
              isEmailVerified: true,
              verificationFor: VerificationFor.Auth,
            },
          ]),

          // update password
          this.authCredentialModel.bulkCreate([
            {
              userId: userId,
              email,
              password,
            },
          ]),
        ]);
      } else if (!authCredential) {
        await Promise.all([
          // update otp
          this.verificationModel.update(
            { isEmailVerified: true },
            verificationData.verificationId,
          ),

          // update password
          this.authCredentialModel.bulkCreate([
            {
              userId: userId,
              email,
              password,
            },
          ]),
        ]);
      } else if (!verificationData) {
        await Promise.all([
          // update otp
          this.verificationModel.bulkCreate([
            {
              valueForEmail: email,
              isEmailVerified: true,
              verificationFor: VerificationFor.Auth,
            },
          ]),

          // update password
          this.authCredentialModel.update(
            { password },
            authCredential.credentialId,
          ),
        ]);
      } else {
        await Promise.all([
          // update otp
          this.verificationModel.update(
            { isEmailVerified: true },
            verificationData.verificationId,
          ),

          // update password
          this.authCredentialModel.update(
            { password },
            authCredential.credentialId,
          ),
        ]);
      }

      // remove hash
      await this.userModel.update(
        {
          secretHash: null,
        },
        userId,
      );

      return response.successResponse({
        success: true,
        message: `Otp verified and password updated successfully.`,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }

  // change password
  public async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const response = new ApiResponse(res);
      let { email, previousPassword, newPassword }: ChangePasswordPayload =
        req.body;

      // check for valid hash
      const [authData]: AuthDetails[] = await this.authCredentialModel.list({
        email,
      });

      if (!authData) {
        throw new BadRequestException("Invalid credentials.");
      }

      // encrypt password
      // const isValidPassword: boolean = await helper.regexPassword(password)
      // if (!isValidPassword) {
      // 	throw new BadRequestException(
      // 		"Password must be more then 8 char!",
      // 		"validation_error"
      // 	)
      // }

      // password comparison
      if (!(await bcrypt.compare(previousPassword, authData?.password))) {
        throw new UnauthorizedException("Invalid password.");
      }

      // new pass word encryption
      const salt: string = await bcrypt.genSalt(
        parseInt(process.env.SALT_ROUNDS as string),
      );
      const encryptedPassword = await bcrypt.hash(newPassword.trim(), salt);

      // remove hash
      await this.authCredentialModel.update(
        {
          password: encryptedPassword,
        },
        authData.userId,
      );

      return response.successResponse({
        success: true,
        message: `Password updated successfully.`,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }

  // will send verification mail
  public async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const response = new ApiResponse(res);
      let { email, mobile }: ForgetPassword = req.body;

      if ((email ?? "").trim() === "" || (mobile ?? "").trim() === "") {
        throw new BadRequestException(
          "Please enter a valid email id or mobile number.",
          "not_found",
        );
      }

      // check if email id is of valid format
      // if (!(await helper.regexEmail(userName))) {
      // 	throw new BadRequestException("Invalid email id.")
      // }

      // check if email id already exists
      const [userCredentialData]: AuthDetails[] =
        await this.authCredentialModel.list({
          email,
          mobile,
        });

      if (!userCredentialData) {
        throw new BadRequestException("Invalid user.");
      }

      const [userData]: UserDetails[] = await this.userModel.list({
        userId: userCredentialData.userId,
      });

      if (!userData) {
        throw new BadRequestException("Invalid user.");
      }

      if (email) {
        // sent verification link on email
        // encryption data
        const hashString: string = await helper.encryptionByCrypto({
          userId: userCredentialData.userId,
          email,
        });

        const link: string = `${process.env.BASE_URL_WEB}/verify?hash=${hashString}`;

        // save hash in user
        await this.userModel.update(
          {
            secretHash: hashString,
          },
          userData.userId,
        );

        // send verification mail
        await helper.sendVerificationEmail(
          userCredentialData.email ?? "",
          link,
          `${userData?.firstName ?? "User"} ${userData?.lastName ?? ""}`,
        );
      }

      if (mobile) {
        // generate opt
        const otp: number = await helper.generateOtp();

        const encryptedOtp = await helper.encryptionByCrypto({
          otp,
          expiresIn: moment().add(
            Number(process.env.OTP_EXPIRATION_IN_MINUTES),
            "minutes",
          ),
        });

        // send otp to mobile
        await helper.sendSMS(mobile, otp);

        const [verificationData]: [VerificationDetails] =
          await this.verificationModel.list({
            userId: userCredentialData.userId,
          });

        if (verificationData) {
          await this.verificationModel.update(
            {
              userId: verificationData.userId,
              valueForMobile: mobile,
              otpForMobile: encryptedOtp,
            },
            verificationData.verificationId,
          );
        }
      }

      // return response
      return response.successResponse({
        success: true,
        message: `Verification link sent successfully.`,
      });
      // }
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }

  public async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const response = new ApiResponse(res);
      const inputData: SignInPayload = req.body;

      if (!inputData.email && !inputData.mobile) {
        throw new BadRequestException("Missing email or mobile.", "not_found");
      }

      // check if userName is valid
      const [authCredential]: AuthDetails[] =
        await this.authCredentialModel.list({
          email: inputData.email,
          mobile: inputData.mobile,
        });

      if (!authCredential) {
        throw new UnauthorizedException("Invalid credential. Please try again");
      }

      let verificationPayload: any = {};

      if (inputData.email) {
        verificationPayload.valueForEmail = inputData.email;
      } else if (inputData.mobile) {
        verificationPayload.valueForMobile = inputData.mobile;
      }

      // check if user is valid
      const [verificationData]: VerificationDetails[] =
        await this.verificationModel.list(verificationPayload);
      if (
        (inputData.email && !verificationData?.isEmailVerified) ||
        (inputData.mobile && !verificationData?.isMobileVerified)
      ) {
        throw new UnauthorizedException("User is not verified");
      }

      const isValidPassword: boolean = await bcrypt.compare(
        inputData.password,
        authCredential?.password,
      );
      if (!isValidPassword) {
        throw new UnauthorizedException("Invalid credential. Please try again");
      }

      await Promise.all([
        // update lastActiveOn
        this.authCredentialModel.update(
          { lastActiveOn: moment().format("YYYY-MM-DD") },
          authCredential.userId,
        ),
      ]);

      // generate token
      const token: string = jwt.sign(
        {
          userId: authCredential.userId,
          email: authCredential.email,
          mobile: authCredential.mobile,
        },
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: process.env.JWT_TOKEN_EXPIRATION as string,
        },
      );

      let [data]: UserShortDetails[] = await this.userModel.list({
        userId: authCredential.userId,
      });

      // delete data?.secretHash

      return response.successResponse({
        message: `Sign-in successful`,
        token,
        data,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const response = new ApiResponse(res);
      let accessToken: string = req.headers.authorization as string;
      if (!accessToken) {
        throw new BadRequestException(
          "Missing authorization header",
          "invalid_token",
        );
      }

      // @ts-ignore
      accessToken = accessToken.split("Bearer").pop().trim();

      let decodedToken = jwt.decode(accessToken);
      if (!decodedToken) {
        throw new BadRequestException("Invalid token", "invalid_token");
      }

      // @ts-ignore
      delete decodedToken.iat;
      // @ts-ignore
      delete decodedToken.exp;
      // @ts-ignore
      delete decodedToken.nbf;
      // @ts-ignore
      delete decodedToken.jti;

      // generate new token
      const token: string = jwt.sign(
        // @ts-ignore
        decodedToken,
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: process.env.JWT_TOKEN_EXPIRATION as string,
        },
      );
      return response.successResponse({
        message: `Refresh token generated successfully`,
        token,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }
}

export default new AuthController();
