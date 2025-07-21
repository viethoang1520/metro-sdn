const Station = require("../models/Station");

exports.getAllStations = async (req, res) => {
  try {
    const stations = await Station.find({status: 1});
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


exports.updateStationStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (![0, 1].includes(status)) {
      return res.status(400).json({ message: 'Status must be 0 or 1' });
    }

    const station = await Station.findById(id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    if(!station.prev_station){
      return res.status(400).json({ message: 'Cannot active the first station ' });
    }

    const { prev_station, next_station, distance: thisDistance } = station;
    console.log(thisDistance)
    if (status === 0) {
      if (prev_station) {
        const prev = await Station.findOne({ name: prev_station });
        if (prev) {
          prev.next_station = next_station || '';
          await prev.save();
        }
      }

      if (next_station) {
        const next = await Station.findOne({ name: next_station });
        if (next) {
          next.prev_station = prev_station || '';
          await next.save();
        }
      }

if (!prev_station && status === 0) {
  console.log('Soft-deleting ga gốc:', station.name);

  const gaNext = await Station.findOne({ name: next_station, status: 1 });
  if (!gaNext) {
    console.warn('Không tìm thấy ga kế tiếp của ga gốc.');
  } else {
    gaNext.prev_station = "";
    gaNext.distance = 0;
    await gaNext.save();

    const allStations = await Station.find({ status: 1 });
    const stationMap = {};
    for (const st of allStations) {
      stationMap[st.name] = st;
    }

    let prev = gaNext;
    let current = stationMap[gaNext.next_station];
    while (current) {
      const segmentDistance = current.distance - prev.distance;
      current.distance = parseFloat((prev.distance + segmentDistance).toFixed(2));
      await current.save();

      prev = current;
      current = stationMap[current.next_station];
    }
  }
}
    }

    else if (status === 1) {
  if (!prev_station) {
    const stationsToUpdate = await Station.find({
      name: { $ne: station.name },
      distance: { $gte: 0 },
      status: 1
    });

    for (let s of stationsToUpdate) {
      s.distance = parseFloat((s.distance + thisDistance).toFixed(2));
      await s.save();
    }

    station.distance = 0;

    if (next_station) {
      const next = await Station.findOne({ name: next_station });
      if (next && next.prev_station === "") {
        next.prev_station = station.name;
        await next.save();
      }
    }
  } else {
    const prev = await Station.findOne({ name: prev_station });
    if (prev && prev.status === 1) {
      prev.next_station = station.name;
      await prev.save();
    }

    if (next_station) {
      const next = await Station.findOne({ name: next_station });
      if (next && next.status === 1) {
        next.prev_station = station.name;
        await next.save();
      }
    }
  }
}

    station.status = status;
    await station.save();

    res.status(200).json({
      message: `Station "${station.name}" status updated to ${status}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
