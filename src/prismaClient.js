"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config"); //
var adapter_pg_1 = require("@prisma/adapter-pg");
var client_js_1 = require("./generated/prisma/client.js");
var connectionString = "".concat(process.env.DATABASE_URL);
var adapter = new adapter_pg_1.PrismaPg({ connectionString: connectionString });
exports.prisma = new client_js_1.PrismaClient({ adapter: adapter });
exports.prisma.$connect()
    .then(function () { return console.log("✅ DB connectée"); })
    .catch(function (err) { return console.error("❌ Erreur DB :", err); });
