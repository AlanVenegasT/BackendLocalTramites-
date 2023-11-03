const puppeteer = require('puppeteer');
const ResponseError = require('../utils/ResponseError');
const mongoose = require('mongoose');
const Tramite = require('../models/tramite');
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { S3 } = require("@aws-sdk/client-s3");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage })
const pdfS = upload.single('archivo');
const pdf = require('html-pdf');
const fs = require('fs');


const s3Client = new S3({
    forcePathStyle: false,
    endpoint: process.env.S3_ENDPOINT, // Cambia la URL del endpoint
    region: process.env.REGION_DO,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});


const generarPdf = async (req, res) => {

    let tramite = null;
    let uploadResult = null;
    let pdfUrl = null;

    const { id } = req.params;
    if (!id) {
        const response = new ResponseError(
            'fail',
            'Id del tramite no existe',
            'Ingresa por favor el ID del trámite',
            []
        ).responseApiError();
        return res.status(400).json(response);
    }

    if (!mongoose.isValidObjectId(id)) {
        const response = new ResponseError(
            'fail',
            'ID inválido',
            'El ID proporcionado no es válido en la Base de Datos',
            []
        ).responseApiError();
        return res.status(400).json(response);
    }

    try {
        tramite = await Tramite.findOne({ _id: id });
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'Error el Trámite no se encontró, ingrese un ID válido',
            ex.message,
            []).responseApiError();

        res.status(404).json(response);
    }
    
    const contadorTramites = tramite.contadorTramites || null;
    const autoridad = tramite.tramites[18]?.valor || null;
    const revision = tramite.tramites[37]?.valor || null;
    const tramite24 = tramite.tramites[24]?.valor || null;
    const tipo = tramite.tramites[0]?.valor || null;
    const regulacion = tramite.tramites[15]?.valor || null;
    const homoclave = tramite.tramites[26]?.valor || null;
    const formato = tramite.tramites[27]?.valor || null;
    const generaResolucion = tramite.tramites[31]?.valor || null;
    const resolucion = tramite.tramites[45]?.valor || null;
    const plazoPresentar = tramite.tramites[30]?.valor || null;
    const fechaIngreso = tramite.tramites[38]?.valor || null;
    const fechamaximaResolucion = tramite.tramites[39]?.valor || null;
    const fechaminimaResolucion = tramite.tramites[40]?.valor || null;
    const plazoPrevencion = tramite.tramites[41]?.valor || null;
    const plazorespuestaPrevencion = tramite.tramites[42]?.valor || null;
    const plazorespuestaAutoridad = tramite.tramites[43]?.valor || null;
    const plazomaximoRespuesta = tramite.tramites[44]?.valor || null;
    const montoderechosAprovechamientos = tramite.tramites[33]?.valor || null;
    const nombreAprovechamiento = tramite.tramites[34]?.valor || null;
    const monto = tramite.tramites[35]?.valor || null;
    const detonante = tramite.tramites[19]?.valor || null;
    const presentacion = tramite.tramites[23]?.valor || null;
    const articulos = tramite.tramites[17]?.valor || null;
    const periodicidad = tramite.tramites[29]?.valor || null;
    const regulacionLink = tramite.tramites[46]?.valor || null;
    const referencia =  tramite.tramites[47]?.valor || null;
    const comentarios = tramite.tramites[36]?.valor || null;
    const requisitos  = tramite.tramites[48].valor || null;

    const htmlContent = `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
            <style>
            * {
                font-family: Arial, sans-serif;
            }
    
            body {
                
                font-family: Arial, sans-serif;
            }
    
            p {
                margin: 0;
                padding: 4px 0px 4px 3px; 
    
            }
    
            .header {
                display: flex;
                width: 99%;
                align-items: center;
                border: 1px solid #000;
            }
            </style>
        </head>
    
    
        <body>
        <div style="display: flex; flex-direction: row; align-items: center; width: 99%; border: 1px solid transparent; font-size: 10px;">
            <div style="flex-basis: 33.3%;  ">
                <img width="45%" style="padding-left: 4px;" src="https://iktanstrategies.com/LogoStrategies.png" />
            </div>
    
            <div style="flex-basis: 36.7%; line-height: 0px;  ">
                <h1> Tramite Petrolero </h1>
            </div>
    
            <div style="flex-basis: 30%; display: flex; flex-direction: column; width: 100%; height: 100%; ">
                <div style="flex-basis: 33%; display: flex; flex-direction: row; width: 99%; border-bottom: 1px solid white; height: 33.3%;">
                    <p style="flex-basis: 50%; border-left: 1px solid white; background-color: #D9D9D9; "> Id: </p>
                    <p style="flex-basis: 50%; border-left: 1px solid white; background-color: #f3f3f3;"> ${contadorTramites} </p>
                </div>
                <div style="flex-basis: 33%; display: flex; flex-direction: row; width: 99%; border-bottom: 1px solid white; height: 33.3%;">
                    <p style="flex-basis: 50%; border-left: 1px solid white; background-color: #D9D9D9;"> Autoridad: </p>
                    <p style="flex-basis: 50%; border-left: 1px solid white; background-color: #f3f3f3;"> ${autoridad} </p>
                </div>
                <div style="flex-basis: 33%; display: flex; flex-direction: row; width: 99% ; height: 33.3%;">
                    <p style="flex-basis: 50%; border-left: 1px solid white; background-color: #D9D9D9;" > Revisión: </p>
                    <p style="flex-basis: 50%; border-left: 1px solid white; background-color: #f3f3f3;"> ${revision} </p>
                </div>
            </div>
        </div>
    
        <div style="margin-top: 20px;">
            <div style="display: flex; flex-direction: row; width: 99%; font-size: 10px; border: 1px solid white; ">
                <p style="flex-basis: 15%; border-right: 1px solid white; background-color: #D9D9D9;">Trámite: </p>
                <p style="flex-basis: 55%; border-right: 1px solid white; background-color: #f3f3f3;">${tramite24}</p>
                <p style="flex-basis: 15%; border-right: 1px solid white; background-color: #D9D9D9;">Tipo:</p>
                <p style="flex-basis: 15%; background-color: #f3f3f3;">${tipo}</p>
            </div>
        </div>
    
        <div>
            <div style="display: flex; flex-direction: row; width: 99%; font-size: 10px; border: 1px solid white; border-top: none; ">
                <p style="flex-basis: 15%; border-right: 1px solid white; background-color: #D9D9D9;">Regulación: </p>
                <p style="flex-basis: 55%; border-right: 1px solid white; background-color: #f3f3f3;">${regulacion}</p>
                <p style="flex-basis: 15%; border-right: 1px solid white; background-color: #D9D9D9;"> Homoclave:</p>
                <p style="flex-basis: 15%; background-color: #f3f3f3;">${homoclave} </p>
            </div>
        </div>
    
        <div>
            <div style="display: flex; flex-direction: row; width: 99%; font-size: 10px; border: 1px solid transparent; border-top: none; ">
                <p style="flex-basis: 15%; border-right: 1px solid white; background-color: #D9D9D9;">Formato: </p>
                <p style="flex-basis: 55%; border-right: 1px solid white; background-color: #f3f3f3;">${formato}</p>
                <p style="flex-basis: 15%; border-right: 1px solid white; background-color: #D9D9D9;"></p>
                <p style="flex-basis: 15%; background-color: #f3f3f3;"> </p>
            </div>
        </div>
    
    
        <div style="display: flex; flex-direction: row; width: 99%; align-items: center; border: 1px solid white;
        font-size: 10px; margin-top: 20px;">
            <div style="display: flex; flex-basis: 50%; flex-direction: row; width: 50%; ">
                <p style="flex-basis: 50%; border-right: 1px solid white; background-color: #D9D9D9;">¿Genera Resolución?</p>
                <p style="flex-basis: 50%; border-right: 1px solid white; background-color: #f3f3f3;">${generaResolucion}</p>
            </div>
    
            <div style="display: flex; flex-basis: 50%; flex-direction: row; width: 50%;">
                <p style="flex-basis: 50%; border-right: 1px solid white; background-color: #D9D9D9;">Resolucion: </p>
                <p style="flex-basis: 50%; background-color: #f3f3f3;">${resolucion}</p>
            </div>
        </div>
    
        <div style="display: flex; flex-direction: row; width: 99%; font-size: 10px; border: 1px solid white; border-top: none;">
            <p style="flex-basis: 25%; border-right: 1px solid white; background-color: #D9D9D9;">Plazo para presentar </p>
            <p style="flex-basis: 75%; background-color: #f3f3f3;">${plazoPresentar}</p>
        </div>
    
        <div style="display: flex; flex-direction: row; align-items: center; width: 99%;  border: 1px solid white; font-size: 10px; border-top: none; height: 100px; ">  
            <div style="flex-basis: 25%; display: flex; flex-direction: column; width: 100%; height: 100%; ">
                <div style="flex-basis: 50%; display: flex; flex-direction: row; width: 100%; border-bottom: 1px solid white; height: 50%;">
                    <p style="flex-basis: 50%; background-color: #D9D9D9; "> Sujeto a Respuesta </p>
                    <p style="flex-basis: 50%; border-left: 1px solid white; border-right: 1px solid white; background-color: #f3f3f3; "> ${generaResolucion} </p>
                </div>
                <!-- <div style="flex-basis: 33%; display: flex; flex-direction: row; width: 99%; border-bottom: 1px solid #000; height: 12%;">
                    <p style="flex-basis: 50%; background-color: #D9D9D9;"> Fecha de Ingreso </p>
                    <p style="flex-basis: 50%; border-left: 1px solid #000; border-right: 1px solid #000;"> ${fechaIngreso} </p>
                </div> -->
                <!-- <div style="flex-basis: 33%; display: flex; flex-direction: row; width: 99%; border-bottom: 1px solid #000; height: 12%;">
                    <p style="flex-basis: 50%; background-color: #D9D9D9;" > Fecha Maxima de Resolución </p>
                    <p style="flex-basis: 50%; border-left: 1px solid #000; border-right: 1px solid #000;"> ${fechamaximaResolucion} </p>
                </div> -->
                <!-- <div style="flex-basis: 33%; display: flex; flex-direction: row; width: 99%; border-bottom: 1px solid #000; height: 12%;">
                    <p style="flex-basis: 50%; background-color: #D9D9D9; "> Fecha Minima de Resolución </p>
                    <p style="flex-basis: 50%; border-left: 1px solid #000; border-right: 1px solid #000; "> ${fechaminimaResolucion} </p>
                </div> -->
                <div style="flex-basis: 50%; display: flex; flex-direction: row; width: 100%; border-bottom: 1px solid white; height: 50%;">
                    <p style="flex-basis: 50%; background-color: #D9D9D9; "> Plazo de Prevención </p>
                    <p style="flex-basis: 50%; border-left: 1px solid white; border-right: 1px solid white; background-color: #f3f3f3; "> ${plazoPrevencion} </p>
                </div>
                
            </div>
    
            <div style="flex-basis: 25%; display: flex; flex-direction: column; width: 100%; height: 100%;   ">
                <div style="flex-basis: 50%; display: flex; flex-direction: row; width: 100%; border-bottom: 1px solid white; height: 50%;">
                    <p style="flex-basis: 50%; background-color: #D9D9D9;  "> Plazo para respuesta a Prevención </p>
                    <p style="flex-basis: 50%; border-left: 1px solid white; border-right: 1px solid white; background-color: #f3f3f3;"> ${plazorespuestaPrevencion} </p>
                </div>
                <div style="flex-basis: 50%; display: flex; flex-direction: row; width: 100%; border-bottom: 1px solid white; height: 50%;">
                    <p style="flex-basis: 50%; background-color: #D9D9D9; "> Plazo de Respuesta de la Autoridad </p>
                    <p style="flex-basis: 50%; border-left: 1px solid white; border-right: 1px solid white; background-color: #f3f3f3;"> ${plazorespuestaAutoridad} </p>
                </div>
                
            </div>
    
            <div style="flex-basis: 25%; display: flex; flex-direction: column; width: 100%; height: 100%;">
                <div style="flex-basis: 50%; display: flex; flex-direction: row; width: 100%; border-bottom: 1px solid white; height: 50%;">
                    <p style="flex-basis: 50%; background-color: #D9D9D9; "> Plazo Máximo de Respuesta </p>
                    <p style="flex-basis: 50%; border-left: 1px solid white; border-right: 1px solid white; background-color: #f3f3f3; "> ${plazomaximoRespuesta} </p>
                </div>
                <div style="flex-basis: 50%; display: flex; flex-direction: row; width: 100%; border-bottom: 1px solid white; height: 50%;">
                    <p style="flex-basis: 50%; border-left: 1px solid white; background-color: #D9D9D9; "> Tiene Monto de derechos o aprovechamientos </p>
                    <p style="flex-basis: 50%; border-left: 1px solid white; background-color: #f3f3f3; "> ${montoderechosAprovechamientos}  </p>
                </div>
            </div>
    
            <div style="flex-basis: 25%; display: flex; flex-direction: column; width: 100%; height: 100%; ">
                <!-- <div style="flex-basis: 33%; display: flex; flex-direction: row; width: 99%; border-bottom: 1px solid #000; height: 12%;">
                    <p style="flex-basis: 50%; border-left: 1px solid #000; background-color: #D9D9D9;"> Nombre del Aprovechamiento </p>
                    <p style="flex-basis: 50%; border-left: 1px solid #000; "> ${nombreAprovechamiento} </p>
                </div> -->
                <div style="flex-basis: 50%; display: flex; flex-direction: row; width: 100% ; border-bottom: 1px solid white; height: 50%;">
                    <p style="flex-basis: 50%; border-left: 1px solid white; background-color: #D9D9D9;" > Monto mxn 2020 </p>
                    <p style="flex-basis: 50%; border-left: 1px solid white; background-color: #f3f3f3;"> ${monto} </p>
                </div>
                <div style="flex-basis: 50%; display: flex; flex-direction: row; width: 100%; border-bottom: 1px solid white; height: 50%;">
                    <p style="flex-basis: 50%; border-left: 1px solid white; background-color: #D9D9D9; ">  </p>
                    <p style="flex-basis: 50%; border-left: 1px solid white; background-color: #f3f3f3; ">  </p>
                </div>
                
    
            </div>
        </div>          
    
        <div style="width: 99%; background-color: #D9D9D9; height: 2px; margin-top: 5px; margin-bottom: 5px;">
    
        </div>
        
    
    
        <div style="display: flex; width: 99%; justify-content: center; align-items: center;">
            <img style="width: 99%;"  src="https://pdftramites.nyc3.digitaloceanspaces.com/ImagenesPDF/Etapas%20Contractuales.png" alt="Aqui va la imagen" >
        </div>
    
        <div style="margin-top: 20px;">
            <div style="display: flex; flex-direction: row; width: 99%; font-size: 10px; border: 1px solid white; ">
                <p style="flex-basis: 15%; border-right: 1px solid white; background-color: #D9D9D9;">Detonante: </p>
                <p style="flex-basis: 56%; border-right: 1px solid white; background-color: #f3f3f3;">${detonante}</p>
                <p style="flex-basis: 14%; border-right: 1px solid white; background-color: #D9D9D9;">Presentación: </p>
                <p style="flex-basis: 15%; background-color: #f3f3f3;">${presentacion}</p>
            </div>
        </div>
    
        <div>
            <div style="display: flex; flex-direction: row; width: 99%; font-size: 10px; border: 1px solid white; border-top: none; ">
                <p style="flex-basis: 15%; border-right: 1px solid white; background-color: #D9D9D9;">Articulos: </p>
                <p style="flex-basis: 56%; border-right: 1px solid white; background-color: #f3f3f3;">${articulos}</p>
                <p style="flex-basis: 14%; border-right: 1px solid white; background-color: #D9D9D9;">Periodicidad: </p>
                <p style="flex-basis: 15%; background-color: #f3f3f3;">${periodicidad}</p>
            </div>
        </div>
    
        <div>
            <div style="display: flex; flex-direction: row; width: 99%; font-size: 10px; border: 1px solid white; border-top: none; ">
                <p style="flex-basis: 15%; border-right: 1px solid white; background-color: #D9D9D9;"> Regulacion (link): </p>
                <p style="flex-basis: 56%; border-right: 1px solid white; background-color: #f3f3f3;">${regulacionLink}</p>
                <p style="flex-basis: 14%; border-right: 1px solid white; background-color: #D9D9D9;"> </p>
                <p style="flex-basis: 15%;  background-color: #f3f3f3;"></p>
            </div>
        </div>
    
        <div>
            <div style="display: flex; flex-direction: row; width: 99%; font-size: 10px; border: 1px solid white; border-top: none; ">
                <p style="flex-basis: 15%; border-right: 1px solid white; background-color: #D9D9D9;">Referencia: </p>
                <p style="flex-basis: 56%; border-right: 1px solid white; background-color: #f3f3f3;">${referencia}</p>
                <p style="flex-basis: 14%; border-right: 1px solid white; background-color: #D9D9D9;"></p>
                <p style="flex-basis: 15%;  background-color: #f3f3f3;"></p>
            </div>
        </div>
    
        <div>
            <div style="display: flex; flex-direction: row; width: 99%; font-size: 10px; border: 1px solid white; border-top: none; ">
                <p style="flex-basis: 15%; border-right: 1px solid white; background-color: #D9D9D9;">Comentarios: </p>
                <p style="flex-basis: 56%; border-right: 1px solid white; background-color: #f3f3f3;">${comentarios}</p>
                <p style="flex-basis: 14%; border-right: 1px solid white; background-color: #D9D9D9;"> </p>
                <p style="flex-basis: 15%; background-color: #f3f3f3;"> </p>
            </div>
        </div>
    
        <div>
            <div style="display: flex; flex-direction: row; width: 99%; font-size: 10px; border: 1px solid white; border-top: none; ">
                <p style="flex-basis: 15%; border-right: 1px solid white; background-color: #D9D9D9;">Requisitos: </p>
                <p style="flex-basis: 56%; border-right: 1px solid white; background-color: #f3f3f3;">${requisitos}</p>
                <p style="flex-basis: 14%; border-right: 1px solid white; background-color: #D9D9D9;"></p>
                <p style="flex-basis: 15%; background-color: #f3f3f3;"> </p>
            </div>
        </div>
    
    
    </body>
    </html>
    `;

    pdf.create(htmlContent, {
        childProcessOptions: {
            env: {
              OPENSSL_CONF: '/dev/null',
            },
          }
    }).toBuffer(async (err, pdfBuffer) => {

        if (err) {
            const response = new ResponseError(
                'fail',
                'Error al generar el PDF desde HTML',
                err.message,
                []
            ).responseApiError();
            return res.status(500).json(response);
        }

        const uploadParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: `PDFTramites/archivo-${id}.pdf`,
            Body: pdfBuffer,
            ACL: 'public-read',
        };

        try {
            uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
            console.log(uploadResult);
            
        } catch (ex) {
            const response = new ResponseError(
                'fail',
                'Error al subir el archivo a Digital Ocean',
                ex.message,
                []
            ).responseApiError();

            res.status(500).json(response);
        }

        try {
            pdfUrl = `https://${process.env.BUCKET_NAME}.${process.env.S3_ENDPOINT_SINHTTP}/PDFTramites/archivo-${id}.pdf`;
        } catch (ex) {
            const response = new ResponseError(
                'fail',
                'Error al Generar el URL del PDF',
                ex.message,
                []
            ).responseApiError();

            res.status(500).json(response);
        }

        if (tramite.reporte.length > 0) {
            tramite.reporte[0].url = pdfUrl;
            tramite.reporte[0].key = `archivo-${id}.pdf`;
        } else {
            tramite.reporte.push({
                url: pdfUrl,
                key: `archivo-${id}.pdf`,
            });
        }

        try {
            await tramite.save();
        } catch (ex) {
            const response = new ResponseError(
                'fail',
                'Error al guardar el trámite',
                ex.message,
                []
            ).responseApiError();

            res.status(500).json(response);
        }

        res.status(200).json({
            status: 'successful',
            message: 'PDF generado y guardado en carpeta.',
            url: pdfUrl,
        });
    });
};

const entrenamiendoNube = async (req, res) => {
    // Verificamos si se ha enviado un archivo

    if (!req.file) {
        const response = new ResponseError(
            'fail',
            'No hay archivos que subir',
            'No se ha cargado ningun archivo, porfavor carga un archivo',
            []).responseApiError();

        return res.status(400).json(
            response
        )
    }

    const archivo = req.file;
    const nombreCortado = archivo.originalname.split('.');
    const extension = nombreCortado[nombreCortado.length - 1];

    // Validar la extensión
    const extensionesValidas = ['pdf'];
    if (!extensionesValidas.includes(extension)) {

        const response = new ResponseError(
            'fail',
            `La extensión ${extension} no es permitida, las extensiones permitidas son: ${extensionesValidas.join(', ')}`,
            'La extencion con la que se cargo el archivo no es valida, coloca la correcta porfavor',
            []).responseApiError();

        return res.status(400).json(
            response
        )
    }

    // Parámetros para cargar el archivo en el depósito
    const uploadParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: `EntrenamientoIA/${archivo.originalname}.pdf`,
        Body: archivo.buffer,
        ACL: 'public-read',
    };


    try {
        const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));

        res.status(200).json({
            status: 'successful',
            message: 'El archivo se Subio Correctamente'
        })
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'Error al subir el archivo a Digital Ocean',
            ex.message,
            []).responseApiError();

        res.status(500).json(
            response
        )
    }
};



module.exports = {
    entrenamiendoNube,
    generarPdf,
    pdfS
};
