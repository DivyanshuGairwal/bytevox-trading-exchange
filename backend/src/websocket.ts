import { WebSocketServer } from "ws";

let wss: WebSocketServer;

export function initWebSocket(server: any) {
  wss = new WebSocketServer({ server });

  wss.on("connection", () => {
    console.log("WebSocket client connected");
  });
}

export function broadcastUpdate() {
  if (!wss) return;

  wss.clients.forEach((client: any) => {
    if (client.readyState === 1) {
      client.send(
        JSON.stringify({
          type: "BOOK_UPDATED",
        })
      );
    }
  });
}