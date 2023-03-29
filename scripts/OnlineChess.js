CHESSAPP.onlinePlay = {
  sk: null,
  connect: function (stg, callback) {
    let op = CHESSAPP.onlinePlay;
    let hostPort = "http://localhost:" + CHESSAPP.globalSettings.port;
    if (CHESSAPP.globalSettings.live) {
      hostPort = CHESSAPP.globalSettings.host;
    }
    this.sk = io.connect(hostPort);
    CHESSAPP.ui.statusUpdate({ type: "fb", msg: "Searching for player 1..." });
    this.sk.emit("setup", { color: stg.preferredColor });
    this.sk.on("chat", function (data) {
      CHESSAPP.GamePlay.chatMessage(data);
    });
    this.sk.on("partnerDisconnect", function () {
      CHESSAPP.GamePlay.statusUpdate({ type: "e", msg: "Your partner has left the game" });
    });
    this.sk.on("disconnect", function () {
      CHESSAPP.GamePlay.statusUpdate({
        type: "e",
        msg: "Internal Server Error. We will be back soon. Sorry for the inconvenience.",
      });
    });
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
    this.sk.on("opposing_move", function (data) {
      CHESSAPP.GamePlay.onlineMove(data);
      CHESSAPP.GamePlay.statusUpdate({ type: "s", msg: "It's your move!" });
    });
  },
  sendMove: function (stg) {
    this.sk.emit("movemade", stg);
    CHESSAPP.GamePlay.statusUpdate({
      type: "s",
      msg: "Move made, waiting for the partner to make the next move",
    });
    console.log("Sending messsage");
  },
  sendChat: function (stg) {
    stg.local = false;
    this.sk.emit("chat", stg);
  },
  handleMsg: function (e) {
    let resp = JSON.parse(e.data);
    console.log(resp);
  },
};
