export interface Bhandara {
  _id: string;
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer: string;
  foodItems: string[];
  latitude: number;
  longitude: number;
  attendees: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBhandaraRequest {
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer: string;
  foodItems: string[];
  latitude: number;
  longitude: number;
}