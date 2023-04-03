const WebSocket = require("ws");
const express = require("express");
const app = express();

const port = 4001;

// app.use(express.static("./client/build"));

const games = {};

function start() {
  const wss = new WebSocket.Server({ port: 4000 }, () => {
    console.log("WebSocket server started on port 4000");
  });
  wss.on("connection", (wsClient) => {
    wsClient.on("message", async (message) => {
      const req = JSON.parse(message.toString());
      if (req.event == "connect") {
        wsClient.nickname = req.payload.username;
        initGames(wsClient, req.payload.gameId);
      }
      broadcast(req);
    });
  });
}

function initGames(ws, gameId) {
  if (!games[gameId]) {
    games[gameId] = [ws];
  } else if (games[gameId] && games[gameId]?.length < 2) {
    games[gameId] = [...games[gameId], ws];
  } else if (games[gameId] && games[gameId].length === 2) {
    games[gameId] = games[gameId].filter((wsc) => wsc.nickname !== ws.nickname);
    games[gameId] = [...games[gameId], ws];
    console.log(games[gameId]);
  }
}

function broadcast(params) {
  const { username, gameId } = params.payload;
  let isXTurn = true;
  games[gameId].forEach((client) => {
    switch (params.event) {
      case "connect":
        res = {
          type: "connectToPlay",
          payload: {
            success: true,
            enemyName: games[gameId].find(
              (user) => user.nickname !== client.nickname
            )?.nickname,
            username: client.nickname,
          },
        };
        break;
      case "ready":
        res = {
          type: "readyToPlay",
          payload: {
            canStart: games[gameId][0].nickname === username,
            username,
          },
        };
        break;
      case "shoot":
        res = {
          type: "afterShootByMe",
          payload: params.payload,
        };
        break;
      case "checkShoot":
        res = {
          type: "isPerfectHit",
          payload: params.payload,
        };
        break;

      case "move":
        
        res = [
          {
            type: "move",
            payload: params.payload,
          },
          {
            type: "turn",
            payload: false,
          },
        ];

        break;

      default:
        res = {
          type: "logout",
          payload: params.payload,
        };
        break;
    }
    client.send(JSON.stringify(res));
  });
}
app.listen(port, () => console.log(`Listening on port ${port}…`), start());
