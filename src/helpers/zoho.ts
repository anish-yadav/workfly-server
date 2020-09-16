import { TeamResponse, Volunteer } from "../types/zoho"
const INITAL_VALUES: Volunteer = {
    name: '',
    contact: '',
    bcCity: '',
    email:'',
    zohoID:'',
    status:'',
    password: ''
}
export const formatVolunteerData = (data: TeamResponse): Volunteer => {
    let volunteer = INITAL_VALUES;
    volunteer.name = data.data[0].Name.display_value;
    volunteer.bcCity = data.data[0].BloodConnect_City;
    volunteer.contact = data.data[0].Contact;
    volunteer.email = data.data[0].Email;
    volunteer.zohoID = data.data[0].ID;
    volunteer.status = data.data[0].Status;
    volunteer.password = data.data[0].Contact;

    return volunteer;
}