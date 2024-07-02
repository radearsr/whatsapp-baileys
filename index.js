require("dotenv").config();
const express = require("express");
const {
  connectToWhatsApp,
  isConnected,
} = require("./services/baileysServices");
const { currentTime } = require("./utils/utilsDate");

const app = express();

const PORT = process.env.SERVER_PORT || 3000;

app.use(express.json());

let socket;

const currentLocalTime = () => {
  const date = new Date();
  const currentTime = date.toLocaleTimeString();
  const currentDate = date.toLocaleDateString();
  return `${currentDate} ${currentTime}`;
};

app.get("/sendWA", async (req, res) => {
  try {
    if (!isConnected()) throw new Error("WHATSAPP_NOT_CONNECTED");
    const { to, message } = req.query;
    console.log(`[${currentTime()}]-[${to}]-${message}`);
    const numberWA = "62" + to.substring(1) + "@s.whatsapp.net";
    console.log("--------------------");
    console.log(`Time => ${currentLocalTime()}`);
    console.log(`Number: ${to}`);
    console.log(`Message: ${message}`);
    console.log("--------------------");
    await socket.sendMessage(numberWA, { text: message });
    res.send({
      status: "success",
      message: "berhasil kirim",
    });
  } catch (error) {
    if (error.message === "WHATSAPP_NOT_CONNECTED") {
      return res.status(400).send({
        status: "fail",
        message: "whatsapp tidak konek",
      });
    }
    res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
});

app.listen(PORT, async () => {
  socket = await connectToWhatsApp();
  console.log(`http://127.0.0.1:${PORT}`);
});
