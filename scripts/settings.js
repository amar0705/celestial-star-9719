// Initializing the CHESSAPP object
let CHESSAPP = {};

// Global settings for the chess application
CHESSAPP.globalSettings = {
  imageDir: "images/", // Directory path for the chess piece images
  debug: false, // Flag for enabling debug mode
  live: false, // Flag for indicating if it's a live game
  port: 5800, // Port number for the server connection
  host: "https://chess-2par.onrender.com", // Host URL for the server connection
};

// Game settings for the chess application
let gameSettings = {
  containerID: "container", // ID of the HTML container element for the chess game
  online: true, // Flag for indicating if it's an online game
  preferredColor: false, // Preferred color for the player (false means no preference)
};
