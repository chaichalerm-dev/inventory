import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StockPro Inventory Management",
    short_name: "StockPro",
    description: "Inventory, requisition, and stock control workspace",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f8fa",
    theme_color: "#101827",
  };
}
