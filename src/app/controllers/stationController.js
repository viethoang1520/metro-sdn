const Station = require('../models/Station');

exports.getAllStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.status(200).json(stations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stations', error });
  }
};
