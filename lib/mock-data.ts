import { Tool } from "./types";

export const MOCK_TOOLS: Tool[] = [
  {
    id: "1",
    name: "get_booking_status",
    description: "Retrieve the current status and details of a customer booking by its ID.",
    execution_mode: "webhook",
    parameters: [
      { name: "booking_id", type: "string", description: "The unique booking identifier", required: true },
      { name: "include_history", type: "boolean", description: "Whether to include status history", required: false },
    ],
    webhook_url: "https://api.example.com/bookings/status",
    timeout_ms: 5000,
  },
  {
    id: "2",
    name: "get_current_time",
    description: "Returns the current server time in ISO 8601 format. Useful for time-sensitive operations.",
    execution_mode: "static",
    parameters: [],
    static_response: JSON.stringify({ time: "2026-04-03T10:00:00Z", timezone: "UTC" }, null, 2),
    timeout_ms: 1000,
  },
  {
    id: "3",
    name: "lookup_product",
    description: "Search for a product by name or SKU and return its availability, pricing, and description.",
    execution_mode: "webhook",
    parameters: [
      { name: "query", type: "string", description: "Product name or SKU to search for", required: true },
      { name: "limit", type: "number", description: "Maximum number of results to return", required: false },
    ],
    webhook_url: "https://api.example.com/products/search",
    webhook_secret: "whsec_••••••••••••",
    timeout_ms: 8000,
  },
]