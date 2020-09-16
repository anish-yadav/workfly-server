"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatVolunteerData = void 0;
const INITAL_VALUES = {
    name: '',
    contact: '',
    bcCity: '',
    email: '',
    zohoID: '',
    status: '',
    password: ''
};
exports.formatVolunteerData = (data) => {
    let volunteer = INITAL_VALUES;
    volunteer.name = data.data[0].Name.display_value;
    volunteer.bcCity = data.data[0].BloodConnect_City;
    volunteer.contact = data.data[0].Contact;
    volunteer.email = data.data[0].Email;
    volunteer.zohoID = data.data[0].ID;
    volunteer.status = data.data[0].Status;
    volunteer.password = data.data[0].Contact;
    return volunteer;
};
//# sourceMappingURL=zoho.js.map