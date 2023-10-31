
const Tramite = require('../models/tramite')
const xlsx = require('xlsx');
const ResponseError = require('../utils/ResponseError')
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage})
const excel =  upload.single('archivo');
const FuzzySearch = require('fuzzy-search');
const { S3 } = require( "@aws-sdk/client-s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const mongoose = require('mongoose');

const s3Client = new S3({
  forcePathStyle: false,
  endpoint: process.env.S3_ENDPOINT , // Cambia la URL del endpoint
  region: process.env.REGION_DO,
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


const actualizarTramite = async (req, res) => {
  const { id } = req.params;
  const nuevosTramites = req.body.tramites;

  let tramite = null;

  if (!mongoose.isValidObjectId(id)) {
    const response = new ResponseError(
      'fail',
      'ID inválido',
      'El ID proporcionado no es válido',
      []
    ).responseApiError();

    return res.status(400).json(response);
  }

  try {
    tramite = await Tramite.findOne({ _id: id });
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'Error al realizar la busqueda en la BD',
      ex.message,
      []).responseApiError();

    res.status(404).json(
      response
    )
  }
  
    if (!tramite) {
      const response = new ResponseError(
        'fail',
        'Tramite no encontrado',
        'No hay ningun tramite, porfavor asigna un tramite existente',
        []).responseApiError();
  
      return res.status(404).json(
        response
      )
    }

    const tramiteActualizado = tramite.toObject(); // Convertir a objeto JavaScript
    tramiteActualizado.tramites = tramiteActualizado.tramites.map(
      (tramiteAnterior, index) => {
        const nuevoTramite = nuevosTramites[index];
        return {
          ...tramiteAnterior,
          nombre: nuevoTramite.nombre,
          valor: nuevoTramite.valor
        };
      }
    );

  try {
    const tramiteActualizadoDB = await Tramite.findOneAndUpdate(
      { _id: id },
      tramiteActualizado,
      { new: true }
    );
    res.status(200).json({
      status: 'successful',
      data: tramiteActualizadoDB,
      message: 'El tramite se ha actualizado'
    });
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'Error al actualizar el tramite',
      ex.message,
      []).responseApiError();
    
    res.status(500).json(
      response
    )
  }
};

const borrarTramite = async (req, res) => {
  const { id } = req.params;

  let tramite = null;

  // Validar si el ID es un ObjectId válido de MongoDB
  if (!mongoose.isValidObjectId(id)) {
    const response = new ResponseError(
      'fail',
      'ID inválido',
      'El ID proporcionado no es válido',
      []
    ).responseApiError();

    return res.status(400).json(response);
  }

  try {
    tramite = await Tramite.findOne({ _id: id });    
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'Error al realizar la busqueda en la BD',
      ex.message,
      []).responseApiError();

    res.status(404).json(
      response
    )
  }

  if (!tramite) {
    const response = new ResponseError(
      'fail',
      'Tramite no encontrado',
      'No hay ningun tramite, porfavor asigna un tramite existente',
      []).responseApiError();

    return res.status(404).json(
      response
    )
  }

  try {
    tramite.tramites = tramite.tramites.filter((t) => t._id.toString() !== id);
    // Guardar los cambios utilizando la función `updateOne` de Mongoose
    await Tramite.deleteOne({ _id: id }, { tramites: tramite.tramites });
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'Error al eliminar el tramite',
      ex.message,
    []).responseApiError();

    res.status(500).json(
      response
    )
  }

    //BORRAR EL PDF DEL DIGITAL OCEAN 
    // Parámetros para cargar el archivo en el depósito
    const uploadParams = {
      Bucket: process.env.BUCKET_NAME ,
      Key: `PDFTramites/archivo-${id}.pdf`
    };

  try {
      const uploadResult = await s3Client.send( new DeleteObjectCommand(uploadParams));
    
    res.status(200).json({ 
      status: 'success',
      message: 'Tramite eliminado correctamente' });

  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'Error al Eliminar el PDF del Tramite Seleccionado',
      ex.message,
      []).responseApiError();
    
    res.status(500).json(
      response
    )
  }
};

const borrarAllTramite = async (req, res) => {

  let tramites = null;

  try {
    tramites = await Tramite.find();
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'No se encontro ningun trámite',
      ex.message,
      []).responseApiError();
    res.status(500).json(
      response
    )
  }
  

  if (tramites.length === 0) {
    const response = new ResponseError(
      'fail',
      'No existe ningún trámite',
      'No se encuentra ningun trámite, porfavor revisa la busqueda',
      []).responseApiError();

    return res.status(404).json(
      response
    )
  }

  try {
    
    await Tramite.deleteMany();

    res.status(200).json({
      status: 'successful',
      message: 'Se han eliminado todos los trámites'
    });
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'Error al eliminar todos los trámites',
      ex.message,
      []).responseApiError();

    res.status(500).json(
      response
    ) 
  }
};

// Importa la función para escapar caracteres especiales en expresiones regulares
const escapeRegExp = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

//Lo busca por Id
const buscarTramite = async (req, res) => {
  const { nombre, id, valor, page, limit } = req.query;

  // Creamos un objeto de consulta
  const query = {};

  // Si el parámetro 'nombre' está presente en la consulta, agregamos una expresión de búsqueda para el campo 'nombre' del array 'tramites'
  if (nombre) {
    const regexNombre = new RegExp(escapeRegExp(nombre), 'i');
    query['tramites.nombre'] = regexNombre;
  
  }

  // Si el parámetro 'valor' está presente en la consulta, agregamos una expresión de búsqueda para el campo 'valor' del array 'tramites'
  if (valor) {
    const regexValor = new RegExp(escapeRegExp(valor), 'i');
    query['tramites.valor'] = regexValor;
   
  }

  if (id) {
    query['_id'] = id; // Asignamos el valor del parámetro 'id' a la consulta para buscar el trámite por su _id específico
  }

  // Convertir los parámetros de paginación y límite a números enteros
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10; // Si no se proporciona 'limit', se asume un límite predeterminado de 10 registros por página

  // Calcular el número de registros para omitir y paginar correctamente los resultados
  const skip = (pageNumber - 1) * limitNumber;

  try {
    const tramites = await Tramite.find(query)
      .skip(skip)
      .limit(limitNumber);

    if (tramites.length === 0) {
      // Realizar una búsqueda difusa si no se encontraron resultados exactos
      const allTramites = await Tramite.find();
      const searcher = new FuzzySearch(allTramites, ['nombre'], {
        caseSensitive: false, // Considerar la búsqueda sin distinción entre mayúsculas y minúsculas
        sort: true, // Ordenar los resultados por similitud
      });

      const fuzzyResults = searcher.search(nombre);

      if (fuzzyResults.length === 0) {
        const response = new ResponseError(
          'fail',
          'No se encontraron trámites que coincidan con los criterios de búsqueda.',
          'No hay coincidencias de la busqueda',
          []).responseApiError();
        return res.status(404).json(
          response
        )
      } else {
        res.status(200).json({
          status: 'successful',
          data: fuzzyResults,
          message: 'Búsqueda Exitosa (difusa)',
        });
      }
    } else {
      // Si se encontraron resultados exactos, enviar los resultados
      res.status(200).json({
        status: 'successful',
        data: tramites,
        message: 'Búsqueda Exitosa',
      });
    }
  } catch (ex) {
    const response = new ResponseError('fail', 'Error al buscar el trámite', ex.message, []).responseApiError();

    res.status(500).json(response);
  }
};                        

// Función para capitalizar el campo "nombre"
const capitalizeName = (name) => {
  // Convertir toda la cadena a minúsculas
  const nameLower = name.toLowerCase();
  
  // Usar una función para capitalizar la primera letra de cada palabra
  const capitalizedWords = nameLower.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1));
  
  // Unir las palabras capitalizadas para formar el campo "nombre" capitalizado
  const capitalizedName = capitalizedWords.join(' ');

  return capitalizedName;
};

//Ya nada mas lee el archivo
const cargarTramite = async (req, res) => {
  
  // Verificamos si se ha enviado un archivo
  if (!req.file ) {
    const response = new ResponseError(
      'fail',
      'No hay archivos que subir',
      'No se ha cargado ningun archivo, porfavor carga un archivo',
      []).responseApiError();
    
    return res.status(400).json(
      response
    )
  }

  const  archivo  = req.file;
  const nombreCortado = archivo.originalname.split('.');
  const extension = nombreCortado[nombreCortado.length - 1];

  // Validar la extensión
  const extensionesValidas = ['xlsx'];
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

  try {
  // Leer el archivo a través del buffer
  const workbook = xlsx.read(archivo.buffer, { type: 'buffer' });

  const sheetName = workbook.SheetNames[0];
 
  const worksheet = workbook.Sheets[sheetName];
 

  // Convertir los datos a JSON incluyendo celdas vacías con valor null
  const jsonData = xlsx.utils.sheet_to_json(worksheet, {
    raw: false,
    defval: null,
  });
  // Procesar los datos (limpiar espacios) y guardarlos en el arreglo tramites
  const tramites = [];
  for (const row of jsonData) {
    const tramite = []; // Crear un nuevo arreglo para cada fila
    const keys = Object.keys(row);
    for (const key of keys) {
      let value = row[key];
      // Convertir el valor a una cadena de texto antes de usar 'trim()'
      value = String(value);
      const cleanValue = value.trim() !== '' ? value.trim() : null; // Si está vacío, asignar null

      // Verificar que el campo nombre tenga un valor antes de agregarlo al arreglo tramite
      if (key.trim() !== '') {
        const nombreCapitalizado = capitalizeName(key); // Capitalizar el campo "nombre"
        tramite.push({ nombre: nombreCapitalizado, valor: cleanValue });
      }
    }
    // Agregar el arreglo de la fila al arreglo principal tramites
    tramites.push(tramite);
  }

   // Obtener el último valor del contador de tramites
   const lastTramite = await Tramite.findOne().sort({ contadorTramites: -1 });
   let contadorTramites = 1; // Si no hay tramites en la base de datos, el contador inicia en 1

   if (lastTramite) {
     contadorTramites = lastTramite.contadorTramites + 1;
   }

  // Crear un documento de Tramite con los datos procesados y guardarlo en la base de datos
  for (const tramite of tramites) {
    try {
      const nuevoTramite = new Tramite({
        tramites: tramite,
        contadorTramites, // Agregamos el contador actualizado al nuevo tramite
      });
      await nuevoTramite.save();
      contadorTramites++;
    } catch (ex) {
      
      const response = new ResponseError(
        'fail',
        'Error al guardar el tramite',
        ex.message,
        []).responseApiError();

      res.status(500).json(
        response
      )
      // Aquí puedes decidir cómo manejar los errores al guardar cada trámite
    }
  }

  res.status(200).json({
    status: 'successful',
    data: tramites,
    message: 'Se Cargaron Correctamente los Tramites',
  });

} catch (ex) {

  const response = new ResponseError(
    'fail',
    'Error al cargar el trámite',
    ex.message,
    []).responseApiError();

  res.status(500).json(
    response
  )
}
};

const crearTramite = async (req, res) => {
  try {
    // Obtener el último valor del contador de tramites
    const lastTramite = await Tramite.findOne().sort({ contadorTramites: -1 });
    let contadorTramites = 1; // Si no hay tramites en la base de datos, el contador inicia en 1

    if (lastTramite) {
      contadorTramites = lastTramite.contadorTramites + 1;
    }

    // Crear el nuevo tramite con el contador actualizado
    const tramite = new Tramite({
      tramites: req.body.tramites,
      contadorTramites,
    });

    // Guardar el nuevo tramite en la base de datos
    const response = await tramite.save();
    res.status(200).json({
      status: "successful",
      data: response,
      message: 'Tramite Creado Correctamente'
    });
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'Error al crear el trámite',
      ex.message,
      []).responseApiError();

    res.status(500).json(response);
  }
};

const mostrarTramite = async (req, res) => {
  
    // Obtener los valores de page y limit del query string (si no se proporcionan, se utilizarán valores predeterminados)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Por ejemplo, 10 registros por página
    // Calcular el número de documentos que se deben omitir antes de mostrar los registros de la página actual
    const skip = (page - 1) * limit;

    try {
    // Realizar la consulta a la base de datos con el paginado
    const tramite = await Tramite.find().skip(skip).limit(limit);
 
    res.status(200).json({
      status: "successful",
      data: tramite,
      message: 'Registros Encontrados'
    });
  } catch (ex) {

    const response = new ResponseError(
      'fail',
      'Error al mostrar los registros',
      ex.message,
      []).responseApiError();

    res.status(500).json(
      response
    )
  }
};

const mostrarTramitesTodo = async (req, res) =>{

  try {
    // Realizar la consulta a la base de datos con el paginado
    const tramite = await Tramite.find();
    res.status(200).json({
      status: "successful",
      data: tramite,
      message: 'Registros Encontrados'
    });
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'Error al mostrar los tramites',
      ex.message,
      []).responseApiError();

    res.status(500).json(
      response
    )
  }
}

module.exports = {
  actualizarTramite,
  borrarTramite,
  borrarAllTramite,
  buscarTramite,
  cargarTramite,
  crearTramite,
  mostrarTramite,
  mostrarTramitesTodo,
  excel,

}