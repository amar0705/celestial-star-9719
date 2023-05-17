CHESSAPP.Analyzer = {
  // Castling information for both white and black kings
  castlingInfo: {
    W: {
      left: false,
      right: false,
    },
    B: {
      left: false,
      right: false,
    },
  },

  // Generates all possible move options for the given settings
  makeAllOptions: function (settings) {
    let stg = {
      pieces: null,
    };
    this.castlingInfo.B.left = false;
    this.castlingInfo.B.right = false;
    this.castlingInfo.W.left = false;
    this.castlingInfo.W.right = false;
    CHESSAPP.utils.extend(stg, settings);
    let pieces = stg.pieces;
    let max = pieces.length;
    let resp = {
      kingInCheck: false,
      allOptions: [],
    };

    let r, whiteKingIndex, blackKingIndex;
    // Iterate over all the pieces

    for (let i = 0; i < pieces.length; i++) {
      // Find the indices of white and black kings

      if (pieces[i] && pieces[i].pieceType == "king") {
        if (pieces[i].color == "W") {
          whiteKingIndex = i;
        } else {
          blackKingIndex = i;
        }
      }

      // Reset the justMoved flag for the current piece
      if (pieces[i] && CHESSAPP.GamePlay.getTurn() == pieces[i].color) {
        pieces[i].justMoved = false;
      }

      // Get the options for the current piece
      r = this.getOptions({ pieces: pieces, piece: pieces[i], checkTest: false });
      if (r && r.checkDetected) {
        if (r.checkDetected) {
          resp.kingInCheck = r.checkDetected;
        }
      }
      resp.allOptions.push(r.pieceOptions);
    }

    // Check for checkmate or stalemate for the white king
    if (resp.kingInCheck != "W") {
      r = this.getOptions({
        pieces: pieces,
        piece: pieces[whiteKingIndex],
        checkTest: false,
        castleTest: true,
      });
      if (r && r.checkDetected) {
        if (r.checkDetected) {
          resp.kingInCheck = r.checkDetected;
        }
      }
      resp.allOptions[whiteKingIndex] = resp.allOptions[whiteKingIndex].concat(r.pieceOptions);
    }

    // Check for checkmate or stalemate for the black king
    if (resp.kingInCheck != "B") {
      resp.allOptions.push(r.pieceOptions);
      r = this.getOptions({
        pieces: pieces,
        piece: pieces[blackKingIndex],
        checkTest: false,
        castleTest: true,
      });
      if (r && r.checkDetected) {
        if (r.checkDetected) {
          resp.kingInCheck = r.checkDetected;
        }
      }
      resp.allOptions[blackKingIndex] = resp.allOptions[blackKingIndex].concat(r.pieceOptions);
    }
    resp.allOptions.push(r.pieceOptions);
    return resp;
  },

  // Checks if the given color is in check
  checkTest: function (settings) {
    let stg = {
      pieces: null,
      color: "W",
    };
    CHESSAPP.utils.extend(stg, settings);
    let pieces = stg.pieces,
      color = stg.color;
    for (let i = 0; i < pieces.length; i++) {
      let r = this.getOptions({ pieces: pieces, piece: pieces[i], checkTest: color });
      if (r && r.checkDetected == color) {
        return true;
      }
    }
    return false;
  },

  // Gets all possible move options for a piece
  getOptions: function (settings) {
    let stg = {
      pieces: null,
      piece: null,
      checkTest: false,
      castleTest: false,
    };
    CHESSAPP.utils.extend(stg, settings);
    let piece = stg.piece,
      pieces = stg.pieces;
    let resp = {
      checkDetected: false,
      pieceOptions: null,
    };

    // Skip if the piece is not present or its color is different from the current turn
    if (!piece) {
      return resp;
    }

    // Initialize an emoty array of options
    let pieceOptions = [],
      curx = parseInt(piece.x),
      cury = parseInt(piece.y),
      color = piece.color,
      type = piece.pieceType;
    let checkFound = false;
    let mk = function (x, y, m, a, s) {
      let r = CHESSAPP.Analyzer.makeOption({
        pieces: pieces,
        x: x,
        y: y,
        piece: piece,
        canMove: m,
        canAttack: a,
        checkTest: stg.checkTest,
        special: s,
      });

      if (r.checkDetected) {
        resp.checkDetected = r.checkDetected;
      }

      if (r.valid) {
        if (stg.castleTest) {
        }
        if (!stg.checkTest) {
          if (piece.color == "B") {
            if ((x == 3 || x == 2) && y == 7) {
              CHESSAPP.Analyzer.castlingInfo.W.left = true;
            } else if ((x == 5 || x == 6) && y == 7) {
              CHESSAPP.Analyzer.castlingInfo.W.right = true;
            }
          } else if (piece.color == "W") {
            if ((x == 3 || x == 2) && y == 0) {
              CHESSAPP.Analyzer.castlingInfo.B.left = true;
            } else if ((x == 5 || x == 6) && y == 0) {
              CHESSAPP.Analyzer.castlingInfo.B.right = true;
            }
          }
        }
        pieceOptions.push(r);
      }
      return r.canMovePast;
    };

    let flip = color == "B" ? 1 : -1;
    switch (type) {
      case "pawn":
        let tmp = mk(curx, cury + 1 * flip, true, false);
        if (piece.numOfMoves == 0 && tmp) {
          mk(curx, cury + 2 * flip, true, false);
        }
        let rp = CHESSAPP.Analyzer.pieceExists({ pieces: pieces, x: curx + 1, y: cury });
        if (
          rp != null &&
          rp.color != piece.color &&
          rp.pieceType == "pawn" &&
          rp.justMoved &&
          rp.numOfMoves == 1 &&
          (rp.y == 3 || rp.y == 4)
        ) {
          let special = {
            type: "en",
            enx: curx + 1,
            eny: cury,
          };
          mk(curx + 1, cury + 1 * flip, true, true, special);
        }
        rp = CHESSAPP.Analyzer.pieceExists({ pieces: pieces, x: curx - 1, y: cury });
        if (
          rp != null &&
          rp.color != piece.color &&
          rp.pieceType == "pawn" &&
          rp.justMoved &&
          rp.numOfMoves == 1 &&
          (rp.y == 3 || rp.y == 4)
        ) {
          let special = {
            type: "en",
            enx: curx - 1,
            eny: cury,
          };
          mk(curx - 1, cury + 1 * flip, true, true, special);
        }
        if (CHESSAPP.Analyzer.pieceExists({ pieces: pieces, x: curx + 1, y: cury + 1 * flip })) {
          mk(curx + 1, cury + 1 * flip, false, true);
        }
        if (CHESSAPP.Analyzer.pieceExists({ pieces: pieces, x: curx - 1, y: cury + 1 * flip })) {
          mk(curx - 1, cury + 1 * flip, false, true);
        }
        break;
      case "king":
        if (stg.castleTest) {
          let leftCastle = true,
            rightCastle = true;
          if (piece.numOfMoves > 0 || CHESSAPP.GamePlay.kingInCheck == piece.color) {
            leftCastle = false;
            rightCastle = false;
          } else {
            if (this.castlingInfo[piece.color].left) {
              leftCastle = false;
            } else {
              let leftP;
              for (let i = 1; i <= 4; i++) {
                leftP = CHESSAPP.Analyzer.pieceExists({ pieces: pieces, x: curx - i, y: cury });
                if (i < 4 && leftP != null) {
                  leftCastle = false;
                }
              }
              if (
                leftP != null &&
                leftP.pieceType == "rook" &&
                leftP.color == piece.color &&
                leftP.numOfMoves == 0
              ) {
              } else {
                leftCastle = false;
              }
            }
            if (this.castlingInfo[piece.color].right) {
              rightCastle = false;
            } else {
              let rightP;
              for (let i = 1; i <= 3; i++) {
                rightP = CHESSAPP.Analyzer.pieceExists({ pieces: pieces, x: curx + i, y: cury });
                if (i < 3 && rightP != null) {
                  rightCastle = false;
                }
              }
              if (
                rightP != null &&
                rightP.pieceType == "rook" &&
                rightP.color == piece.color &&
                rightP.numOfMoves == 0
              ) {
              } else {
                rightCastle = false;
              }
            }
          }
          if (leftCastle) {
            let special = {
              type: "castle",
              side: "left",
              rookx: curx - 4,
              rooky: cury,
              rooktox: curx - 1,
              rooktoy: cury,
            };
            mk(curx - 2, cury, true, false, special);
          }
          if (rightCastle) {
            let special = {
              type: "castle",
              side: "right",
              rookx: curx + 3,
              rooky: cury,
              rooktox: curx + 1,
              rooktoy: cury,
            };
            mk(curx + 2, cury, true, false, special);
          }
          if (leftCastle && !stg.checkTest) {
          } else if (!leftCastle && !stg.checkTest) {
          }

          if (rightCastle && !stg.checkTest) {
          } else if (!rightCastle && !stg.checkTest) {
          }
        } else {
          mk(curx - 1, cury + 1, true, true);
          mk(curx - 1, cury, true, true);
          mk(curx - 1, cury - 1, true, true);
          mk(curx + 1, cury + 1, true, true);
          mk(curx + 1, cury, true, true);
          mk(curx + 1, cury - 1, true, true);
          mk(curx, cury + 1, true, true);
          mk(curx, cury - 1, true, true);
        }
        break;
      case "knight":
        mk(curx - 1, cury + 2, true, true);
        mk(curx - 1, cury - 2, true, true);
        mk(curx + 1, cury + 2, true, true);
        mk(curx + 1, cury - 2, true, true);
        mk(curx - 2, cury + 1, true, true);
        mk(curx - 2, cury - 1, true, true);
        mk(curx + 2, cury + 1, true, true);
        mk(curx + 2, cury - 1, true, true);
        break;
      case "bishop":
      case "rook":
      case "queen":
        if (type != "bishop") {
          for (let i = curx - 1; i >= 0; i--) {
            if (!mk(i, cury, true, true)) {
              break;
            }
          }
          for (let j = curx + 1; j <= 7; j++) {
            if (!mk(j, cury, true, true)) {
              break;
            }
          }
          for (let k = cury - 1; k >= 0; k--) {
            if (!mk(curx, k, true, true)) {
              break;
            }
          }
          for (let l = cury + 1; l <= 7; l++) {
            if (!mk(curx, l, true, true)) {
              break;
            }
          }
        }
        if (type != "rook") {
          for (let i = 1; i <= Math.min(curx, cury); i++) {
            if (!mk(curx - i, cury - i, true, true)) {
              break;
            }
          }
          for (let i = 1; i <= 7 - Math.max(curx, cury); i++) {
            if (!mk(curx + i, cury + i, true, true)) {
              break;
            }
          }
          for (let i = 1; i <= Math.min(7 - curx, cury); i++) {
            if (!mk(curx + i, cury - i, true, true)) {
              break;
            }
          }
          for (let i = 1; i <= Math.min(curx, 7 - cury); i++) {
            if (!mk(curx - i, cury + i, true, true)) {
              break;
            }
          }
        }
        break;
    }

    if (stg.checkTest) {
      return resp;
    }
    resp.pieceOptions = pieceOptions;
    return resp;
  },
  withinBounds: function (x, y) {
    return x >= 0 && x <= 7 && y >= 0 && y <= 7;
  },
  makeOption: function (settings) {
    let stg = {
      pieces: null,
      piece: null,
      canAttack: true,
      canMove: true,
      checkTest: false,
      x: -1,
      y: -1,
      special: null,
    };
    CHESSAPP.utils.extend(stg, settings);
    let x = stg.x,
      y = stg.y,
      piece = stg.piece,
      pieces = stg.pieces,
      special = stg.special;
    let resp = {
      x: x,
      y: y,
      valid: true,
      attackable: false,
      movable: false,
      canMovePast: true,
      checkDetected: false,
      special: special,
    };
    if (!this.withinBounds(x, y)) {
      resp.valid = false;
      return resp;
    }
    let pieceExists = null;
    if (special == null) {
      pieceExists = this.pieceExists({ pieces: pieces, x: x, y: y, checkTest: stg.checkTest });
    } else if (special.type == "en") {
      pieceExists = this.pieceExists({
        pieces: pieces,
        x: special.enx,
        y: special.eny,
        checkTest: stg.checkTest,
      });
      if (!stg.checkTest) {
      }
    } else if (special.type == "castle") {
      resp.movable = true;
      return resp;
    }
    if (pieceExists) {
      if (stg.piece.color == pieceExists.color) {
        resp.valid = false;
        resp.canMovePast = false;
      } else {
        if (stg.canAttack) {
          resp.attackable = true;
          if (pieceExists.pieceType == "king") {
            if ((stg.checkTest && stg.checkTest == pieceExists.color) || !stg.checkTest) {
              resp.checkDetected = pieceExists.color;
              return resp;
            } else {
              resp.checkDetected = pieceExists.color;
            }
          }
          resp.canMovePast = false;
        } else {
          resp.valid = false;
          resp.canMovePast = false;
        }
      }
    }
    if (stg.canMove && resp.valid) {
      resp.movable = true;
    }
    resp.valid = resp.attackable || resp.movable;
    if (!stg.checkTest && resp.valid) {
      let pieceObj = {
        pieceType: piece.pieceType,
        color: piece.color,
        x: x,
        y: y,
      };
      let pieceOverrides = [
        {
          pieceIndex: pieces.indexOf(piece),
          val: pieceObj,
        },
      ];
      if (resp.attackable) {
        pieceOverrides.push({
          pieceIndex: pieces.indexOf(pieceExists),
          val: null,
        });
      }
      let newPieces = this.copyAndReplace({ pieces: pieces, overrides: pieceOverrides });
      if (this.checkTest({ pieces: newPieces, color: piece.color })) {
        resp.valid = false;
      }
    }
    return resp;
  },
  pieceExists: function (settings) {
    let stg = {
      checkTest: false,
      pieces: null,
      x: -1,
      y: -1,
    };
    CHESSAPP.utils.extend(stg, settings);
    let pieces = stg.pieces,
      x = stg.x,
      y = stg.y;
    if (!this.withinBounds(x, y)) {
      return null;
    }
    for (let i = 0; i < pieces.length; i++) {
      if (pieces[i]) {
        if (pieces[i].x == x && pieces[i].y == y) {
          return pieces[i];
        }
      }
    }
    return null;
  },
  copyAndReplace: function (settings) {
    let stg = {
        pieces: null,
        overrides: null,
      },
      newArray,
      max,
      max_o;
    CHESSAPP.utils.extend(stg, settings);
    max = stg.pieces.length;
    max_o = stg.overrides.length;
    newArray = new Array(max);
    for (let i = 0; i < max; i++) {
      newArray[i] = CHESSAPP.utils.shallowCopy(stg.pieces[i]);
    }
    for (let j = 0; j < max_o; j++) {
      let index = stg.overrides[j].pieceIndex;
      newArray[index] = null;
      newArray[index] = stg.overrides[j].val;
    }
    return newArray;
  },
};
