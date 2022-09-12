import 'regenerator-runtime/runtime';
import logger from '../config/logger.js';
import es from '../services/esClient.js';
import { PROJECTS_IDS } from '../admin/projectsConfig.js';
import { ArrangerApi } from '../admin/arrangerApi.js';

const cmdLogger = logger.child({ defaultMeta: { location: 'cmd' } });

const [env] = process.argv.slice(2);

const project = `clin_${env}`;

if (!PROJECTS_IDS[project]) {
  throw new Error(`Project "${project}" does not exist`);
}

const removeArrangerProject = ArrangerApi.removeArrangerProject(es.getInstance());

await removeArrangerProject(PROJECTS_IDS[`clin_${env}`]);

cmdLogger.info(`Deleted project ${project}`);

process.exit(0);
