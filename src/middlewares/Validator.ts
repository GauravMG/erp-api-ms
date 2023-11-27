import {Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"
const Ajv = require("ajv")
import CommonModel from "../models/CommonModel"
import {BadRequestException} from "../libs/exceptions"
// import {UrlSchema} from "../types/common"

// import schemas from "../../schema/cache.json"
const schemas = require("../../schema/cache.json")
// import publicApis from "../schemas/publicRoutes.json"
// import reservedApi from "../schemas/reservedRoutes.json"

const ajv = new Ajv()

class Validator {
	super() {}

	public async schemaValidation(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		let reqUrl: string = req.url
		const typeModule: string[] = reqUrl.split("/")
		typeModule.pop()
		const schemaModulePath = Object.keys(schemas).find(
			(el) => el === typeModule.join("/")
		)

		if (schemaModulePath) {
			// @ts-ignore
			const schemaModule = schemas[schemaModulePath]
			// @ts-ignore
			const schema = schemaModule["schemas"]
			const apiSchema = Object.keys(schema).find((el) => el === reqUrl)
			if (apiSchema) {
				// @ts-ignore
				const valid = ajv.validate(schema[apiSchema], req.body)

				if (!valid) {
					next({
						statusCode: 403,
						code: `invalid_data`,
						message: ajv.errors[0].message
					})
				}
			}
		}
		next()
	}

	public async validateToken(req: Request, res: Response, next: NextFunction) {
		try {
			const reqUrl: string = req.url
			const reqMethod: string = req.method
			const userModel = new CommonModel("users", "userId", [])
            // @ts-ignore
			const publicApi: UrlSchema | undefined = publicApis.find(
                // @ts-ignore
				(el) => el.apiPath === reqUrl && el.method === reqMethod
			)
			if (publicApi) {
				return next()
			}
			// api with basic auth
			// const apiWithBasicAuth: UrlSchema | undefined = apiWithBasicAuths.find(
			// 	(el) => el.apiPath === reqUrl && el.method === reqMethod
			// )
			// if (apiWithBasicAuth) {
			// 	const secretKey: string = req.headers?.authorization as string

			// 	if (!secretKey) {
			// 		throw new BadRequestException(
			// 			"No secret key is passed",
			// 			"unauthorized"
			// 		)
			// 	}

			// 	// check if list has api
			// 	const [basicAuthData]: BasicAuthShortDetails[] =
			// 		await clientBasicAuthModel.list({
			// 			secretKey
			// 		})

			// 	// basic auth not matched
			// 	if (!basicAuthData) {
			// 		throw new BadRequestException("Not authorized", "unauthorized")
			// 	}

			// 	req.headers.clientId =
			// 		typeof basicAuthData.clientId === "number"
			// 			? JSON.stringify(basicAuthData.clientId)
			// 			: basicAuthData.clientId

			// 	// get first non deleted and active admin
			// 	const [userDetails]: UserShortDetails[] = await userModel.list({
			// 		clientId: basicAuthData.clientId,
			// 		roleId: Role.ADMIN
			// 	})

			// 	req.headers.userId =
			// 		typeof userDetails.userId === "number"
			// 			? JSON.stringify(userDetails.userId)
			// 			: userDetails.userId
			// 	req.headers.roleId =
			// 		typeof userDetails.roleId === "number"
			// 			? JSON.stringify(userDetails.roleId)
			// 			: userDetails.roleId
			// 	return next()
			// }

			let token: string = req.headers.authorization as string
			if (!token) {
				return res.status(401).json({
					errorCode: `invalid_token`,
					message: `Missing authorization header`
				})
			}

			// @ts-ignore
			token = token.split("Bearer").pop().trim()

			const decoded = await jwt.verify(
				token,
				process.env.JWT_SECRET_KEY as string
			)
			if (!decoded) {
				throw new BadRequestException("Invalid token")
			}
			const userId =
				typeof decoded === "string"
					? JSON.parse(decoded)?.userId ?? null
					: decoded?.userId ?? null
			if (!userId) {
				throw new BadRequestException("User does not exist")
			}

			const userExist = await userModel.list({userId})
			if (!userExist?.length) {
				return res.status(401).json({
					errorCode: `invalid_token`,
					message: `User does not exist`
				})
			}

			// userID
			req.headers.userId = userExist[0].userId

			// roleID
			req.headers.roleId = userExist[0].roleId

			next()
		} catch (err) {
			return res.status(401).json({
				errorCode: `invalid_token`,
				message: `Please check credentials and try again`
			})
		}
	}

	public async roleValidation(req: Request, res: Response, next: NextFunction) {
		const roleId: number = Number(req.headers.roleId as string)
		const reqUrl: string = req.url
		const reqMethod: string = req.method
		let isPermissionRequired: boolean = false
		let roleSlug: string = ""
// @ts-ignore
		for (let i = 0; i < reservedApi.length; i++) {
			if (
                // @ts-ignore
				reqUrl === reservedApi[i].apiPath &&
                // @ts-ignore
				reqMethod === reservedApi[i].method
			) {
				isPermissionRequired = true
                // @ts-ignore
				roleSlug = reservedApi[i].slug
			}
		}

		// check for permissions required
		if (!isPermissionRequired) {
			return next()
		}

		// get role
		const roleCommonModel = new CommonModel("roles", "roleId", [])
		const [roleDetails] = await roleCommonModel.list({
			slug: roleSlug
		})

		// validate roleId
		if (isNaN(roleId) || Number(roleId) !== Number(roleDetails.roleId)) {
			return next({
				statusCode: 403,
				message: "Forbidden request"
			})
		}

		next()
	}
}

export default new Validator()
