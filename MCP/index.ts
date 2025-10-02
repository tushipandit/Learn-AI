import { placeOrder, getProfile, getAuthorize, generateSession } from "./trade";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create MCP server
const server = new McpServer({
  name: "kite-trading-server",
  version: "1.0.0",
});

// Simple math tool
server.registerTool("add",
  {
    title: "Addition Tool",
    description: "Add two numbers",
    inputSchema: { a: z.number(), b: z.number() },
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: `Result: ${a + b}` }],
  })
);

// ---------------------------
// 🔐 Get Kite Auth URL
// ---------------------------
server.registerTool("GetAuthorize",
  {
    title: "Get Kite Authorization URL",
    description: "Returns the URL to log in to Kite and get your request token",
  },
  async () => {
    try {
      const loginUrl = await getAuthorize();  // Ensure this function returns URL
      return {
        content: [
          {
            type: "text",
            text: `✅ Visit the following URL to authorize:\n${loginUrl}`
          }
        ]
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error generating login URL: ${(err as Error).message}`
          }
        ]
      };
    }
  }
);

// ---------------------------
// 🎟️ Generate Session
// ---------------------------
server.registerTool("GetSession",
  {
    title: "Generate Kite Session",
    description: "Exchanges request token for access token",
    inputSchema: {
      requestoken: z.string().min(10, "Request token is required"),
    }
  },
  async ({ requestoken }) => {
    try {
      const response = await generateSession(requestoken);  // Ensure this returns something
      return {
        content: [
          {
            type: "text",
            text: `✅ Session generated. Access Token: ${response}`
          }
        ]
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error generating session: ${(err as Error).message}`
          }
        ]
      };
    }
  }
);

// ---------------------------
// 👤 Get Profile
// ---------------------------
server.registerTool("GetProfile",
  {
    title: "Get Kite Profile",
    description: "Fetches the profile of the logged-in Kite user",
  },
  async () => {
    try {
      const profile = await getProfile();
      return {
        content: [
          {
            type: "text",
            text: `✅ Profile retrieved for ${profile.user_name} (${profile.user_id})\n\n${JSON.stringify(profile, null, 2)}`
          }
        ]
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error fetching profile: ${(err as Error).message}`
          }
        ]
      };
    }
  }
);

// ---------------------------
// 🟢 Buy Stock
// ---------------------------
server.registerTool("BuyStock",
  {
    title: "Buy Stock",
    description: "Places a market buy order on NSE",
    inputSchema: {
      stock: z.string().min(1, "Stock symbol required"),
      qty: z.number().int().positive("Quantity must be a positive integer"),
    },
  },
  async ({ stock, qty }) => {
    try {
      const order = await placeOrder(stock, qty, "BUY");
      return {
        content: [
          {
            type: "text",
            text: `✅ Buy order placed for ${qty} share(s) of ${stock}\nOrder ID: ${order}`
          }
        ]
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to place buy order: ${(err as Error).message}`
          }
        ]
      };
    }
  }
);

// ---------------------------
// 🔴 Sell Stock
// ---------------------------
server.registerTool("SellStock",
  {
    title: "Sell Stock",
    description: "Places a market sell order on NSE",
    inputSchema: {
      stock: z.string().min(1, "Stock symbol required"),
      qty: z.number().int().positive("Quantity must be a positive integer"),
    },
  },
  async ({ stock, qty }) => {
    try {
      const order = await placeOrder(stock, qty, "SELL");
      return {
        content: [
          {
            type: "text",
            text: `✅ Sell order placed for ${qty} share(s) of ${stock}\nOrder ID: ${order}`
          }
        ]
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to place sell order: ${(err as Error).message}`
          }
        ]
      };
    }
  }
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);