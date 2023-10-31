const Recomendacion = require("../models/recomendacion");
const stringSimilarity = require("string-similarity");

const imprimeCategoria = async (req, res, prompt) => {
  try {
    // Se define un ejemplo de dato
    const data = prompt;
    console.log(data);

    // Verifica que 'data' sea una cadena de texto
    if (typeof data !== "string") {
      return res.status(400).json({
        status: 'fail',
        message: 'Estamos teniendo problemas, intentalo de nuevo. Si el problema persiste contactate con soporte',
        error: 'El tipo de dato no es correcto'
      })
    }

    // Convierte 'data' a minúsculas
    const ask = data.toLowerCase();

    // Verifica que 'prompt' no esté vacío
    if (!ask) {
      return res.status(400).json({
        status: 'fail',
        message: 'Estamos teniendo problemas, intentalo de nuevo. Si el problema persiste contactate con soporte',
        error: 'El prompt está pasando vacío'
      })
    }

    // Obtiene todas las recomendaciones desde la base de datos
    const recomendaciones = await Recomendacion.find();

    // Extrae las categorías de las recomendaciones y las convierte a minúsculas
    const categorias = recomendaciones.map((recomendacion) =>
      recomendacion.categoria.toLowerCase()
    );

    // Crea un arreglo de todas las recomendaciones con sus categorías correspondientes
    const allRecomendaciones = recomendaciones.map((recomendacion) => ({
      categoria: recomendacion.categoria.toLowerCase(),
      recomendaciones: recomendacion.recomendaciones,
    }));

    // Elimina duplicados en el arreglo de categorías
    const categoriasUnicas = [...new Set(categorias)];

    // Calcula la similitud entre 'prompt' y cada categoría
    const resultados = categoriasUnicas.map((categoria) => ({
      categoria,
      porcentajeCoincidencia: stringSimilarity.compareTwoStrings(
        ask,
        categoria
      ),
    }));
    console.log(categorias)

    // Verifica que 'resultados' sea un objeto o un arreglo
    if (typeof resultados !== "object" || !Array.isArray(resultados)) {
      throw new Error("La categoría no tiene el formato adecuado");
    }

    // Obtiene los porcentajes de coincidencia
    const porcentajesCoincidencia = resultados.map(
      (resultado) => resultado.porcentajeCoincidencia
    );

    console.log(porcentajesCoincidencia)

    // Encuentra los dos porcentajes más grandes
    const sortedPorcentajes = porcentajesCoincidencia.sort((a, b) => b - a);
    const topTwoPorcentajes = sortedPorcentajes.slice(0, 2);

    // Encuentra las categorías con los dos porcentajes más altos
    const topCoincidences = resultados
      .sort((a, b) => b.porcentajeCoincidencia - a.porcentajeCoincidencia)
      .slice(0, 2)
      .map((resultado) => resultado.categoria);

    // Encuentra las recomendaciones para las dos categorías con mayor coincidencia
    const categoriasCoincidentes = allRecomendaciones.filter(
      (recomendacion) => topCoincidences.includes(recomendacion.categoria)
    );

    return {
      // ask,
      topCoincidences, 
      topTwoPorcentajes,
      categoriasCoincidentes,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  imprimeCategoria,
};