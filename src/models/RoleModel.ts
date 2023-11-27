import { ProvidersFactory } from "../libs/ProvidersFactory"
// import {  } from "../types/common"

type Range = {
    page: number,
    pageSize: number
}
export default class RoleModel {
    private TABLE_NAME: string
    private ID_COLUMN_NAME: string
    private SEARCH_COLUMN_NAME: string[]

    constructor(tableName: string, idColumnName: string, searchColumnName: string[]) {
        this.TABLE_NAME = tableName
        this.ID_COLUMN_NAME = idColumnName
        this.SEARCH_COLUMN_NAME = searchColumnName
    }

    list = async (
        filter: any,
        range?: Range,
        sort?: any,
        fields?: string[],
        isCount?: boolean
    ) => {
        const providersFactory = new ProvidersFactory()
        const { query, release } = await providersFactory.transaction(process.env.DB_NAME as string)
        try {
            // filters
            let whereArr: string[] = [`"deletedAt" IS NULL`]

            if (filter && Object.keys(filter).length) {
                Object.keys(filter).map((column) => {
                    if (filter[column] === undefined || filter[column] === null || String(filter[column]).trim() === "") {
                        return
                    }
                    if (column === "search") {
                        let whereSearch: string[] = this.SEARCH_COLUMN_NAME.map((el) => {
                            return `"${el}" ILIKE '%${filter[column]}%'`
                        })
                        whereArr.push(`(${whereSearch.join(" OR ")})`)
                    } else {
                        switch (typeof filter[column] as string) {
                            case "number": whereArr.push(`"${column}" = ${filter[column]}`)
                                break;
                            case "object": if (Array.isArray(filter[column])) {
                                whereArr.push(`"${column}" IN(${filter[column].join(", ")})`)
                            }
                                break;
                            default: whereArr.push(`"${column}" = '${filter[column]}'`)
                        }
                    }
                })
            }

            // pagination
            let limit: number = 100
            let offset: number = 0
            if (range) {
                range.page = range.page ? range.page : 1
                limit = range.pageSize
                offset = (range.page - 1) * range.pageSize
            }

            // sorting
            let sortArr: string[] = [`"createdAt" DESC`]
            if (sort && Object.keys(sort).length > 0) {
                sortArr = Object.keys(sort).map((key) => `"${key}" ${sort[key]}`)
            }

            let sqlFields
            if (fields) {
                if (fields.length > 0) {
                    if (!isCount) {
                        sqlFields = `"${fields.join('", "')}"`
                    } else {
                        sqlFields = `${fields[0]}`
                    }
                }
            } else {
                sqlFields = `*`
            }

            let sql: string = `
                SELECT ${sqlFields}
                FROM "${this.TABLE_NAME}"
                WHERE ${whereArr.join(" AND ")}
            `
            if (!isCount) {
                sql += `
                    ORDER BY ${sortArr.join("', '")}
                    LIMIT ${limit} OFFSET ${offset}
                `
            }

            // executing sql query 
            const { rows } = await query(sql)

            return rows
        } catch (error: any) {
            throw error
        } finally {
            release()
        }
    }

    // create 
    create = async (inputData: any) => {
        const providersFactory = new ProvidersFactory()
        const { query, release } = await providersFactory.transaction(process.env.DB_NAME as string)
        try {
            query("BEGIN")

            // create statement
            const sql: string = `
                INSERT INTO "${this.TABLE_NAME}"("${Object.keys(inputData).join('", "')}") 
                VALUES ('${Object.values(inputData).map((el) => el).join("', '")}')
                RETURNING *
            `
            // executing query
            const { rows } = await query(sql)
            query("COMMIT")

            // return rows
            return rows
        } catch (error: any) {
            query("ROLLBACK")
            throw error
        } finally {
            release()
        }
    }

    //  update
    update = async (id: number, inputData: any) => {
        const providersFactory = new ProvidersFactory()
        const { query, release } = await providersFactory.transaction(process.env.DB_NAME as string)
        try {
            query("BEGIN")
            // sql
            let updateArr: string[] = []
            Object.keys(inputData).forEach((column) => {
                let value = ["number", "boolean"].indexOf(typeof inputData[column]) >= 0 ? inputData[column] : `'${inputData[column]}'`
                updateArr.push(`"${column}" = ${value}`)
            })

            const sql: string = `
                UPDATE "${this.TABLE_NAME}"
                SET ${updateArr.join(", ")}
                WHERE "${this.ID_COLUMN_NAME}" = ${id}
            `
            const result = await query(sql)

            // results
            query("COMMIT")
            return result

        } catch (error: any) {
            query("ROLLBACK")
            throw error
        } finally {
            release()
        }
    }

    deleteItems = async (ids: number[]) => {
        const providersFactory = new ProvidersFactory()
        const { query, release } = await providersFactory.transaction(process.env.DB_NAME as string)
        try {
            query("BEGIN")
            // const values: any = [...ids]
            const sql: string = `
                UPDATE "${this.TABLE_NAME}"
                SET "deletedAt" = CURRENT_TIMESTAMP
                WHERE "${this.ID_COLUMN_NAME}" IN(${ids.join(", ")})
            `
            // executing query
            const result = await query(sql)

            query("COMMIT")
            // result
            return result
        } catch (error: any) {
            query("ROLLBACK")
            throw error
        } finally {
            release()
        }
    }

    bulkCreate = async (inputData: any) => {
        const providersFactory = new ProvidersFactory()
        const { query, release } = await providersFactory.transaction(process.env.DB_NAME as string)
        try {

            let sql = `INSERT INTO "${this.TABLE_NAME}" ("${Object.keys(inputData[0]).join('", "')}") VALUES `
            let commonDataArr: any[] = []

            // looping through values
            for (let i = 0; i < inputData.length; i++) {
                commonDataArr.push(`('${Object.values(inputData[i]).map((el) => el).join("', '")}')`)
            }
            sql += commonDataArr.join(", ")
            sql += `RETURNING *`

            // executing query
            const { rows } = await query(sql)
            query("COMMIT")

            // return rows
            return rows

        } catch (error: any) {
            query("ROLLBACK")
            throw error
        } finally {
            release()
        }
    }

}