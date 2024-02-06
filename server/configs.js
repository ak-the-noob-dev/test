import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
console.log(process.env);
export const __env = process.env;
