import { init as initServers } from './lib/server';
import { init as initWorkers } from './lib/workers';

(async () => {
  // Initialise the servers
  initServers();

  // Initialise the workers
  await initWorkers();
})();
