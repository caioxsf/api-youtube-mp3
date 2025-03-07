const express = require("express");
const app = express();
const ytdl = require("@distube/ytdl-core");
const cors = require("cors");

const corsOptions = {
  origin: "https://front-end-api-mp3.vercel.app", 
  credentials: true,
  optionSuccessStatus: 200,
  exposedHeaders: "**",
};

const port = process.env.PORT || 3001;

app.use(cors(corsOptions));

app.get("/download", async (req, res, next) => {
  console.log(req.query.url);
  try {
    const videoUrl = req.query.url;
    const videoInfo = await ytdl.getInfo(videoUrl);

    // Filtra formatos de áudio apenas
    const audioFormats = ytdl.filterFormats(videoInfo.formats, "audioonly");
    console.log(audioFormats);

    // Escolhe o primeiro formato de áudio disponível (ou um específico, se preferir)
    const audioFormat = audioFormats[0];
    if (!audioFormat) {
      return res.status(500).send("Nenhum formato de áudio disponível.");
    }

    // Configura os cabeçalhos para forçar o download
    res.setHeader("Content-Disposition", `attachment; filename="${videoInfo.videoDetails.title}.mp3"`);
    res.setHeader("Content-Type", "audio/mpeg");

    // Faz o streaming do áudio diretamente para o cliente
    ytdl(videoUrl, {
      filter: "audioonly",
      quality: "highestaudio", // qualidade mais alta disponível
    }).pipe(res);

  } catch (error) {
    console.error("Erro:", error);
    next(error);
  }
});

app.listen(port, () => {
  console.log(`Server rodando na porta ${port}`);
});