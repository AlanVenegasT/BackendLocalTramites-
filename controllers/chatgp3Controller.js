
const ResponseError = require("../utils/ResponseError");
const Configuration = require("openai").Configuration;
const OpenAIApi = require("openai").OpenAIApi;
const { ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { S3 } = require("@aws-sdk/client-s3");


//Configuracion de Credenciales de OpenAI
const configuration = new Configuration({
  apiKey: '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',
  organization: 'org-AbYTNsJidaasVduSiWXL6fy6',
});

const s3Client = new S3({
  forcePathStyle: false,
  endpoint: process.env.S3_ENDPOINT, // Cambia la URL del endpoint
  region: process.env.REGION_DO,
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});



// Crear una instancia de OpenAI
const openai = new OpenAIApi(configuration);

const chatgp3L = async (req, res) => {
  try {
      const { prompt } = req.body;

      const listObjectsCommand = new ListObjectsV2Command({
        Bucket: process.env.BUCKET_NAME,
        // The default and maximum number of keys returned is 1000. This limits it to
        // one for demonstration purposes.
        MaxKeys: 20,
      });

      const listObjectsResponse = await s3Client.send(listObjectsCommand);

    // Imprimir la lista de objetos en la consola
    //console.log("Archivos en el bucket:", listObjectsResponse.Contents);

    // Filtrar los objetos por una clave específica (por ejemplo, "miKey")
    const keyToFilter = 'ArchivosIA/';
    const filteredObjects = listObjectsResponse.Contents.filter(obj => obj.Key === keyToFilter);

    // Imprimir la lista de objetos filtrados en la consola
    console.log("Archivos filtrados por clave:", filteredObjects);

      // Crear parámetros para la solicitud de chat
      const response = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages:[
            {role: "system", content: "You are a helpful assistant."},
            {role: "user", content: prompt}
          ],
      });

      res.status(200).json({
          status: "succesfull",
          data: {
              respuesta: response.data.choices[0].message.content,
          },
      });
  } catch (ex) {
      const response = new ResponseError(
          "fail",
          "Error al realizar la pregunta ",
          ex.message,
          []
      ).responseApiError();
      res.status(500).json(response);
      console.log(ex)
  }
};

module.exports = {
  chatgp3L,
};