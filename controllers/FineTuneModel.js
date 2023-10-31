const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');

class FineTuneModel {
  openai;
  configuration;
  fineTuneModel;
  fileId;
  MAX_TOKEN = 200;
  FINE_TUNE_PARAMETER = "fine-tune";
  NAME_FILE = "./field.js";
  DATA_PREPARED = "/data_prepared.jsonl";
  constructor(fineTuneModel, openaiApiKey) {
    this.fineTuneModel = fineTuneModel;
    this.configuration = new Configuration({
      apiKey: openaiApiKey,
    });
    this.openai = new OpenAIApi(this.configuration);
  }

  async upload() {
    let response = null;
    try {
      response = await this.openai.createFile(
        fs.createReadStream(__dirname.concat(this.DATA_PREPARED)),
        this.FINE_TUNE_PARAMETER
      );
      const { data } = response;
      this.fileId = data.id;
  
      // Leer el contenido actual del archivo field.js
      const fieldPath = './field.js';
      let fieldContent = fs.readFileSync(fieldPath, 'utf8');
  
      // Encontrar la posición de la línea que contiene fileId
      const fileIdLineIndex = fieldContent.indexOf('export const fileId = ');
  
      if (fileIdLineIndex !== -1) {
        // Encontrar el valor actual del fileId
        const start = fileIdLineIndex + 'export const fileId = "'.length;
        const end = fieldContent.indexOf('"', start);
        const currentFileId = fieldContent.substring(start, end);
  
        // Reemplazar el valor actual del fileId con el nuevo valor
        const newFileIdLine = `export const fileId = "${this.fileId}";`;
        fieldContent = fieldContent.replace(`export const fileId = "${currentFileId}";`, newFileIdLine);
      }
  
      // Escribir el contenido actualizado de nuevo al archivo
      fs.writeFileSync(fieldPath, fieldContent, 'utf8');
  
      console.log(this.fileId);
    } catch (ex) {
      throw ex;
    }
  }
  

  async createFineTune() {
    try {
      // Realizamos una solicitud de ajuste fino utilizando el archivo de entrenamiento y el modelo definido
      const response = await this.openai.createFineTune({
        training_file: this.fileId,
        model: this.fineTuneModel,
      });
      const { data } = response;
      return data;
    } catch (ex) {
      throw ex;
    }
  }

  async listFineTunes() {
    try {
      // Listamos los modelos de ajuste fino
      const response = await this.openai.listFineTunes();
      const { data } = response;
      return data;
    } catch (ex) {
      throw ex;
    }
  }

  async createCompletion(prompt) {
    try {
      // Creamos una solicitud de completación al modelo definido
      const response = await this.openai.createCompletion({
        model: this.fineTuneModel,
        prompt,
        max_tokens : this.MAX_TOKEN
      });
      // Verificamos si existe la propiedad 'choices' en la respuesta
      const {data} = response;
      const {choices} = data;

      if (choices) {
        return choices
      }
    } catch (ex) {
      throw ex;
    }
  }
}

module.exports = FineTuneModel; 