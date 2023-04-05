const {cancelAllBid, switchEnableScript, getStatusWork, cancelBidForWallet} = require('./api');

async function routes(server, options) {
    server.get('/api/cancel_all_bid', async (req, res) => await cancelAllBid(req, res));
    server.get('/api/switch_enable_script', async (req, res) => await switchEnableScript(req, res));
    server.get('/api/get_status_work', (req, res)=> getStatusWork(req, res));
    server.post('/api/cancel_bid_for_wallet', async (req, res)=> await cancelBidForWallet(req, res));



}

module.exports = routes