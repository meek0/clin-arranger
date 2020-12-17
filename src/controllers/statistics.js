const { homepageCharts } = require('../queries');

const statistics = async (req, res, next) => {
  res.status(200).json(await homepageCharts());
}

module.exports = statistics;