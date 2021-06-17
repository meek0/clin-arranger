import { homepageCharts } from '../queries';

const statistics = async (req, res, next) => {
  res.status(200).json(await homepageCharts());
}

export default statistics;