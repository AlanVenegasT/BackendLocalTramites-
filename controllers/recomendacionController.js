const Recomendacion = require("../models/recomendacion");

const createCategory = async (req, res) => {
  const { categoria } = req.body;
  console.log(req.body);

  // Prevenimos categorias duplicadas
  const categoriaExistente = await Recomendacion.findOne({ categoria });
  if (categoriaExistente) {
    const err = new Error("La categoria ya existe");
    return res.status(400).json({ msg: err.message });
  }

  try {
    //Guardar categorias
    const recomendacion = new Recomendacion(req.body);
    const recomendacionGuardada = await recomendacion.save();
    res.json({ recomendacionGuardada });
  } catch (err) {
    console.log(err);
  }
};

const getCategories = async (req, res) => {
  const recomendacion = await Recomendacion.find();
  res.json(recomendacion);
};

const getCategory = async (req, res) => {
  const { id } = req.params;
  const recomendacion = await Recomendacion.findById(id);

  if (!recomendacion) {
    return res.status(404).json({ msg: "No encontrado" });
  }
  res.json(recomendacion);
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(401).json({
      status: "fail",
      message: "El id es necesario",
      error: "El id no puede ser nulo",
    });
  }

  let recomendacion = null;

  try {
    recomendacion = await Recomendacion.findById(id);
  } catch (ex) {
    return res.status(401).json({
      status: "fail",
      message: "El formato del id es invalido",
      error:
        "El id no se pudo encontrar en la base de datos, inserte uno valido",
    });
  }

  if (recomendacion == null) {
    return res.status(401).json({
      status: "fail",
      message: "El id es invalido",
      error:
        "El id no se pudo encontrar en la base de datos, inserte uno valido",
    });
  }
  const { categoria, recomendaciones } = req.body;

  if (categoria == "") {
    return res.status(401).json({
      status: "fail",
      message: "El nombre de la categoria no puede estar vacio",
      error: "El campo categoria no puede ser nulo o vacio",
    });
  }

  const categoriaExistente = await Recomendacion.findOne({ categoria });
  if (categoriaExistente) {
    return res.status(401).json({
      status: "fail",
      message: "El nombre de la categoria ya esta registrado",
      error: "No puede haber dos categorias con el mismo nombre",
    });
  }

  console.log(!Array.isArray(recomendaciones));
  if (!Array.isArray(recomendaciones)) {
    return res.status(401).json({
      status: "fail",
      message: "Las recomendaciones tienen un formato invalido",
      error: "Las recomendaciones se tienen que pasar como arreglo",
    });
  }
  console.log(recomendaciones == "");
  if (recomendaciones.length == 0)
    return res.status(401).json({
      status: "fail",
      message: "Las recomendaciones no pueden venir vacias",
      error: "El arreglo esta vacio",
    });

  await Recomendacion.findByIdAndUpdate(
    { _id: id },
    { categoria, recomendaciones },
    { new: true, runValidators: true }
  );

  return res.status(401).json({
    status: "successful",
    message: "Recomendacion actualzada correctamente",
    data: { id, categoria, recomendaciones },
  });
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory
};
