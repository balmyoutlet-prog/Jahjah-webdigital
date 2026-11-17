import { createFileRoute } from "@tanstack/react-router";
import { RestaurantMarketPage, restaurantMarketHead } from "@/components/site/RestaurantMarketPage";
import { RESTAURANT_MARKETS } from "@/lib/restaurant-markets";

const market = RESTAURANT_MARKETS["kuwait"]!;

export const Route = createFileRoute("/restaurants/kuwait")({
  head: () => restaurantMarketHead(market),
  component: () => <RestaurantMarketPage market={market} />,
});
