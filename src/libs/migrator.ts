import Postgrator from "postgrator";
import pg from "pg";
import * as path from "path";

import eventEmitter from "./logging";

export default {
  migrator,
};
export async function migrator() {
  // create client
  const client = new pg.Client({
    host: process.env.DB_HOST as string,
    port: parseInt(process.env.DB_PORT as string),
    database: process.env.DB_NAME as string,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
  });

  try {
    await client.connect();
  } catch (err) {
    console.error("Database connection failed", err);
    process.exit();
  }

  // Create postgrator instance
  const postgrator = new Postgrator({
    migrationPattern: path.resolve(__dirname, "../../migrations/*"),
    driver: "pg",
    database: process.env.DB_NAME as string,
    schemaTable: "schemaversion",
    execQuery: (query) => client.query(query),
  });

  // logging when debug
  postgrator.on("validation-started", (migration) =>
    eventEmitter.emit("logging", migration),
  );
  postgrator.on("validation-finished", (migration) =>
    eventEmitter.emit("logging", migration),
  );
  postgrator.on("migration-started", (migration) =>
    eventEmitter.emit("logging", migration),
  );
  postgrator.on("migration-finished", (migration) =>
    eventEmitter.emit("logging", migration),
  );

  try {
    eventEmitter.emit("logging", `Migration function started.`);
    await postgrator.migrate();
    eventEmitter.emit("logging", `Migration function Ended.`);
  } catch (err: any) {
    eventEmitter.emit("logging", `Migration function failed ${err.message}`);
    process.exit();
  }

  await client.end();
}
