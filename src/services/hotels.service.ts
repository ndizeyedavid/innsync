import { hotelEndpoints } from "../api/endpoints";
import { Hotel } from "../api/types";

class HotelsService {
  // Get list of hotels with optional search/city filter
  async getHotels(search?: string, city?: string): Promise<Hotel[]> {
    try {
      return await hotelEndpoints.list(search, city);
    } catch (error) {
      console.error("Error getting hotels:", error);
      throw error;
    }
  }

  // Get hotel by ID
  async getHotelById(hotelId: string): Promise<Hotel> {
    try {
      return await hotelEndpoints.getOne(hotelId);
    } catch (error) {
      console.error("Error getting hotel:", error);
      throw error;
    }
  }

  // Mock data for testing
  getMockHotels(): Hotel[] {
    return [
      {
        id: "1",
        name: "The Grand Oasis Resort",
        address: "123 Paradise Blvd, Miami Beach, FL",
        description: "Luxury beachfront resort with world-class amenities",
        imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        rating: 4.8,
        city: "Miami Beach",
        amenities: ["Pool", "Spa", "Gym", "Restaurant"],
        availableRooms: 15,
      },
      {
        id: "2",
        name: "Mountain View Lodge",
        address: "456 Alpine Rd, Aspen, CO",
        description: "Cozy mountain lodge with stunning views",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        rating: 4.6,
        city: "Aspen",
        amenities: ["Ski-in/Ski-out", "Hot Tub", "Fireplace", "Bar"],
        availableRooms: 8,
      },
      {
        id: "3",
        name: "Urban Downtown Hotel",
        address: "789 City Center, New York, NY",
        description: "Modern hotel in the heart of Manhattan",
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
        rating: 4.5,
        city: "New York",
        amenities: ["Rooftop Bar", "Concierge", "Business Center", "Gym"],
        availableRooms: 22,
      },
    ];
  }
}

export default new HotelsService();
