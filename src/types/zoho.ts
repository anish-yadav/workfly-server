interface TeamData {
  Status: string;
  BloodConnect_City: string;
  Email: string;
  Name: { display_value: string };
  ID: string;
  Contact: string;
}
export type TeamResponse = {
  code: number;
  data: TeamData[];
};

export type Volunteer = {
  status: string;
  bcCity: string;
  email: string;
  name: string;
  zohoID: string;
  contact: string;
  password: string
};
