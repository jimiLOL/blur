const { Alchemy, Network, NftSaleMarketplace } = require("alchemy-sdk");
const server = require('fastify')({ logger: false });

server.register(require('fastify-cors'), 
// function (instance) {

//   return (req, callback) => {
//     let corsOptions;
//     const origin = req.headers.origin;
//     console.log(origin);
//     // do not include CORS headers for requests from localhost
//     const hostname = new URL(origin).hostname;
//     if(hostname === "localhost"){
//       corsOptions = { origin: false }
//     } else {
//       corsOptions = { origin: true }
//     }
//     callback(null, corsOptions) // callback expects two parameters: error and options
//   }
// }
{
  origin: "*",
  methods: ["POST", "GET"]
} // только для разработки
)

// server.addContentTypeParser('text/json', { parseAs: 'string' }, server.getDefaultJsonParser('ignore', 'ignore'))


server.register(require('./src/routers'));

const port = process.env.PORT || 4343;

server.listen(port, '0.0.0.0', (err) => {
  if (err) return console.log(err);
  console.log("Подключение прошло на порт " + port);
    start(); // начинаем получать данные с биржи

});


const { start } = require('./src/socket');

// setTimeout(async() => {
//     await start(); // начинаем получать данные с биржи
    
// }, 1000);







const { getBalance } = require('./src/web3controller');

const body = {
    address: "0xb8F202dC3242A6b17d7Be5e2956aC2680EAf223c",
    network: "MAINNET"

}
getBalance(body).then((data) => {
    console.log(data);
})

const config = {
    apiKey: "_qSfSMAPno3c1rCcufjgEwdqUJmTmDbF",
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

const main = async () => {

    // BAYC contract address
    const address = "0x363C5dC3ff5A93C9AB1ec54337d211148e10f567";

    // Get sales history of BAYC #1000
    const history = await alchemy.nft.getNftSales({
        fromBlock: 0,
        toBlock: 'latest',
        marketplace: NftSaleMarketplace.SEAPORT,
        contractAddress: address,
        tokenId: 3339,
    });

    console.log('history');
    console.log(history);


    const price = await alchemy.nft.getFloorPrice(address);
    console.log(price);


};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

// runMain();