// const io = require('socket.io-client');
require('dotenv').config()
const { WebSocket } = require('ws');
const subscribe = require('./subscribe');
const Redis = require("ioredis");
const clientRedis = new Redis(process.env.REDIS);
const collectionBidPriceUpdates = {};
const collectionBidStats = {};
const collectionsList = require('./collectionList');
// const { default: axios } = require('axios');
// const ethers = require("ethers");
// const provider = new ethers.providers.WebSocketProvider("wss://wiser-long-orb.discover.quiknode.pro/51c84b242a09064a03176e9c20cf308a489c8fb4");
const {Network, Alchemy} = require('alchemy-sdk')
const settings = {
    apiKey: "_qSfSMAPno3c1rCcufjgEwdqUJmTmDbF", // Replace with your Alchemy API Key.
    network: Network.ETH_MAINNET, // Replace with your network.
  };
  const alchemy = new Alchemy(settings);

const options = {
    transports: ['websocket'],
    upgrade: false,
    extraHeaders: {
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'ru,ru-RU;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6,zh-CN;q=0.5,zh;q=0.4',
        'Cache-Control': 'no-cache',
        'Connection': 'Upgrade',
        'Host': 'feeds.prod.blur.io',
        'Origin': 'https://blur.io',
        'Pragma': 'no-cache',
        'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
        'Sec-WebSocket-Key': 'gmX2zUFpgBBhgO1jVW4GSQ==',
        'Sec-WebSocket-Version': '13',
        'Upgrade': 'websocket',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Cookie': 'rl_session=RudderEncrypt%3AU2FsdGVkX1%2Bb%2BcMrlIXeP5zyoNLMWYq%2BYC4hwyJNcIARzC%2Fzo61ubJX1ECOb4jAi651Qt2iUmWUa0IFhmCvKSFFUJbNRWnGwafkzA0D1cA%2F0ZEb%2BTvtl21Pa%2BWWUnd1sY%2F42rjqR%2FeNmHhgSNDuw9A%3D%3D; rl_user_id=RudderEncrypt%3AU2FsdGVkX19L3TkeO0m%2Fh5JzLX47EnfAhKGFg6HM%2BsIHK%2Fu%2FeCAL0Hwt9mQ%2F5bxLd7woEVefPQ6KW2idHVBQKg%3D%3D; rl_trait=RudderEncrypt%3AU2FsdGVkX18tFcEqRRe5VCsfGN%2B9UaR%2Btlbw%2BiPvfy0%3D; rl_group_id=RudderEncrypt%3AU2FsdGVkX1%2FTOdDyQ1SYOuYajdZR5iPX8nS0VfzoNY8%3D; rl_group_trait=RudderEncrypt%3AU2FsdGVkX181d6D4MDaCsoOZUbhfOnAsNK7t018xr3M%3D; rl_anonymous_id=RudderEncrypt%3AU2FsdGVkX1%2B%2BqD81uDJfFXFg4Sv4Lo8CD3VYcL9xD5pON0%2FbbswLBgfuXqRFjPZE1%2FK%2FiU4jIdS9hNpPThY5uA%3D%3D; rl_page_init_referrer=RudderEncrypt%3AU2FsdGVkX1%2B4wUjEWrcQ93DVTtoEfy0KfMpHRe8opAo%3D; rl_page_init_referring_domain=RudderEncrypt%3AU2FsdGVkX1830cL00Isv0tnIfcUOJGAUl1gtaBUhTkE%3D; AWSALB=LQtrg/1+4uPDs6FThvF06WHTFLxbtHMcoWcnZtKd8Tff3yI+tvyc18uzr9QISikGWSiiH1SaI6uwFSkIs544woAjgtlOLXlFUHxHDWTRnnTiovtuPNzV9UbYj0LI; AWSALBCORS=LQtrg/1+4uPDs6FThvF06WHTFLxbtHMcoWcnZtKd8Tff3yI+tvyc18uzr9QISikGWSiiH1SaI6uwFSkIs544woAjgtlOLXlFUHxHDWTRnnTiovtuPNzV9UbYj0LI; __cf_bm=ue0Rhhr0UwquQm1t7V0703IgQMBFHbNJJ85Tn9zJn0c-1678444457-0-AamDfd9US5DZDANuV97Et1OQdMvhv9i1//GYbI6P9DLTmm9BCk7j0vKIm/O6/LHW6USH1uRhdUYzRWxDH/3Dgd74c570Yf7GhjjPYEexel/E; fs_uid=#o-19FFTT-na1#5789475100020736:6622844666892288:::#b189122c#/1709980458'
    }
};

const getInfoCollection = async (contract) => {
// Github: https://github.com/alchemyplatform/alchemy-sdk-js
// Setup: npm install alchemy-sdk

// Optional Config object, but defaults to demo api-key and eth-mainnet.



return await alchemy.nft
  .getContractMetadata(contract)
  .then((contractMetadata)=> {
    // console.log("Contract Metadata: ", contractMetadata);
    return contractMetadata;
//   process.exit(0);

  }).catch(e=> {
    console.log(e);
    return null
    // process.exit(0);
  });

    
}

    function subscribeList(socket) {
        // const cl = Array.from(new Set(collectionsList));
        Object.keys(collectionsList).forEach(async element => {
            const infoContract = await getInfoCollection(element);
            let setting = await clientRedis.get(`blur_setting_contract_${element}`);
            if (setting) {
                setting = JSON.parse(setting);
                collectionsList[element] = { ...setting };
             

            }
            collectionsList[element].name = infoContract.openSea.collectionName;
            
            subscribe(socket, element, 4216, 'denormalizer.collectionBidPriceUpdates')
            subscribe(socket, element, 4212, 'denormalizer.collectionBidStats')
            // subscribe(socket, element, 4219, 'stats.floorUpdate')

        });
    }
    function start() {
        return new Promise((resolve, reject) => {
            const socket = new WebSocket('wss://feeds.prod.blur.io/socket.io/?tabId=pKzRU7SRBQDn&storageId=n3kEOR5uxjEF&EIO=4&transport=websocket');




            // console.log(socket);

            socket.on('open', () => {
                console.log('Connected to server');
                console.log('connected');
                socket.send(40);
                subscribeList(socket);
                const { checkBid } = require('./checkBid.js');

                checkBid();
                // socket.send('4219["subscribe",["denormalizer.collectionBidStats"]]'); //https://blur.io/collections
                //   socket.send('4217["subscribe",["0x363c5dc3ff5a93c9ab1ec54337d211148e10f567.orderbook.newTopsOfBooks"]]'); // получаем события по рынку.
                //   socket.send('4216["subscribe",["0x363c5dc3ff5a93c9ab1ec54337d211148e10f567.denormalizer.collectionBidPriceUpdates"]]'); // получаем изменения в стаканах
                //   4217["subscribe",["0xed5af388653567af2f388e6224dc7c4b3241c544.orderbook.newTopsOfBooks"]]

                // 0{ "sid": "MlsCv8nid2lnChYNL1Jj", "upgrades": [], "pingInterval": 25000, "pingTimeout": 20000 } 86
                // 18:35:16.075
                // 40	2	
                // 18:35:16.076
                // 40{"sid":"9CpVnXhqvfMx9s7_L1Jm"}	32	
                // 18:35:16.280
                // 420["subscribe",["metadata.computedTraitFrequencies"]]	54	
                // 18:35:16.281
                // 421["subscribe",["feeds.collections.updatedNumberListings"]]	60	
                // 18:35:16.281
                // 422["subscribe",["denormalizer.collectionBidPriceUpdates"]]	59	
                // 18:35:16.281
                // 423["subscribe",["orderbook.newTopsOfBooks"]]	45	
                // 18:35:16.281
                // 424["subscribe",["stats.floorUpdate"]]	38	
                // 18:35:16.281
                // 425["subscribe",["feeds.activity.eventsCreated"]]	49	
                // 18:35:16.281
                // 426["subscribe",["orderbook.ownersBagsUpdates"]]	48	
                // 18:35:16.281
                // 427["subscribe",["metadata.received"]]	38	
                // 18:35:16.281
                // 428["subscribe",["feeds.nft.updatedScamStatus"]]	48	
                // 18:35:16.281
                // 429["subscribe",["pendingTransactions"]]	40	
                // 18:35:16.281
                // 4210["subscribe",["stats.volumeUpdate"]]	40	
                // 18:35:16.281
                // 4211["subscribe",["stats.collectionSupplyUpdate"]]	50	
                // 18:35:16.281
                // 4212["subscribe",["denormalizer.collectionBidStats"]]	53	
                // 18:35:16.281
                // 4213["subscribe",["feeds.gasFeeEstimateUpdate"]]

                // setTimeout(() => {
                //     start()

                // }, 30000);
                //   42["denormalizer.collectionBidStats",{"contractAddress":"0xccdf1373040d9ca4b5be1392d1945c1dae4a862c","totalValue":"1421.99","bestPrice":"1.82"}]
                // 42["0xed5af388653567af2f388e6224dc7c4b3241c544.orderbook.newTopsOfBooks",{"contractAddress":"0xed5af388653567af2f388e6224dc7c4b3241c544","tops":[{"tokenId":"3393","topAsk":null,"topBid":{"amount":"15","unit":"WETH","createdAt":"2023-03-10T08:43:39.000Z","marketplace":"OPENSEA"}}]}]
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from server');
                start()

            });

            socket.on('message', (data) => {
                const event = parseBuffer(data);
                // console.log(event);

                switch (event.code) {
                    case 2:
                        socket.send(3);
                        break;
                    case 42:
                        handleFortyTwo(event);
                        break;
                    default:
                        return;
                }


                // console.log('Received message:', event);
            });
        })

    }

    const bestPrice = {};

    const handleFortyTwo = (event) => {

        if (event.event.includes('denormalizer.collectionBidStats')) {
            // console.log('denormalizer.collectionBidStats');
            // console.log(event.payload);
            if (!bestPrice.hasOwnProperty(event.payload.bestPrice)) {
                bestPrice[event.payload.contractAddress] = {};
                bestPrice[event.payload.contractAddress] = event.payload;
            } else {
                bestPrice[event.payload.contractAddress] = event.payload;

            }
            return;
        } else if (event.event.includes('orderbook.newTopsOfBooks')) {
            // console.log('orderbook.newTopsOfBooks');
            console.log(event.payload);
            return;
        } else if (event.event.includes('denormalizer.collectionBidPriceUpdates')) {
            // console.log('denormalizer.collectionBidPriceUpdates');
            // console.log(event.payload);
            event.payload.updates.forEach(updateData => {
                if (!collectionBidPriceUpdates.hasOwnProperty(event.payload.contractAddress)) {
                    collectionBidPriceUpdates[event.payload.contractAddress] = {};

                } else {
                    updateData['total_eth'] = Math.ceil(updateData.price * updateData.executableSize);
                    collectionBidPriceUpdates[event.payload.contractAddress][updateData.price] = updateData;
                    collectionBidPriceUpdates[event.payload.contractAddress][updateData.price] = Object.assign({}, collectionBidPriceUpdates[event.payload.contractAddress][updateData.price], collectionsList[event.payload.contractAddress]);
                  
                }
                // collectionBidPriceUpdates[event.payload.contractAddress][updateData.price] = updateData;

            });
            // console.log(collectionBidPriceUpdates);
            return;
        } else if (event.event.includes('feeds.collections.updatedNumberListings')) {
            console.log('feeds.collections.updatedNumberListings');
            console.log(event.payload);
            return;
        } else if (event.event.includes('stats.floorUpdate')) {
            console.log('stats.floorUpdate');
            console.log(event.payload);
            return;
        } else if (event.event.includes('feeds.activity.eventsCreated')) {
            console.log('feeds.activity.eventsCreated');
            console.log(event.payload);
            return;
        } else if (event.event.includes('orderbook.ownersBagsUpdates')) {
            console.log('orderbook.ownersBagsUpdates');
            console.log(event.payload);
            return;
        } else if (event.event.includes('metadata.received')) {
            console.log('metadata.received');
            console.log(event.payload);
            return;
        } else if (event.event.includes('feeds.nft.updatedScamStatus')) {
            console.log('feeds.nft.updatedScamStatus');
            console.log(event.payload);
            return;
        } else if (event.event.includes('pendingTransactions')) {
            console.log('pendingTransactions');
            console.log(event.payload);
            return;
        } else if (event.event.includes('stats.volumeUpdate')) {
            console.log('stats.volumeUpdate');
            console.log(event.payload);
            return;
        } else if (event.event.includes('stats.collectionSupplyUpdate')) {
            console.log('stats.collectionSupplyUpdate');
            console.log(event.payload);
            return;
        } else if (event.event.includes('feeds.gasFeeEstimateUpdate')) {
            console.log('feeds.gasFeeEstimateUpdate');
            console.log(event.payload);
            return;
        }



    }

    const handleSaleEvent = async (item) => {
        console.log('SALE EVENT');
        // const {asset, transaction} = item;

    }

    const parseBuffer = (buffer) => {
        const bufferString = buffer.toString();
        const code = parseInt(bufferString);
        const arr = bufferString.indexOf('[');
        const obj = bufferString.indexOf('{');
        const firstChar = (arr === -1 || obj === -1) ?
            Math.max(arr, obj)
            : Math.min(arr, obj);
        const parsed = JSON.parse(bufferString.slice(firstChar));

        return {
            code,
            event: parsed[1] ? parsed[0] : 'unknown',
            payload: parsed[1] ? parsed[1] : parsed
        }
    }

    function collectionBidPriceUpdatesWatch() {
        return collectionBidPriceUpdates;
    }

    function getBestPrice() {
        return bestPrice
    }

    module.exports = { start, collectionBidPriceUpdatesWatch, getBestPrice }

