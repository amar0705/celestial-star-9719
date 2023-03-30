CHESSAPP.ui = (function () {
  let that = {},
    chessboard = null,
    rightCol = null,
    selection = null,
    color = null,
    initial = null,
    moveList = null,
    moveListCurRow = null,
    rowCount = 1,
    overlay = null,
    overlayScreens = {},
    status = null,
    statusWindow = null,
    lineSize = 0,
    promotion_data = null,
    chatWindow = null,
    chatInput = null,
    online = false,
    preferredColor = "W",
    chatActive = false,
    initSub = null,
    elementsCreated = false;

  let createRightCol = function () {
    rightCol = document.createElement("div");
    rightCol.className = "rightCol";
    container.appendChild(rightCol);
  };
  let createChat = function (chatID) {
    chatContainer = document.createElement("div");
    chatContainer.className = "chat";
    chatInput = document.createElement("input");
    chatWindow = document.createElement("div");
    chatWindow.className = "chatContainer";
    let cw = chatWindow,
      ci = chatInput,
      def = "Write something here...";
    ci.value = def;
    CHESSAPP.utils.bind(ci, "focus", function (e) {
      if (ci.value == def) {
        ci.value = "";
      }
    });
    CHESSAPP.utils.bind(ci, "blur", function (e) {
      if (ci.value == "") {
        ci.value = def;
      }
    });
    CHESSAPP.utils.bind(ci, "keypress", function (e) {
      let key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : e.which ? e.which : 0;
      if (key == "13") {
        CHESSAPP.GamePlay.chatMessage({ msg: ci.value, local: true });
        ci.value = "";
      }
    });
    let header = document.createElement("h2");
    header.appendChild(document.createTextNode("Messages"));
    chatContainer.appendChild(header);
    chatContainer.appendChild(cw);
    chatContainer.appendChild(ci);
    rightCol.appendChild(chatContainer);
  };
  let activateChat = function () {
    chatActive = true;
    CHESSAPP.utils.addClass(chatContainer, "active");
  };
  let deactivateChat = function () {
    chatActive = false;
    CHESSAPP.utils.removeClass(chatContainer, "active");
  };
  let createMovelist = function () {
    let moveListContainer = document.createElement("div"),
      moveListScroll = document.createElement("div"),
      header = document.createElement("h2");
    moveList = document.createElement("table");
    breakEl = document.createElement("br");
    header.appendChild(document.createTextNode("Moves"));
    moveListContainer.className = "movelist";
    moveListScroll.className = "scroll";
    moveListScroll.appendChild(moveList);
    moveListContainer.appendChild(header);
    moveListContainer.appendChild(breakEl);
    moveListContainer.appendChild(moveListScroll);
    moveListCurRow = document.createElement("tr");
    moveList.appendChild(moveListCurRow);
    rightCol.appendChild(moveListContainer);
  };
  let createOverlay = function () {
    let wrapper = document.getElementById("wrapper");
    overlay = document.createElement("div");
    overlay.className = "overlay";
    wrapper.appendChild(overlay);
    createSelection();
    createColor();
    createInitial();
  };
  let createSelection = function () {
    let selection = document.createElement("div"),
      frag = document.createDocumentFragment(),
      a = document.createElement("a"),
      a2 = document.createElement("a"),
      a3 = document.createElement("a"),
      a4 = document.createElement("a");
    selection.className = "selection overscreen";
    a.setAttribute("data-pieceType", "knight");
    a.appendChild(document.createTextNode("Knight"));
    a2.setAttribute("data-pieceType", "bishop");
    a2.appendChild(document.createTextNode("Bishop"));
    a3.setAttribute("data-pieceType", "rook");
    a3.appendChild(document.createTextNode("Rook"));
    a4.setAttribute("data-pieceType", "queen");
    a4.appendChild(document.createTextNode("Queen"));
    frag.appendChild(a);
    frag.appendChild(a2);
    frag.appendChild(a3);
    frag.appendChild(a4);
    selection.appendChild(frag);
    overlay.appendChild(selection);
    CHESSAPP.utils.bind(selection, "click", that.promotionClicked);
    selection = selection;
    overlayScreens["selection"] = { elem: selection };
  };
  let createColor = function () {
    let color = document.createElement("div"),
      frag = document.createDocumentFragment(),
      a = document.createElement("a"),
      a2 = document.createElement("a"),
      a3 = document.createElement("a"),
      a4 = document.createElement("a"),
      h2 = document.createElement("h2"),
      span = document.createElement("span");
    breakEl = document.createElement("br");
    color.className = "color overscreen";
    h2.appendChild(document.createTextNode("Choose your preferred color"));
    a.setAttribute("data-color", "W");
    a.appendChild(document.createTextNode("White"));
    a2.setAttribute("data-color", "B");
    a2.appendChild(document.createTextNode("Black"));
    a3.setAttribute("data-color", "U");
    a3.appendChild(document.createTextNode("Unspecified"));
    span.appendChild(
      document.createTextNode("Matches up with anyone, either black or white player")
    );
    a3.appendChild(span);
    frag.appendChild(h2);
    frag.appendChild(breakEl);
    frag.appendChild(a);
    frag.appendChild(a2);
    frag.appendChild(a3);
    color.appendChild(frag);
    overlay.appendChild(color);
    CHESSAPP.utils.bind(color, "click", that.preferredClicked);
    color = color;
    overlayScreens["color"] = { elem: color };
  };
  createInitial = function () {
    let initial = document.createElement("div"),
      frag = document.createDocumentFragment(),
      a = document.createElement("a"),
      a2 = document.createElement("a"),
      h2 = document.createElement("h2");
    h2.setAttribute("class", "mode");
    breakEl = document.createElement("br");
    initial.className = "initial overscreen";
    h2.appendChild(document.createTextNode("Choose your mode"));
    a.setAttribute("data-mode", "offline");
    a.appendChild(document.createTextNode("Offline Play"));
    a2.setAttribute("data-mode", "online");
    a2.appendChild(document.createTextNode("Online Play"));
    frag.appendChild(h2);
    frag.appendChild(breakEl);
    frag.appendChild(a);
    frag.appendChild(a2);
    initial.appendChild(frag);
    overlay.appendChild(initial);
    CHESSAPP.utils.bind(initial, "click", that.modeClicked);
    initial = initial;
    overlayScreens["initial"] = { elem: initial };
  };
  let createStatus = function (statusID) {
    (status = document.createElement("div")),
      (arrow_up = document.createElement("a")),
      (arrow_down = document.createElement("a"));
    status.className = "status";
    arrow_up.className = "arrow_up";
    arrow_down.className = "arrow_down";
    statusWindow = new statusScroller({ elem: status, maxLines: 2 });
    CHESSAPP.utils.bind(arrow_up, "click", function (e) {
      statusWindow.move(true);
      e.preventDefault();
      return false;
    });
    CHESSAPP.utils.bind(arrow_down, "click", function (e) {
      statusWindow.move(false);
      e.preventDefault();
      return false;
    });
    status.appendChild(arrow_up);
    status.appendChild(arrow_down);
    container.appendChild(status);
  };
  let readyToPlay = function () {
    if (online) {
      activateChat();
    } else {
      deactivateChat();
    }
    initSub.apply(window, [{ color: preferredColor, online: online }]);
  };
  let toggleOverlay = function (val, screen) {
    overlay.style.display = val ? "block" : "none";
    for (let i in overlayScreens) {
      if (overlayScreens.hasOwnProperty(i)) {
        overlayScreens[i].elem.style.display = "none";
      }
    }
    if (val && !!screen) {
      overlayScreens[screen].elem.style.display = "block";
    }
  };
  let drawCells = function () {
    (chessboard = document.createElement("div")),
      (frag = document.createDocumentFragment()),
      (cellDiv = document.createElement("div")),
      (cells = new Array(8));
    chessboard.className = "chessboard";
    for (let x = 0; x < 8; x++) {
      cells[x] = new Array(8);
    }
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        let clone = cellDiv.cloneNode();
        if ((x % 2 == 1 && y % 2 == 1) || (x % 2 == 0 && y % 2 == 0)) {
          CHESSAPP.utils.addClass(clone, "W");
        } else {
          CHESSAPP.utils.addClass(clone, "B");
        }
        clone.setAttribute("data-x", x);
        clone.setAttribute("data-y", y);
        cells[x][y] = {
          reference: clone,
          x: x,
          y: y,
        };
        if (CHESSAPP.globalSettings.debug) {
          let coords = document.createElement("p");
          coords.innerHTML = x + " , " + y;
          cells[x][y].reference.appendChild(coords);
        }
        frag.appendChild(clone);
      }
    }
    chessboard.appendChild(frag);
    container.appendChild(chessboard);
    CHESSAPP.utils.bind(chessboard, "click", CHESSAPP.ui.boardClicked);
    return cells;
  };
  that.init = function (stg) {
    container = stg.container;
    if (!elementsCreated) {
      createStatus();
      createOverlay();
      createRightCol();
      createChat();
      createMovelist();
      elementsCreated = true;
    }
    toggleOverlay(true, "initial");
    return drawCells();
  };
  that.addChatMessage = function (stg) {
    let prefix = stg.color == "W" ? "White - " : stg.color == "B" ? "Black - " : "",
      p = document.createElement("p"),
      textNode = document.createTextNode(prefix + stg.msg);
    p.appendChild(textNode);
    chatWindow.appendChild(p);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  };
  that.addMove = function (txt) {
    console.log("Showing move:" + txt);
    let cell = document.createElement("td");
    if (CHESSAPP.GamePlay.getTurn() == "B") {
      cell.appendChild(document.createTextNode("" + rowCount + "."));
      moveListCurRow.appendChild(cell);
      cell = document.createElement("td");
      cell.appendChild(document.createTextNode(txt));
      moveListCurRow.appendChild(cell);
    } else {
      cell.appendChild(document.createTextNode(txt));
      moveListCurRow.appendChild(cell);
      rowCount++;
      moveListCurRow = document.createElement("tr");
      moveList.appendChild(moveListCurRow);
    }
  };
  that.statusUpdate = function (stg) {
    stg.showTime = true;
    statusWindow.add(stg);
  };
  that.drawPieces = function (pieces, cells) {
    let i = 0,
      max = pieces.length;
    for (; i < max; i++) {
      let p = pieces[i];
      let img = new Image();
      img.src = CHESSAPP.globalSettings.imageDir + p.color + "_" + p.pieceType + ".png";
      p.reference = img;
      cells[p.x][p.y].reference.appendChild(img);
    }
  };
  that.addPiece = function (piece, cell) {
    cell.reference.appendChild(piece.reference);
  };
  that.updatePiece = function (piece) {
    let p = piece;
    p.reference.src = CHESSAPP.globalSettings.imageDir + p.color + "_" + p.pieceType + ".png";
  };
  that.addOptionStyles = function (cell, userSettings) {
    let stg = {
      attackable: true,
      movable: true,
    };
    CHESSAPP.utils.extend(stg, userSettings);

    if (stg.attackable) {
      CHESSAPP.utils.addClass(cell.reference, "attackable");
    }

    if (stg.movable) {
      CHESSAPP.utils.addClass(cell.reference, "movable");
    }
  };
  that.clearOptionStyles = function (cell) {
    CHESSAPP.utils.removeClass(cell.reference, "movable");
    CHESSAPP.utils.removeClass(cell.reference, "attackable");
  };
  that.onInitialChoice = function (callback) {
    initSub = callback;
  };
  that.setSelectionVisible = function (stg) {
    let val = stg.val;
    if (val) {
      overlay.style.display = "block";
      promotion_data = stg;
      toggleOverlay(true, "selection");
    } else {
      promotion_data = null;
      toggleOverlay(false, "selection");
    }
  };
  that.modeClicked = function (e) {
    e.preventDefault();
    e.stopPropagation();
    e = e || window.event;
    src = e.target || e.srcElement;
    if (src.nodeName.toLowerCase() == "a") {
      let val = src.getAttribute("data-mode");
      if (val == "offline") {
        online = false;
      } else if (val == "online") {
        online = true;
      }
    }
    if (online) {
      toggleOverlay(true, "color");
    } else {
      toggleOverlay(false);
      readyToPlay();
    }
  };
  that.preferredClicked = function (e) {
    e.preventDefault();
    e.stopPropagation();
    e = e || window.event;
    src = e.target || e.srcElement;
    if (src.nodeName.toLowerCase() == "a") {
      let val = src.getAttribute("data-color");
      if (val) {
        console.log(val + " color");
        if (initSub == null) {
          console.log("Init sub is null");
        } else {
          preferredColor = val;
          readyToPlay();
        }
      }
      toggleOverlay(false);
    }
  };
  that.promotionClicked = function (e) {
    e.preventDefault();
    e.stopPropagation();
    e = e || window.event;
    src = e.target || e.srcElement;
    if (src.nodeName.toLowerCase() == "a") {
      let val = src.getAttribute("data-pieceType");
      if (val) {
        console.log("User selected " + val);
        promotion_data.pieceType = val;
        CHESSAPP.GamePlay.promote(promotion_data);
      }
    }
    return false;
  };
  that.boardClicked = function (e) {
    let x,
      y,
      cellReference,
      pieceClicked = false;
    e = e || window.event;
    src = e.target || e.srcElement;
    if (src.nodeName.toLowerCase() == "img") {
      cellReference = src.parentNode;
    } else if (src.nodeName.toLowerCase() == "div") {
      cellReference = src;
    }
    if (cellReference) {
      x = cellReference.getAttribute("data-x");
      y = cellReference.getAttribute("data-y");

      if (x && y) {
        CHESSAPP.GamePlay.cellClicked(x, y);
        let piece = CHESSAPP.Analyzer.pieceExists({ pieces: CHESSAPP.GamePlay.pieces, x: x, y: y });
        if (piece) {
          CHESSAPP.GamePlay.pieceClicked(piece);
        }
      }
    }
  };
  return that;
})();
