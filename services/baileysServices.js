const {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const log = require("pino");

const { session } = { "session": "auth_baileys" };

let SOCKET;

const isConnected = () => SOCKET.user;

const connectToWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(session);

  SOCKET = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    logger: log({ level: "silent" })
  });

  SOCKET.multi = true;

  SOCKET.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      let reason = new Boom(lastDisconnect.error).output.statusCode;
      switch (reason) {
        case DisconnectReason.badSession:
          console.log(`Bad Session File, Please Delete ${session} and Scan Again`);
          SOCKET.logout();
          break;
        case DisconnectReason.connectionClosed:
          console.log("Connection closed, reconnecting....");
          connectToWhatsApp();
          break;
        case DisconnectReason.connectionLost:
          console.log("Connection Lost from Server, reconnecting...");
          connectToWhatsApp();
          break;
        case DisconnectReason.connectionReplaced:
          console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
          SOCKET.logout();
          break;
        case DisconnectReason.loggedOut:
          console.log(`Device Logged Out, Please Delete ${session} and Scan Again.`);
          SOCKET.logout();
          break;
        case DisconnectReason.restartRequired:
          console.log("Restart Required, Restarting...");
          connectToWhatsApp();
          break;
        case DisconnectReason.timedOut:
          console.log("Connection TimedOut, Reconnecting...");
          connectToWhatsApp();
          break;
        default:
          SOCKET.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`);
          break;
      }
    }

    if (connection === "open" && isConnected()) {
      console.log("Whatsapp is ready");
    };
    if (connection === "open") return console.log("Opened Connection");
    if (update.qr) return console.log("QR Code received, please scan!");
  });

  SOCKET.ev.on("creds.update", saveCreds);
  return SOCKET;
};

module.exports = {
  connectToWhatsApp,
  isConnected,
};
