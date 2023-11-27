import { Request, Response, NextFunction } from "express"

const Ajv = require("ajv")
const schemas = require("../../schema/cache.json")

const ajv = new Ajv()
class ApiMiddleware {
  constructor() {}

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

  public async exceptionHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const errStatus = err.statusCode || 422;
    const errMsg = err.message || "Something went wrong";
    const errCode = err.code || "internal_server_error";

    res.status(errStatus).json({
      success: false,
      statusCode: errStatus,
      message: errMsg,
      code: errCode,
      stack: process.env.NODE_ENV === "development" ? err.stack : {},
    });
  }

  // optional middle ware
  public async optionsMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (req.method !== "OPTIONS") {
      next();
      return;
    }

    res.statusCode = 200;
    res.end("OK");
  }

  // 404 middleware
  public async middleware404(req: Request, res: Response, next: NextFunction) {
    next({
      message: `No router for Requested URL ${req.originalUrl}`,
      statusCode: 404,
      errCode: `not_found`,
    });
  }

  // access control middleware
  public async accessControl(req: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
    next();
  }
}

export default new ApiMiddleware();
