CHESSAPP.GamePlay = (function () {
    let that = {},
      pieceGettingPromoted = null;
    that.pieces = [];
    that.cells;
    that.moveList = [];
    let _settings;
    let options = [],
      overrides = {},
      selectedPieceIndex = -1;
    let toFile = function (num) {
      console.log(65 + num);
      return String.fromCharCode(96 + parseInt(num));
    };
    let toAbbr = function (pieceType) {
      switch (pieceType) {
        case "pawn":
          return "";
          break;
        case "queen":
          return "Q";
          break;
        case "king":
          return "K";
          break;
        case "bishop":
          return "B";
          break;
        case "rook":
          return "R";
          break;
        case "knight":
          return "N";
          break;
      }
    };
    that.getTurn = function () {
      return _settings.turn;
    };
    that.addToMoveList = function (move) {
      let tos = "";
      that.moveList.push(move);
      if (move.promotion) {
        console.log("HERE");
        tos += toFile(parseInt(move.fromX) + 1);
        tos += 8 - parseInt(move.toY);
        tos += "=";
        tos += toAbbr(move.pieceType);
      } else {
        tos = toAbbr(move.pieceType);
        if (move.killed) {
          if (tos == "") {
            tos += toFile(parseInt(move.fromX) + 1);
          }
          tos += "x";
        }
        tos += toFile(parseInt(move.toX) + 1);
        tos += 8 - parseInt(move.toY);
      }
      CHESSAPP.ui.addMove(tos);
      console.log("Move notation: " + tos);
    };
    that.statusUpdate = function (stg) {
      CHESSAPP.ui.statusUpdate(stg);
    };
    that.setOnlineColor = function (color) {
      if (color == "W" || color == "B") {
        _settings.onlineColor = color;
      }
    };
    that.sendMove = function (move) {
      if (_settings.online && move) {
        CHESSAPP.onlinePlay.sendMove(move);
      }
    };
    that.switchTurn = function () {
      if (_settings.turn == "W") {
        _settings.turn = "B";
      } else {
        _settings.turn = "W";
      }
    };
    that.pieceClicked = function (piece) {
      let color = piece.color;
      if (color != _settings.turn) {
        return;
      }
      if (_settings.online && _settings.onlineColor != _settings.turn) {
        return;
      }
      that.clearAllOptionStyles();
      selectedPieceIndex = that.pieces.indexOf(piece);
      let pieceOptions = options[selectedPieceIndex];
      for (let i = 0; i < pieceOptions.length; i++) {
        let opt = pieceOptions[i];
        CHESSAPP.ui.addOptionStyles(that.cells[opt.x][opt.y], opt);
      }
    };
    that.cellClicked = function (x, y) {
      let cell = that.cells[x][y];
      if (selectedPieceIndex != -1) {
        let piece = that.pieces[selectedPieceIndex];
        let opt = that.isOption(piece, cell);
        if (opt) {
          let moveOptions = {
            piece: piece,
            x: x,
            y: y,
            local: true,
            special: opt.special,
          };
          that.movePieceTo(moveOptions);
        }
      }
    };
    that.isOption = function (piece, cell) {
      let index = that.pieces.indexOf(piece);
      let pieceOptions = options[index],
        cellX = cell.x,
        cellY = cell.y;
      for (let i = 0; i < pieceOptions.length; i++) {
        if (pieceOptions[i].x == cellX && pieceOptions[i].y == cellY) {
          return pieceOptions[i];
        }
      }
      return false;
    };
    that.inCheck = function (overrides) {
      let inCheck = false;
      for (let i = 0; i < that.pieces.length; i++) {
        that.getOptions(that.pieces[i], null);
      }
      return inCheck;
    };
    that.init = function (userSettings) {
      _settings = {
        containerID: "chessboard",
        online: false,
        preferredColor: false,
        turn: "W",
        onlineColor: false,
        locked: false,
      };
      CHESSAPP.utils.extend(_settings, userSettings);
      let container = document.getElementById(_settings["containerID"]);
      if (container == null) {
        console.log("container element not found with id: " + _settings["containerID"]);
        return false;
      }
      let p = {
        container: container,
        online: _settings.online,
      };
      that.cells = CHESSAPP.ui.init(p);
      that.lock();
      CHESSAPP.ui.onInitialChoice(function (pref) {
        console.log(pref);
        if (pref.hasOwnProperty("color")) {
          _settings.preferredColor = pref.color;
        }
        if (pref.hasOwnProperty("online")) {
          _settings.online = pref.online;
        }
        console.log(_settings);
        if (_settings.online) {
          console.log("connecting...");
          CHESSAPP.onlinePlay.connect(_settings, function () {
            that.setUpBoard.apply(that);
          });
        } else {
          CHESSAPP.ui.statusUpdate({ type: "fb", msg: "Playing locally" });
          that.setUpBoard();
        }
      });
    };
    that.lock = function (stg) {};
    that.setUpBoard = function () {
      if (that.pieces) {
        delete that.pieces;
      }
      that.pieces = [
        {
          x: 0,
          y: 0,
          color: "B",
          pieceType: "rook",
        },
        {
          x: 0,
          y: 7,
          color: "W",
          pieceType: "rook",
        },
        {
          x: 7,
          y: 0,
          color: "B",
          pieceType: "rook",
        },
        {
          x: 7,
          y: 7,
          color: "W",
          pieceType: "rook",
        },
        {
          x: 4,
          y: 7,
          color: "W",
          pieceType: "king",
        },
        {
          x: 4,
          y: 0,
          color: "B",
          pieceType: "king",
        },
        {
          x: 6,
          y: 0,
          color: "B",
          pieceType: "knight",
        },
        {
          x: 1,
          y: 0,
          color: "B",
          pieceType: "knight",
        },
        {
          x: 6,
          y: 7,
          color: "W",
          pieceType: "knight",
        },
        {
          x: 1,
          y: 7,
          color: "W",
          pieceType: "knight",
        },
        {
          x: 5,
          y: 0,
          color: "B",
          pieceType: "bishop",
        },
        {
          x: 2,
          y: 0,
          color: "B",
          pieceType: "bishop",
        },
        {
          x: 5,
          y: 7,
          color: "W",
          pieceType: "bishop",
        },
        {
          x: 2,
          y: 7,
          color: "W",
          pieceType: "bishop",
        },
        {
          x: 3,
          y: 0,
          color: "B",
          pieceType: "queen",
        },
        {
          x: 3,
          y: 7,
          color: "W",
          pieceType: "queen",
        },
      ];
      for (let p = 0; p < 8; p++) {
        that.pieces.push({
          x: p,
          y: 1,
          color: "B",
          pieceType: "pawn",
        });
      }
      for (let p = 0; p < 8; p++) {
        that.pieces.push({
          x: p,
          y: 6,
          color: "W",
          pieceType: "pawn",
        });
      }
      for (let i = 0; i < that.pieces.length; i++) {
        that.pieces[i].numOfMoves = 0;
      }
      CHESSAPP.ui.drawPieces(that.pieces, that.cells);
      that.updateOptions();
    };
    that.clearAllOptionStyles = function () {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          CHESSAPP.ui.clearOptionStyles(that.cells[x][y]);
        }
      }
    };
    that.updateOptions = function () {
      let response = CHESSAPP.Analyzer.makeAllOptions({ pieces: that.pieces }),
        currentColor = _settings.turn,
        stalemate = currentColor,
        check = false,
        checkmate = false;
      options = response.allOptions;
      console.log("Options recieved: ");
      console.log(options);
      for (let i = 0; i < options.length; i++) {
        if (!that.pieces[i]) {
          continue;
        }
        if (that.pieces[i].color == currentColor) {
          if (options[i].length == 0) {
            continue;
          } else {
            stalemate = false;
          }
        }
      }
      if (response.kingInCheck) {
        check = response.kingInCheck;
      }
      if (stalemate && check) {
        checkmate = check;
      }
      let local = currentColor == _settings.onlineColor,
        msg = "",
        type = "fb";
      if (checkmate) {
        if (local) {
          msg = "You are in checkmate. Your opponent wins";
          type = "e";
        } else {
          msg = "Your opponent is in checkmate. You win";
          type = "s";
        }
      } else if (stalemate) {
        msg = "You are in stalemate";
        type = "f";
      } else if (check) {
        if (local) {
          msg = "You are in check";
          type = "e";
        } else {
          msg = "Your opponent is in check";
          type = "s";
        }
      }
      if (check || checkmate || stalemate) {
        that.statusUpdate({ msg: msg, type: type });
      }
      console.log("Status : ");
      console.log("Check : " + check);
      console.log("Stalemate : " + stalemate);
      console.log("Checkmate : " + checkmate);
    };
    that.movePieceTo = function (stg) {
      let piece = stg.piece,
        x = stg.x,
        y = stg.y,
        cell = that.cells[x][y],
        pieceAtLocation =
          stg.special == null
            ? CHESSAPP.Analyzer.pieceExists({ pieces: that.pieces, x: x, y: y })
            : null,
        callback = stg.callback,
        moveData = {
          pieceType: piece.pieceType,
          fromX: piece.x,
          toX: x,
          toY: y,
        };
      if (_settings.locked == true) {
        return false;
      }
      if (!that.isOption(piece, cell)) {
        return false;
      }
      if (stg.local) {
        if (piece.pieceType == "pawn" && (y == 0 || y == 7)) {
          let cb = function () {
            stg.promotion = true;
            that.movePieceTo(stg);
          };
          that.showPromotion({ piece: piece, callback: cb });
          return;
        }
      }
      if (stg.special != null) {
        console.log("Special move!", stg.special);
        if (stg.special.type == "en") {
          pieceAtLocation = CHESSAPP.Analyzer.pieceExists({
            pieces: that.pieces,
            x: stg.special.enx,
            y: stg.special.eny,
          });
        } else if (stg.special.type == "castle") {
          console.log("Castling");
          let rook = CHESSAPP.Analyzer.pieceExists({
            pieces: that.pieces,
            x: stg.special.rookx,
            y: stg.special.rooky,
          });
          rook.y = stg.special.rooktoy;
          rook.x = stg.special.rooktox;
          rook.numOfMoves++;
          rook.justMoved = true;
          CHESSAPP.ui.addPiece(rook, that.cells[rook.x][rook.y]);
        }
      }
      if (pieceAtLocation != null) {
        if (pieceAtLocation.color != piece.color) {
          moveData.killed = true;
          that.killPiece(pieceAtLocation);
        } else {
          console.log("Invalid move cannot move on another piece of same color");
          return;
        }
      }
      if (stg.local) {
        let params = { pieceX: piece.x, pieceY: piece.y, newX: x, newY: y, special: stg.special };
        if (stg.promotion) {
          params.promotion = piece.pieceType;
        }
        that.sendMove(params);
      }
      if (stg.promotion) {
        moveData.promotion = stg.promotion;
      }
      piece.y = y;
      piece.x = x;
      piece.numOfMoves++;
      piece.justMoved = true;
      that.switchTurn();
      that.addToMoveList(moveData);
      that.clearAllOptionStyles();
      selectedPieceIndex = -1;
      CHESSAPP.ui.addPiece(piece, cell);
      that.updateOptions();
    };
    that.killPiece = function (piece) {
      that.removePieceFromDom(piece);
      that.removePieceFromList(piece);
    };
    that.removePieceFromDom = function (piece) {
      let parent = piece.reference.parentNode;
      if (parent != null) {
        parent.removeChild(piece.reference);
      }
    };
    that.removePieceFromList = function (piece) {
      that.pieces[that.pieces.indexOf(piece)] = null;
    };
    (that.showPromotion = function (stg) {
      _settings.locked = true;
      stg.val = true;
      CHESSAPP.ui.setSelectionVisible(stg);
    }),
      (that.promote = function (stg) {
        let type = stg.pieceType,
          pieceGettingPromoted = stg.piece;
        if (pieceGettingPromoted) {
          let local = pieceGettingPromoted.color == _settings.onlineColor;
          if (local || !_settings.online) {
            that.statusUpdate({ msg: "You have promoted", type: "s" });
          } else {
            that.statusUpdate({ msg: "Your opponent has been promoted", type: "e" });
          }
          pieceGettingPromoted.pieceType = type;
          CHESSAPP.ui.updatePiece(pieceGettingPromoted);
          CHESSAPP.ui.setSelectionVisible({ val: false });
          _settings.locked = false;
          if (stg.callback) {
            stg.callback();
          }
        }
      });
    that.onlineMove = function (data) {
      console.log(data);
      let pieceMoved = CHESSAPP.Analyzer.pieceExists({
        pieces: that.pieces,
        x: data.pieceX,
        y: data.pieceY,
      });
      if (pieceMoved) {
        if (data.promotion) {
          that.promote({ piece: pieceMoved, pieceType: data.promotion });
        }
        that.movePieceTo({
          piece: pieceMoved,
          x: data.newX,
          y: data.newY,
          promotion: data.promotion,
          special: data.special,
        });
      }
    };
    that.chatMessage = function (stg) {
      if (!stg.msg) {
        return;
      }
      if (stg.local) {
        stg.color = _settings.onlineColor;
        CHESSAPP.onlinePlay.sendChat(stg);
      }
      CHESSAPP.ui.addChatMessage(stg);
    };
    return that;
  })();
  let statusScroller = function (stg) {
    if (this == window) {
      return new statusScroller(stg);
    }
    let lineHeight = 0,
      offset = 0,
      maxLines = stg.maxLines,
      totalLines = 0,
      containerElem = stg.elem,
      windowElem = document.createElement("div");
    windowElem.style.position = "relative";
    containerElem.appendChild(windowElem);
    this.updateClasses = function () {
      return;
      CHESSAPP.utils.removeClass(containerElem, "upDisabled");
      CHESSAPP.utils.removeClass(containerElem, "downDisabled");
      if (totalLines < maxLines) {
        CHESSAPP.utils.addClass(containerElem, "upDisabled");
        CHESSAPP.utils.addClass(containerElem, "downDisabled");
      } else if (offset == maxLines - totalLines - 1) {
        CHESSAPP.utils.addClass(containerElem, "downDisabled");
      } else if (offset == 0) {
        CHESSAPP.utils.addClass(containerElem, "upDisabled");
      }
    };
    this.move = function (up) {
      if (stg.scroll) {
        return;
      }
      if (totalLines <= maxLines) {
        return;
      }
      if (up) {
        if (offset >= 0) {
          return;
        } else {
          offset++;
        }
      } else {
        if (offset <= maxLines - totalLines - 1) {
          return;
        } else {
          offset--;
        }
      }
      windowElem.style.top = offset * lineHeight + "px";
      this.updateClasses();
    };
    this.goToBottom = function () {
      if (stg.scroll) {
        containerElem.scrollTop = containerElem.scrollHeight;
      } else {
        if (totalLines > maxLines) {
          offset = maxLines - totalLines;
          windowElem.style.top = offset * lineHeight + "px";
        }
      }
      this.updateClasses();
    };
    this.add = function (stg) {
      let def = {
          msg: "",
          type: "fb",
          showTime: false,
        },
        textNode,
        textNode2,
        p = document.createElement("p"),
        time = new Date(),
        timetext = time.toLocaleTimeString(),
        timeEl = document.createElement("time");
      CHESSAPP.utils.extend(def, stg);
      if (def.msg == null) {
        return false;
      }
      textNode = document.createTextNode(timetext);
      timeEl.appendChild(textNode);
      p.appendChild(timeEl);
      textNode2 = document.createTextNode(stg.msg);
      p.appendChild(textNode2);
      p.setAttribute("class", def.type);
      windowElem.appendChild(p);
      totalLines++;
      lineHeight = p.offsetHeight;
      this.goToBottom();
    };
  };