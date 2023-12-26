
const ResponseError = require("../utils/ResponseError");
const Configuration = require("openai").Configuration;
const OpenAIApi = require("openai").OpenAIApi;
const { ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { S3 } = require("@aws-sdk/client-s3");
const axios = require("axios");
//const fs = require("fs");

//Configuración de Credenciales de OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY_NUEVA,
  organization: process.env.ORG_ID,
});
// const s3Client = new S3({
//   forcePathStyle: false,
//   endpoint: process.env.S3_ENDPOINT, // Cambia la URL del endpoint
//   region: process.env.REGION_DO,
//   credentials: {
//       accessKeyId: process.env.AWS_ACCESS_KEY,
//       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//   }
// });
// Ruta donde se guardará el archivo
//const filePath = "output.txt";
// Crear una instancia de OpenAI
const openai = new OpenAIApi(configuration);

const chatgp3L = async (req, res) => {
  try {
      const { prompt } = req.body;

      if (!prompt) {
        const response = new ResponseError(
            'fail',
            'El correo es obligatorio',
            'Ingresa el correo porfavor no estas ingresando nada',
            []).responseApiError();

        return res.status(400).json(
            response
        );
    }

      const question = prompt + " Si no hay una respuesta a la pregunta o no estas seguro responde unicamente con: null "

    const config = {
      headers: {
        "x-api-key": process.env.KEY_PDF_CHAT,
        "Content-Type": "application/json",
      },
    };

    const data = {
      referenceSources: true,
      sourceId: process.env.SOURCEID, 
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
    };

    axios
    .post(process.env.URL_CHAT, data, config)
    .then(async (response) => {
      const answer = response.data.content.toLowerCase();
      console.log("Result:", answer);


    if(answer.includes("null")){

      try {
        const response = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages:[
            {role: "system", content: "You are a helpful assistant."},
            {role: "user", content: prompt},
          ],
      });
      res.status(200).json({
          status: "succesfull",
          data: {
              chat: "ChatGpt",
              respuesta: response.data.choices[0].message.content
          },
          
      });
      
      } catch (ex) {
        const response = new ResponseError(
          "fail",
          "Error la respuesta no viene nula",
          ex.message,
          []
      ).responseApiError();
      res.status(500).json(response);
      }
    }else{
      res.status(200).json({
        status: "succesfull",
        data: {
            chat: "ChatPdf",
            respuesta: answer
        },
        
    });
    }
  })
  .catch((ex) => {
      const response = new ResponseError(
          "fail",
          "Error al realizar la pregunta al API ",
          ex.message,
          []
      ).responseApiError();
      res.status(500).json(response);
  });
       // Crear parámetros para la solicitud de chat

  } catch (ex) {
    console.log(ex.response.data.error)
      const response = new ResponseError(
          "fail",
          "Error al realizar la pregunta ",
          ex.message,
          []
      ).responseApiError();
      res.status(500).json(response);
  }
};


const cloudPDFChatgpt = async (req, res) =>{

  const { urlPdf } = req.body;

  const config = {
    headers: {
      "x-api-key": process.env.KEY_PDF_CHAT,
      "Content-Type": "application/json",
    },
  };

  const data = {
    url: urlPdf,
  };

  try {
    const response = await axios.post(
      process.env.URL_GENERA_SOURCEID,
      data,
      config
    );

    // Maneja la respuesta exitosa
    console.log("Source ID:", response.data.sourceId);

    res.status(200).json({
      status: "successful",
      data: {
        response: response.data.sourceId,
      },
    });
  } catch (ex) {
    const response = new ResponseError(
      "fail",
      "Error al subir el PDF",
      ex.message,
      []
  ).responseApiError();
  res.status(500).json(response);
  }

  
};

const deletePDFChatgpt = async (req, res) => {
  const { idPdf } = req.body;

  const config = {
    headers: {
      "x-api-key": process.env.KEY_PDF_CHAT,
      "Content-Type": "application/json",
    },
  };

  const data = {
    sources: idPdf,
  };

  try {
    const response = await axios.post(
      process.env.URL_PDF_DELETE,
      data,
      config
    );


    res.status(200).json({
      status: "successful",
    });
  } catch (ex) {
    console.error("Error:", error.message);
    const response = new ResponseError(
      "fail",
      "Error al borrar el Id del PDF.",
      ex.message,
      []
  ).responseApiError();
  res.status(500).json(response);

    
  }
};


module.exports = {
  chatgp3L,
  cloudPDFChatgpt,
  deletePDFChatgpt
};