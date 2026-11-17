import { createFileRoute } from "@tanstack/react-router";
import {
  RestaurantServicePage,
  restaurantServiceHead,
} from "@/components/site/RestaurantServicePage";
import { RESTAURANT_SERVICES } from "@/lib/restaurant-services";

const service = RESTAURANT_SERVICES["restaurant-online-ordering"]!;

export const Route = createFileRoute("/restaurant-online-ordering")({
  head: () => restaurantServiceHead(service),
  component: () => <RestaurantServicePage service={service} />,
});
