require('dotenv').config();
//Tenemos que mandar a llamar el server sino no nos agarra
const Server = require('./models/server');

//Creamos una instancia para poder lanzar el listen que es donde tenemos el puerto sino no nos agarra
const server = new Server();
//Aqui extraemos el puerto.
server.listen();





