let app = require("http").createServer(handler),
  io = require("socket.io").listen(app),
  fs = require("fs"),
  url = require("url"),
  port = process.env.PORT || 5800,
  queue = {
    W: [],
    B: [],
    U: [],
  };

app.listen(port);
console.log("Listening to port " + port);
function handler(req, resp) {
  let r_url = url.parse(req.url);
  if (r_url.pathname.substring(1) === "getport") {
    resp.writeHead(200, { "Content-Type": "text/plain" });
    resp.write("" + port);
    resp.end();
  } else if (r_url.pathname === "/") {
    resp.writeHead(200, { "Content-Type": "text/html" });
    let clientui = fs.readFileSync("index.html");
    resp.write(clientui);
    resp.end();
  } else {
    let filename = r_url.pathname.substring(1),
      type;
    switch (filename.substring(filename.lastIndexOf(".") + 1)) {
      case "html":
      case "htm":
        type = "text/html; charset=UTF-8";
        break;
      case "js":
        type = "application/javascript; charset=UTF-8";
        break;
      case "css":
        type = "text/css; charset=UTF-8";
        break;
      case "svg":
        type = "image/svg+xml";
        break;
      case "png":
        type = "image/png";
        break;
      default:
        type = "application/octet-stream";
        break;
    }

    fs.readFile(filename, function (err, content) {
      if (err) {
        resp.writeHead(404, {
          "Content-Type": "text/plain; charset=UTF-8",
        });
        resp.write(err.message);
        resp.end();
      } else {
        resp.writeHead(200, {
          "Content-Type": type,
        });
        resp.write(content);
        resp.end();
      }
    });
  }
}

let GameList = (function () {
  let Node = function (obj, next) {
    this.obj = obj;
    this.next = next;
  };
  let that = {},
    rear = null,
    size = 0,
    unique = 0;

  that.addGame = function (white, black) {
    if (rear == null) {
      rear = new Node(new Game(white, black, unique), null);
      rear.next = rear;
    } else {
      let newNode = new Node(new Game(white, black, unique), rear.next);
      rear.next = newNode;
      rear = newNode;
    }
    size++;
    unique++;
    that.showGames();
  };

  that.removeGame = function (gid) {
    console.log("Remove from game" + gid);
    if (rear == null) {
      console.log("Removing game from null list");
      return;
    }

    let ptr = rear.next,
      prev = rear;
    if (ptr == null) return;

    do {
      if (ptr.obj.gid == gid) {
        console.log("Removing game " + gid);
        if (ptr.next == ptr) {
          rear = null;
        } else {
          prev.next = ptr.next;
          ptr.next = null;
          if (ptr == rear) {
            rear = prev;
          }
        }
        size--;
        that.showGames();
        return;
      }
      prev = ptr;
      ptr = ptr.next;
    } while (ptr != rear.next);
  };
  that.showGames = function () {
    if (rear == null) {
      console.log("The list is empty");
      return;
    }
    let ptr = rear.next;
    let str = "Game List:\n";
    do {
      str += ptr.obj.gid + " ";
      ptr = ptr.next;
    } while (ptr != rear.next);
    console.log(str);
  };
  return that;
})();

let Game = function (w, b, gid) {
  let that = this,
    disconnected = false;

  that.wPlayer = w;
  that.bPlayer = b;
  that.gid = gid;
  that.waitingForPromotion = false;

  console.log("Game started");

  that.wPlayer.removeAllListeners("disconnect");
  that.bPlayer.removeAllListeners("disconnect");

  that.wPlayer.on("disconnect", function () {
    if (that.bPlayer != null) {
      that.bPlayer.emit("partnerDisconnect");
    }
    that.wPlayer = null;
    that.destroy();
  });

  that.bPlayer.on("disconnect", function () {
    if (that.wPlayer != null) {
      that.wPlayer.emit("partnerDisconnect");
    }
    that.bPlayer = null;
    that.destroy();
  });

  that.wPlayer.on("chat", function (data) {
    if (!disconnected) {
      that.bPlayer.emit("chat", data);
    }
  });

  that.bPlayer.on("chat", function (data) {
    if (!disconnected) {
      that.wPlayer.emit("chat", data);
    }
  });

  that.wPlayer.on("movemade", function (data) {
    console.log("White player played");
    if (!disconnected) {
      that.bPlayer.emit("opposing_move", data);
    }
  });
  that.bPlayer.on("movemade", function (data) {
    console.log("Black player played");
    if (!disconnected) {
      that.wPlayer.emit("opposing_move", data);
    }
  });

  that.destroy = function () {
    disconnected = true;
    if (that.wPlayer == null && that.bPlayer == null) {
      GameList.removeGame(that.gid);
    }
  };
  that.init();

  return that;
};
Game.prototype = {
  wPlayer: null,
  bPlayer: null,
  init: function () {
    this.wPlayer.emit("matchfound", {
      color: "W",
    });
    this.bPlayer.emit("matchfound", {
      color: "B",
    });
  },
};

io.sockets.on("connection", function (sk) {
  let w = null,
    b = null,
    skColor = false;
  console.log("Web socket connection established");

  sk.on("setup", function (data) {
    sk.on("disconnect", function () {
      if (!!queue[skColor]) {
        let index = queue[skColor].indexOf(sk);
        console.log("Removing player from queue");
        queue[skColor].splice(index, 1);
      }
    });
    console.log(data);
    skColor = data.color;
    if (!skColor) {
      skColor = "U";
    }

    if (skColor == "W") {
      if (queue["B"].length > 0) {
        b = queue["B"].shift();
        GameList.addGame(sk, b);
      } else if (queue["U"].length > 0) {
        b = queue["U"].shift();
        GameList.addGame(sk, b);
      } else {
        queue["W"].push(sk);
      }
    } else if (skColor == "B") {
      if (queue["W"].length > 0) {
        w = queue["W"].shift();
        GameList.addGame(w, sk);
      } else if (queue["U"].length > 0) {
        w = queue["U"].shift();
        GameList.addGame(w, sk);
      } else {
        queue["B"].push(sk);
      }
    } else {
      if (queue["W"].length > 0) {
        w = queue["W"].shift();
        GameList.addGame(w, sk);
      } else if (queue["B"].length > 0) {
        b = queue["B"].shift();
        GameList.addGame(sk, b);
      } else if (queue["U"].length > 0) {
        w = queue["U"].shift();
        GameList.addGame(w, sk);
      } else {
        queue["U"].push(sk);
      }
    }
  });
});