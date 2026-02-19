import { createClient } from "@libsql/client";
import config from "../config.js";

const db = createClient({
  url: config.TURSO_URL,
  authToken: config.TURSO_AUTH_TOKEN,
});

export default db;
