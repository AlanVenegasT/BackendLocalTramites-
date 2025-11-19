const express = require('express');
const cors = require('cors');
const { dbConnection } = require('../database/config.js'); 
const cookieParser = require('cookie-parser');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8080; // Puerto por defecto 8080
        this.usuariosPath = '/api/usuarios';
        this.authPath = '/api/auth';
        this.chatgp3Path = '/api/chatgp3';
        this.tramiteControllerPath = '/api/tramiteController';
        this.proyectoPath = '/api/proyecto';
        this.pdfPath = '/api/pdf';
        this.recomendacionPath = '/api/recomendacion';

        // Conectar a base de datos
        this.conectarDB();

        // Middlewares
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();
    }

    async conectarDB() {
        await dbConnection();
    }

    // Middleware de CORS y otros middlewares
    middlewares() {
        // const whitelist = [process.env.CORS]; //https://generadordc3.com

        // const corsOptions = {
        //     origin: function (origin, callback) {
        //         if (whitelist.includes(origin) || !origin) {
        //             // Permitir el acceso desde el origen de la solicitud o si no se proporciona un origen (para peticiones locales)
        //             callback(null, true);
        //         } else {
        //             // Configurar una respuesta con código 403 Forbidden para rechazar las solicitudes no permitidas
        //             const error = new Error("Acceso no permitido desde este origen");
        //             error.status = 403;
        //             callback(error);
        //         }
        //     },
        //     credentials: true, // Permitir el envío de credenciales (por ejemplo, cookies) desde el cliente
        // };

        // // CORS
        // this.app.use(cors(corsOptions));
        const corsOptions = {
            origin: function (origin, callback) {
                // Permitir todo mientras desarrollas
                callback(null, true);
            },
            credentials: true,
        };
        this.app.use(cors(corsOptions));

        // Cookies 
        this.app.use(cookieParser());

        // Lectura y parseo del body
        this.app.use(express.json());

        // Se hace la llamada al directorio público
        this.app.use(express.static('public'));

    }

    // Definición de las rutas
    routes() {
        // Vamos a usar un middleware para otorgarle ciertas rutas
        // Contiene middleware se llama al archivo donde tenemos las rutas
        this.app.use(this.authPath, require('../routes/authRoutes.js'));
        this.app.use(this.usuariosPath, require('../routes/usuarios.js'));
        this.app.use(this.chatgp3Path, require('../routes/chatgp3Routes.js'));
        this.app.use(this.tramiteControllerPath, require('../routes/tramiteRoutes.js'));
        this.app.use(this.proyectoPath, require('../routes/proyectoRoutes.js'));
        this.app.use(this.pdfPath, require('../routes/pdfRoutes.js'));
        this.app.use(this.recomendacionPath, require('../routes/recomendacionRoutes.js'))


        // Middleware para manejar rutas no reconocidas
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Ruta no encontrada' });
        });
    }

    // Método para iniciar el servidor
    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }
}

module.exports = Server;
