require('dotenv').config(); 
const FineTuneModel = require('../FineTuneModel');
const {OPENAI_KEY, FINE_TUNE_MODEL} = process.env

const TestModel = async() => {
    try {
        const trainingModel = new FineTuneModel('ada:ft-personal-2023-08-11-17-23-29', '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');
        await trainingModel.upload();
        const fineTune = await trainingModel.createFineTune();
        const listFine = await trainingModel.listFineTunes();
        const response = await trainingModel.createCompletion("Que son los hidrocarburos");
        console.log(response)
    } catch (ex) {
        console.log(ex)
    }
}  

TestModel()