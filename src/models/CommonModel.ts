import moment from "moment";

import { ProvidersFactory } from "../libs/ProvidersFactory";
import { Range, Sort, Roles } from "../types/common";

export default class CommonModel {
  private TABLE_NAME: string;
  private ID_COLUMN_NAME: string;
  private SEARCH_COLUMN_NAME: string[];

  constructor(
    tableName: string,
    idColumnName: string,
    searchColumnName: string[],
  ) {
    this.TABLE_NAME = tableName;
    this.ID_COLUMN_NAME = idColumnName;
    this.SEARCH_COLUMN_NAME = searchColumnName;
  }

  bulkCreate = async (inputData: any, createdBy?: number) => {
    // try {
    const providersFactory = new ProvidersFactory();
    const { query, release } = await providersFactory.transaction();
    try {
      // for admin users
      if (!createdBy) {
        const superAdmin = await query(`
						SELECT *
						FROM "roles"
						WHERE "deletedAt" IS NULL
							AND "roleId" = ${Roles.SuperAdmin}
					`);
        if (superAdmin.rows.length > 0) {
          createdBy = superAdmin.rows[0].userId;
        }
      }

      if (createdBy) {
        // @ts-ignore
        inputData = inputData.map((el) => ({
          ...el,
          createdBy,
          updatedBy: createdBy,
        }));
      }

      // handle insert data
      for (let i = 0; i < inputData.length; i++) {
        if (Object.keys(inputData[i]).length) {
          Object.keys(inputData[i]).forEach((el) => {
            // @ts-ignore
            if (
              (["boolean", "number"].indexOf(typeof inputData[i][el]) < 0 &&
                !inputData[i][el]) ||
              (typeof inputData[i][el] === "string" &&
                inputData[i][el].trim() === "")
            ) {
              // @ts-ignore
              delete inputData[i][el];
            } else if (typeof inputData[i][el] === "string") {
              inputData[i][el] = inputData[i][el].trim();
            }
          });
        }
      }

      query("BEGIN");

      let sql = `INSERT INTO "${this.TABLE_NAME}" ("${Object.keys(
        inputData[0],
      ).join('", "')}") VALUES `;
      let commonDataArr: any[] = [];

      // looping through values
      for (let i = 0; i < inputData.length; i++) {
        commonDataArr.push(
          `('${Object.values(inputData[i])
            .map((el) => el)
            .join("', '")}')`,
        );
      }
      sql += commonDataArr.join(", ");
      sql += `RETURNING *`;

      console.log(`sql ------->`, sql);
      // executing query
      const { rows } = await query(sql);
      query("COMMIT");

      release();
      // return rows
      return rows;
    } catch (error) {
      query("ROLLBACK");

      release();
      throw error;
    }
  };

  list = async (
    filter: any,
    range?: Range,
    sort?: Sort,
    fields?: string[],
    isCount?: boolean,
    filterNotToBeIncluded?: any,
    customFilters?: string[],
    isIncludeDeletedEntries?: boolean,
    groupBy?: string[],
    isNoSort?: boolean,
    isNoRange?: boolean,
  ): Promise<any> => {
    // try {
    const providersFactory = new ProvidersFactory();
    const { query, release } = await providersFactory.transaction();

    try {
      /* start managing fields to be returned */
      let sqlFields: string = `*`;
      if (fields?.length) {
        sqlFields = "";
        if (!isCount) {
          for (let i = 0; i < fields.length; i++) {
            if (fields[i].indexOf(" ") >= 0) {
              sqlFields += fields[i];
            } else {
              sqlFields += `"${fields[i]}"`;
            }
            if (i < fields.length - 1) {
              sqlFields += ", ";
            }
          }
        } else {
          sqlFields = `${fields[0]}`;
        }
      }
      /* end managing fields to be returned */

      /* start managing filters */
      let whereArr: string[] = isIncludeDeletedEntries
        ? []
        : [`"deletedAt" IS NULL`];

      if (filter && Object.keys(filter).length) {
        Object.keys(filter).map((column) => {
          if (
            filter[column] === undefined ||
            filter[column] === null ||
            String(filter[column]).trim() === "" ||
            (column === "userId" && filter[column] === 1)
          ) {
            return;
          }
          if (column === "createdAt") {
            if (moment(filter[column]).isValid()) {
              whereArr.push(
                `"${column}"::date = '${moment(filter[column]).format(
                  "YYYY-MM-DD",
                )}'`,
              );
            }
          } else if (column === "search") {
            let whereSearch: string[] = this.SEARCH_COLUMN_NAME.map((el) => {
              return `"${el}" ILIKE '%${filter[column]}%'`;
            });
            whereArr.push(`(${whereSearch.join(" OR ")})`);
          } else {
            switch (typeof filter[column] as string) {
              case "number":
                whereArr.push(`"${column}" = ${filter[column]}`);
                break;
              case "object":
                if (Array.isArray(filter[column])) {
                  whereArr.push(
                    `"${column}" IN (${
                      typeof filter[column][0] === "string"
                        ? `'${filter[column].join("', '")}'`
                        : `${filter[column].join(", ")}`
                    })`,
                  );
                }
                break;
              default:
                whereArr.push(`"${column}" = '${filter[column]}'`);
            }
          }
        });
      }

      if (filterNotToBeIncluded && Object.keys(filterNotToBeIncluded).length) {
        Object.keys(filterNotToBeIncluded).map((column) => {
          if (
            filterNotToBeIncluded[column] === undefined ||
            filterNotToBeIncluded[column] === null ||
            String(filterNotToBeIncluded[column]).trim() === ""
          ) {
            return;
          }

          if (column === "createdAt") {
            whereArr.push(
              `"${column}"::date != '${filterNotToBeIncluded[column]}'`,
            );
          } else {
            switch (typeof filterNotToBeIncluded[column] as string) {
              case "number":
                whereArr.push(
                  `"${column}" != ${filterNotToBeIncluded[column]}`,
                );
                break;
              case "object":
                if (Array.isArray(filterNotToBeIncluded[column])) {
                  whereArr.push(
                    `"${column}" NOT IN (${
                      typeof filterNotToBeIncluded[column][0] === "string"
                        ? `'${filterNotToBeIncluded[column].join("', '")}'`
                        : `${filterNotToBeIncluded[column].join(", ")}`
                    })`,
                  );
                }
                break;
              default:
                whereArr.push(
                  `"${column}" != '${filterNotToBeIncluded[column]}'`,
                );
            }
          }
        });
      }

      if (customFilters?.length) {
        whereArr = whereArr.concat(customFilters);
      }
      /* end managing filters */

      /* start managing grouping */
      const sqlGroup: string = groupBy?.length
        ? `GROUP BY "${groupBy.join('", "')}"`
        : "";
      /* end managing grouping */

      /* start managing sorting */
      let sortArr: string[] = [];
      if (!isNoSort && sort && Object.keys(sort).length > 0) {
        sortArr.push(
          `"${sort["orderBy"]}" ${
            sort["orderDir"]?.toString()?.toUpperCase() ?? "ASC"
          }`,
        );
      }

      sortArr.push(`"createdAt" DESC`);
      /* end managing sorting */

      /* start managing pagination */
      let limit: number = 100;
      let offset: number = 0;
      if (!isNoRange && range) {
        range.page = range.page ? range.page : 1;
        limit = range.pageSize ?? limit;
        offset = (range.page - 1) * limit;
      }
      /* end managing pagination */

      /* start preparing query */
      let sql: string = `
					SELECT ${sqlFields}
					FROM "${this.TABLE_NAME}"
					WHERE ${whereArr.join(" AND ")}
					${sqlGroup}
				`;
      if (!isCount) {
        if (!isNoSort) {
          sql += ` ORDER BY ${sortArr.join(", ")}`;
        }
        if (!isNoRange) {
          sql += ` LIMIT ${limit} OFFSET ${offset}`;
        }
      }
      /* end preparing query */

      const { rows } = await query(sql);

      release();
      return rows;
    } catch (error) {
      release();
      throw error;
    }
  };

  update = async (data: any, id: number, updatedBy?: number): Promise<any> => {
    // try {
    const providersFactory = new ProvidersFactory();
    const { query, release } = await providersFactory.transaction();

    try {
      // for admin users
      if (!updatedBy) {
        const superAdmin = await query(`
					SELECT *
					FROM "roles"
					WHERE "roleId" = ${Roles.SuperAdmin}
						AND "deletedAt" IS NULL
				`);

        if (superAdmin.rows.length > 0) {
          updatedBy = superAdmin.rows[0].userId;
        }
      }

      let updateArr: string[] = [];
      Object.keys(data).forEach((column) => {
        // looping through values
        if (data[column] === undefined) {
          delete data[column];
        } else {
          if (typeof data[column] === "string" && data[column].trim() === "") {
            data[column] = null;
          }

          let value =
            ["number", "boolean"].indexOf(typeof data[column]) >= 0 ||
            !data[column]
              ? data[column]
              : `'${data[column]}'`;
          updateArr.push(`"${column}" = ${value}`);
        }
      });

      query("BEGIN");

      let sql: string = `
					UPDATE "${this.TABLE_NAME}"
					SET ${updateArr.join(", ")} ${updateArr?.length > 0 ? "," : ""}
					"updatedAt"='NOW()'${updatedBy ? `, "updatedBy" = '${updatedBy}'` : ""}
					WHERE "deletedAt" IS NULL
					AND "${this.ID_COLUMN_NAME}" = '${id}'
					`;
      sql += `RETURNING *`;

      const { rows } = await query(sql);
      query("COMMIT");
      release();

      return rows;
    } catch (error) {
      query("ROLLBACK");

      release();
      throw error;
    }
  };

  softDelete = async (
    id: number[],
    deletedBy?: number,
    fieldName?: string,
  ): Promise<any> => {
    // try {
    const providersFactory = new ProvidersFactory();
    const { query, release } = await providersFactory.transaction();
    try {
      // for admin users
      if (!deletedBy) {
        const superAdmin = await query(`
						SELECT *
						FROM "roles"
						WHERE "roleId" = ${Roles.SuperAdmin}
							AND "deletedAt" IS NULL
					`);

        if (superAdmin.rows.length > 0) {
          deletedBy = superAdmin.rows[0].userId;
        }
      }

      query("BEGIN");

      const sql: string = `
					UPDATE "${this.TABLE_NAME}"
					SET "deletedAt" = 'NOW()'${deletedBy ? `, "deletedBy" = '${deletedBy}'` : ""}
					WHERE "${fieldName ?? this.ID_COLUMN_NAME}" IN (${id.join(", ")})
				`;

      const { rows } = await query(sql);
      query("COMMIT");
      release();
      return rows;
    } catch (error) {
      query("ROLLBACK");
      release();
      throw error;
    }
  };

  softDeleteByFilter = async (
    filters: any,
    deletedBy?: number,
  ): Promise<any> => {
    // try{
    const providersFactory = new ProvidersFactory();
    const { query, release } = await providersFactory.transaction();
    try {
      // for admin users
      if (!deletedBy) {
        const superAdmin = await query(`
						SELECT *
						FROM "roles"
						WHERE "roleId" = ${Roles.SuperAdmin}
							AND "deletedAt" IS NULL
					`);

        if (superAdmin.rows.length > 0) {
          deletedBy = superAdmin.rows[0].userId;
        }
      }
      let whereArr: any[] = [];
      Object.keys(filters).forEach((column) => {
        // looping through values
        switch (typeof filters[column] as string) {
          case "number":
            whereArr.push(`"${column}" = ${filters[column]}`);
            break;
          case "object":
            if (Array.isArray(filters[column])) {
              whereArr.push(
                `"${column}" IN (${
                  typeof filters[column][0] === "string"
                    ? `'${filters[column].join("', '")}'`
                    : `${filters[column].join(", ")}`
                })`,
              );
            }
            break;
          default:
            whereArr.push(`"${column}" = '${filters[column]}'`);
        }
      });

      query("BEGIN");

      let sql: string = `
				UPDATE "${this.TABLE_NAME}"
				SET "deletedAt" = 'NOW()'${deletedBy ? `, "deletedBy" = '${deletedBy}'` : ""}
				WHERE "deletedAt" IS NULL
				AND ${whereArr.join(" AND ")}
				`;

      const { rows } = await query(sql);
      query("COMMIT");
      release();
      return rows;
    } catch (error) {
      query("ROLLBACK");
      release();
      throw error;
    }
  };

  customUpdate = async (
    data: any,
    customField: string,
    customValue: any,
    updatedBy?: number,
  ): Promise<any> => {
    // try {
    const providersFactory = new ProvidersFactory();
    const { query, release } = await providersFactory.transaction();

    try {
      // for admin users
      if (!updatedBy) {
        const superAdmin = await query(`
					SELECT *
					FROM "roles"
					WHERE "roleId" = ${Roles.SuperAdmin}
						AND "deletedAt" IS NULL
				`);

        if (superAdmin.rows.length > 0) {
          updatedBy = superAdmin.rows[0].userId;
        }
      }

      let updateArr: string[] = [];
      Object.keys(data).forEach((column) => {
        // looping through values
        if (data[column] === undefined) {
          delete data[column];
        } else {
          if (typeof data[column] === "string" && data[column].trim() === "") {
            data[column] = null;
          }

          let value =
            ["number", "boolean"].indexOf(typeof data[column]) >= 0 ||
            !data[column]
              ? data[column]
              : `'${data[column]}'`;
          updateArr.push(`"${column}" = ${value}`);
        }
      });

      let updateOperator: string = "";

      switch (typeof customValue) {
        case "object":
          updateOperator = "IN";
          customValue = `('${customValue.join("', '")}')`;
          break;
        case "string":
          updateOperator = "LIKE";
          customValue = `'%${customValue}%'`;
          break;
        default:
          updateOperator = "=";
      }

      query("BEGIN");

      let sql: string = `
					UPDATE "${this.TABLE_NAME}"
					SET ${updateArr.join(", ")} ${updateArr?.length > 0 ? "," : ""}
					"updatedAt"='NOW()'${updatedBy ? `, "updatedBy" = '${updatedBy}'` : ""}
					WHERE "deletedAt" IS NULL
					AND "${customField}" ${updateOperator} ${customValue}
					`;
      sql += `RETURNING *`;

      const { rows } = await query(sql);
      query("COMMIT");
      release();

      return rows;
    } catch (error) {
      query("ROLLBACK");

      release();
      throw error;
    }
  };
}
