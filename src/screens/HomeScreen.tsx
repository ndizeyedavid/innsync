import {
  Text,
  TouchableOpacity,
  View,
  useEffect,
  useState,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenLayout from "../layout/ScreenLayout";
import TabHeader from "../components/TabHeader";
import Notification from "../components/Notification";
import DigitalKey from "../components/HomeComponents/DigitalKey";
import QuickActionButton from "../components/HomeComponents/QuickActionButton";
import reservationsService from "../services/reservations.service";
import { Reservation } from "../api/types";

export default function HomeScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentReservation, setCurrentReservation] =
    useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Guest");

  const quickActions = [
    { icon: "restaurant", title: "Order food", description: "12 min Avg" },
    {
      icon: "calendar-clear",
      title: "Itinerary",
      description: currentReservation ? "Day 2 of 4" : "View itinerary",
    },
    {
      icon: "bonfire",
      title: "Book activity",
      description: "Swimming, Hiking, etc..",
    },
    {
      icon: "cash",
      title: "View folio",
      description: "Invoice profoma & receipts",
    },
  ];

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationsService.listMine();
      setReservations(data);

      // Find current active reservation (checked in)
      const active = data.find((r) => r.status === "CHECKED_IN") || data[0];
      setCurrentReservation(active);

      // Set user name from reservation
      if (active?.guestInfo) {
        setUserName(active.guestInfo.firstName);
      }
    } catch (error) {
      console.error("Error loading reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <View className="flex-row justify-between">
        <TabHeader
          alt={
            currentReservation
              ? `Room ${currentReservation.roomNumber}`
              : "HEAVY RAIN AT 20:42"
          }
          title="Good Afternoon,"
          description={userName}
        />
        <TouchableOpacity className="size-[47px] bg-[#E9E6DE] rounded-full items-center justify-center relative">
          <Ionicons name="notifications-outline" color="black" size={24} />
          <View className="size-[8px] bg-[#A8453E] rounded-full absolute top-2 right-3" />
        </TouchableOpacity>
      </View>
      {/* Notification */}
      <View className="mt-3">
        <Notification />
      </View>

      <View className="mt-5">
        <DigitalKey />
      </View>

      <View className="mt-5">
        <Text className="text-[24px]">Quick actions</Text>

        <View className="flex-row flex-wrap gap-3 mt-3">
          {quickActions.map((data, index) => (
            <QuickActionButton
              key={index}
              icon={data.icon}
              title={data.title}
              description={data.description}
            />
          ))}
        </View>
      </View>
    </ScreenLayout>
  );
}
