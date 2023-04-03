const WebSocket = require("ws");
const express = require("express");
const app = express();

const port = 4001;

// app.use(express.static("./client/build"));

const games = {};

// function start() {
//   const wss = new WebSocket.Server({ path: '/sea-battle', port: 4000 }, () => {
//     console.log("WebSocket server started on port 4000");
//   });
//   wss.on("connection", (wsClient) => {
//     wsClient.on("message", async (message) => {
//       const req = JSON.parse(message.toString());
//       if (req.event === "connect") {
//         wsClient.nickname = req.payload.username;
//         initGames(wsClient, req.payload.gameId);
//       }
//       broadcast(req);
//     });
//   });
// }

function start() {
  const wss = new WebSocket.Server({ port: 4000 }, () => {
    console.log("WebSocket server started on port 4000");
  });
  wss.on("connection", (wsClient) => {
    wsClient.on("message", async (message) => {
      const req = JSON.parse(message.toString());

      if (req.event === "connect") {
        wsClient.nickname = req.payload.username;
        initGames(wsClient, req.payload.gameId);
      }
      switch (req.gameName) {
        case "sea-battle": {
          return broadcastSeaBattle(req);
        }
        case "tic-tac": {
          return broadcastTicTac(req);
        }
        default: {
        }
      }
    });
  });
}

function initGames(ws, gameId) {
  const gameKey = gameId;
  if (!games[gameKey]) {
    games[gameKey] = [ws];
  } else if (games[gameKey] && games[gameKey]?.length < 2) {
    games[gameKey] = [...games[gameKey], ws];
  } else if (games[gameKey] && games[gameKey].length === 2) {
    games[gameKey] = games[gameKey].filter(
      (wsc) => wsc.nickname !== ws.nickname
    );
    games[gameKey] = [...games[gameKey], ws];
  }
}

function broadcastSeaBattle(params) {
  const { username, gameId } = params.payload;
  let res;
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
        res = {
          type: "move",
          payload: params.payload,
        };

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

function broadcastTicTac(params) {
  const { username, gameId } = params.payload;
  let res;
  games[gameId].forEach((client) => {
    switch (params.event) {
      case "connect":
        res = {
          type: "connectToPlay",
          payload: {
            enemyName: games[gameId].find(
              (user) => user.nickname !== client.nickname
            )?.nickname,
            username: client.nickname,
            currentSign:
              games[gameId][0].nickname === client.nickname ? "X" : "O",
            gameIsReady: games[gameId].length === 2,
          },
        };
        break;
      case "move":
        res = {
          type: "move",
          payload: params.payload,
        };

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

app.listen(port, () => {
  console.log(`Listening on port ${port}…`);
  start();
});
