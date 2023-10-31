

const getOne = (Model, populateOptions) => async (req, res, next) => {
    try {
      const _id = req.params.id;
      let query = Model.findById(_id);
      if (populateOptions) query = query.populate(populateOptions);
      const doc = await query;
  
      if (!doc) {
        const error = new Error("No se encontró un documento con esa identificación");
        error.statusCode = 404;
        throw error;
      }
  
      res.status(200).json({
        status: "successful",
        requestAt: req.requestTime,
        data: { data: doc },
      });
    } catch (error) {
      next(error);
    }
  };
  
  
  module.exports = { getOne };

