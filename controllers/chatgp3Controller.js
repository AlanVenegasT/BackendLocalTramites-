// En el archivo chatgp3L.js
const ResponseError = require("../utils/ResponseError");
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const { imprimeCategoria } = require('../middlewares/category')

const lambdaClient = new LambdaClient({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
  },
});

const chatgp3L = async (req, res) => {
  try {
    const { prompt } = req.body;

    const functionName = "GPT-3_5";

    const params = {
      FunctionName: functionName,
      InvocationType: "RequestResponse",
      Payload: JSON.stringify({ prompt }),
    };

    const command = new InvokeCommand(params);
    const lambdaResponse = await lambdaClient.send(command);

    const decoder = new TextDecoder("utf-8");
    const decodedPayload = decoder.decode(lambdaResponse.Payload);
    const respuesta = JSON.parse(decodedPayload);

    const recomendaciones = await imprimeCategoria(req, res, prompt);

    res.status(200).json({
      status: "successful",
      data: {
        respuesta: respuesta,
        recomendaciones: recomendaciones,
      },
    });
  } catch (ex) {
    console.error(ex);
    const response = new ResponseError(
      "fail",
      "Error al invocar la función Lambda",
      ex.message,
      []
    ).responseApiError();
    res.status(500).json(response);
  }
};

module.exports = {
  chatgp3L,
};
