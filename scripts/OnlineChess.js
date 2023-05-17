// online gameplay
CHESSAPP.onlinePlay = {
  sk: null, // Socket object for managing the connection
  connect: function (stg, callback) {
    let op = CHESSAPP.onlinePlay;
    let hostPort = "https://chess-2par.onrender.com/"; // Default host and port for the socket connection
    if (CHESSAPP.globalSettings.live) {
      // If live mode is enabled, use the custom host and port specified in global settings
      hostPort = CHESSAPP.globalSettings.host;
    }

    // Connecting to the socket server
    this.sk = io.connect(hostPort, { transports: ["websocket"] });
    CHESSAPP.ui.statusUpdate({ type: "fb", msg: "Searching for player 1..." });
    this.sk.emit("setup", { color: stg.preferredColor });

    // Event handler for receiving chat messages
    this.sk.on("chat", function (data) {
      CHESSAPP.GamePlay.chatMessage(data);
    });

    // Event handler for partner disconnecting from the game
    this.sk.on("partnerDisconnect", function () {
      CHESSAPP.GamePlay.statusUpdate({ type: "e", msg: "Your partner has left the game" });
    });

    // Event handler for server disconnecting
    this.sk.on("disconnect", function () {
      CHESSAPP.GamePlay.statusUpdate({
        type: "e",
        msg: "Internal Server Error. We will be back soon. Sorry for the inconvenience.",
      });
    });

    // Event handler for finding a match (another player joining the game)
    this.sk.on("matchfound", function (data) {
      CHESSAPP.GamePlay.statusUpdate({
        type: "fb",
        msg: "Player 2 has joined the game. You can start the game",
      });
      CHESSAPP.GamePlay.statusUpdate({
        type: "fb",
        msg: "Playing as " + (data.color == "W" ? "white" : "black"),
      });
      CHESSAPP.GamePlay.setOnlineColor(data.color);
      callback();
    });

    // Event handler for receiving opposing move
    this.sk.on("opposing_move", function (data) {
      CHESSAPP.GamePlay.onlineMove(data);
      CHESSAPP.GamePlay.statusUpdate({ type: "s", msg: "It's your move!" });
    });
  },
  sendMove: function (stg) {
    // Sending the move to the server
    this.sk.emit("movemade", stg);
    CHESSAPP.GamePlay.statusUpdate({
      type: "s",
      msg: "Move made, waiting for the partner to make the next move",
    });
  },
  sendChat: function (stg) {
    // Sending a chat message to the server
    stg.local = false;
    this.sk.emit("chat", stg);
  },
  handleMsg: function (e) {
    // Handling incoming messages from the server
    let resp = JSON.parse(e.data);
  },
};
