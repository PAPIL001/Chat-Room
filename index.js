import server, { PORT } from './server.js';

server.listen(PORT, () => {
    console.log(`🚀  ChatterUp listening on port ${PORT}`);
});