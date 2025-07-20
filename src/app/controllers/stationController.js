const Station = require("../models/Station");

exports.getAllStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.status(200).json(stations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stations", error });
  }
};

exports.createStation = async (req, res) => {
  try {
    const {
      name,
      status,
      distance,
      insertPosition,
      referenceStationName,
      insertBetween,
    } = req.body;

    let newStation;

    if (insertPosition === "between") {
      const { prevStationName, nextStationName } = insertBetween;
      const prevStation = await Station.findOne({ name: prevStationName });
      const nextStation = await Station.findOne({ name: nextStationName });

      if (!prevStation || !nextStation) {
        return res.status(400).json({ message: "Invalid station names" });
      }

      const min = Math.min(prevStation.distance, nextStation.distance);
      const max = Math.max(prevStation.distance, nextStation.distance);
      if (distance <= min || distance >= max) {
        return res
          .status(400)
          .json({ message: `Distance must be between ${min} and ${max}` });
      }

      newStation = new Station({
        name,
        route: "Metro Line 1",
        prev_station: prevStation.name,
        next_station: nextStation.name,
        distance,
        status,
      });
      await newStation.save();

      prevStation.next_station = newStation.name;
      nextStation.prev_station = newStation.name;
      await prevStation.save();
      await nextStation.save();
    } else if (insertPosition === "before") {
      const nextStation = await Station.findOne({ name: referenceStationName });
      if (!nextStation)
        return res.status(400).json({ message: "Invalid reference station" });
      const shift = distance;

      newStation = new Station({
        name,
        route: "Metro Line 1",
        prev_station: "",
        next_station: nextStation.name,
        distance: 0, 
        status,
      });
      await newStation.save();

      const stationsToUpdate = await Station.find({
        name: { $ne: newStation.name },
        distance: { $gte: 0 },
      });

      for (let station of stationsToUpdate) {
        station.distance += shift;
        await station.save();
      }

      nextStation.prev_station = newStation.name;
      await nextStation.save();
    } else if (insertPosition === "after") {
      const prevStation = await Station.findOne({ name: referenceStationName });
      if (!prevStation)
        return res.status(400).json({ message: "Invalid reference station" });

      if (distance <= prevStation.distance) {
        return res.status(400).json({
          message: `Distance must be greater than ${prevStation.distance}`,
        });
      }

      newStation = new Station({
        name,
        route: "Metro Line 1",
        prev_station: prevStation.name,
        next_station: "",
        distance,
        status,
      });
      await newStation.save();

      prevStation.next_station = newStation.name;
      await prevStation.save();
    } else {
      return res.status(400).json({
        message:
          'Invalid insertPosition. Must be "before", "after", or "between"',
      });
    }

    res.status(201).json({
      message: "Station created successfully",
      station: newStation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
