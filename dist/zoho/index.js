"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVolunteer = void 0;
const axios_1 = __importDefault(require("axios"));
const typeorm_1 = require("typeorm");
require("../config/config");
const Token_1 = require("../entities/Token");
const zoho_1 = require("../helpers/zoho");
const generateToken = async () => {
    if (!process.env.REFRESH_URL)
        return undefined;
    const { data } = await axios_1.default.post(process.env.REFRESH_URL);
    console.log(data);
    return await Token_1.Token.create({ token: data.access_token }).save();
};
exports.getVolunteer = async (email) => {
    console.log("generating for", email);
    let now = new Date();
    let oneBefore = new Date(now.getTime() - (3600 * 1000));
    let token = await Token_1.Token.findOne({
        where: { createdAt: typeorm_1.MoreThan(oneBefore) },
    });
    if (token == undefined) {
        console.log("generating token");
        token = await generateToken();
    }
    try {
        let { data } = await axios_1.default.get(`${process.env.BASE_URL}/report/BloodConnect_Team_Report?from=0&criteria=(Email="${email}")`, { headers: { Authorization: `Zoho-oauthtoken ${token === null || token === void 0 ? void 0 : token.token}` } });
        return zoho_1.formatVolunteerData(data);
    }
    catch (e) {
        return undefined;
    }
};
//# sourceMappingURL=index.js.map