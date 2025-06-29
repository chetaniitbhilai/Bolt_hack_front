import { CreateBhandaraRequest, Bhandara } from '@/types/bhandara';

const BASE_URL = 'https://bolt-hack-back.onrender.com/api';

export const api = {
  async getNearbyBhandaras(latitude: number, longitude: number): Promise<Bhandara[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/bhandara?lat=${latitude}&lon=${longitude}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby bhandaras');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching nearby bhandaras:', error);
      throw error;
    }
  },

  async createBhandara(bhandara: CreateBhandaraRequest): Promise<Bhandara> {
    try {
      const response = await fetch(`${BASE_URL}/bhandara`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bhandara),
      });

      const responseBody = await response.text(); // 👈 convert to text first to inspect

      if (!response.ok) {
        console.error('Server responded with:', response.status, responseBody);
        throw new Error('Failed to create bhandara');
      }

      return JSON.parse(responseBody); // 👈 parse JSON only if OK
    } catch (error) {
      console.error('Error creating bhandara:', error);
      throw error;
    }
  }
};