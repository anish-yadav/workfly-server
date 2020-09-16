import Axios from "axios";
import { MoreThan } from "typeorm";
import "../config/config";
import { Token } from "../entities/Token";
import { formatVolunteerData } from "../helpers/zoho";
import { TeamResponse, Volunteer } from '../types/zoho';

interface Refresh_Data {
  access_token: string;
  expires_in: number;
  api_domain: string;
  bearer: string;
}

const generateToken = async () => {
  if (!process.env.REFRESH_URL) return undefined;
  const { data } = await Axios.post<Refresh_Data>(process.env.REFRESH_URL);
  console.log(data);
  return await Token.create({ token: data.access_token }).save();
};

export const getVolunteer = async (email: string): Promise<Volunteer | undefined> => {
  console.log("generating for", email);
  let now = new Date();
  let oneBefore = new Date(now.getTime() - (3600*1000))
  let token = await Token.findOne({
    where: { createdAt: MoreThan(oneBefore)},
  });
  if (token == undefined) {
    console.log("generating token");
    token = await generateToken();
  }

  //console.log('Token is',token);
  //console.log(process.env.BASE_URL)
  try{
    let { data } = await Axios.get<TeamResponse>(
      `${process.env.BASE_URL}/report/BloodConnect_Team_Report?from=0&criteria=(Email="${email}")`,
      { headers: { Authorization: `Zoho-oauthtoken ${token?.token}` } }
    );
    return formatVolunteerData(data)
  } catch (e) {
   return undefined;
  }

  
};
