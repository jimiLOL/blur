// const { reject } = require("core-js/fn/promise");
const Web3 = require("web3");
const abi = require("./abi.json");

require("dotenv/config");

async function createAccount(req, res) {
  // Set web3
  return new Promise(async (resolve, reject) => {
    const web3 = new Web3(process.env.MAINNET);

    try {
      let account = await web3.eth.accounts.create();
      // res.status(200).send({ status: true, account });
      return resolve(account)
    } catch (error) {
      // res.status(500).send({ status: false, message: "Create Account Failed" });
      return reject("Create Account Failed")
    }
  })

}

async function getBalance(body) {
  // Set web3
  const web3 = new Web3(
    body.network && body.network === "MAINNET"
      ? process.env.MAINNET
      : process.env.TESTNET
  );

  try {
    let balance = await web3.eth.getBalance(body.address);
    return { status: true, balance: web3.utils.fromWei(balance, "ether") }
  } catch (error) {
    console.log(error);
   return { status: false, message: "Get BNB Balance Failed" }
  }
}

async function getTokenBalance(req, res) {
  // Set web3
  const web3 = new Web3(
    req.body.network && req.body.network === "MAINNET"
      ? process.env.MAINNET
      : process.env.TESTNET
  );

  try {
    // contract instance
    const contract = new web3.eth.Contract(abi, process.env.CONTRACT_ADDRESS);
    const balance = await contract.methods.balanceOf(req.body.address).call();
    const decimals = await contract.methods.decimals().call();
    res.status(200).send({ status: true, balance: balance / 10 ** decimals });
  } catch (error) {
    res
      .status(500)
      .send({ status: false, message: "Get Token Balance Failed" });
  }
}

async function transfer(req, res) {
  // Set web3
  const web3 = new Web3(
    req.body.network && req.body.network === "MAINNET"
      ? process.env.MAINNET
      : process.env.TESTNET
  );

  try {
    // Sign transaction
    let signTransaction = await web3.eth.accounts.signTransaction(
      {
        to: req.body.to,
        value: web3.utils.toWei(web3.utils.toBN(req.body.amount), "ether"),
        gas: req.body.gas || 2000000,
      },
      req.body.from_private_key
    );
    console.log(signTransaction);

    // Transaction
    let tx = await web3.eth.sendSignedTransaction(
      signTransaction.rawTransaction
    );

    res.status(200).send({ status: true, hash: tx.transactionHash });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: "Transfer Failed" });
  }
}

async function transferToken(req, res) {
  // Set web3
  const web3 = new Web3(
    req.body.network && req.body.network === "MAINNET"
      ? process.env.MAINNET
      : process.env.TESTNET
  );

  try {
    // contract instance
    const contract = await new web3.eth.Contract(
      abi,
      process.env.CONTRACT_ADDRESS
    );
    const decimals = await contract.methods.decimals().call();
    // transfer event abi
    const transferAbi = await contract.methods
      .transfer(req.body.to, (req.body.amount * 10 ** decimals).toString())
      .encodeABI();

    // Sign transaction
    let signTransaction = await web3.eth.accounts.signTransaction(
      {
        to: process.env.CONTRACT_ADDRESS,
        data: transferAbi,
        gas: req.body.gas || 2000000,
      },
      req.body.from_private_key
    );

    // Transaction
    let tx = await web3.eth.sendSignedTransaction(
      signTransaction.rawTransaction
    );

    res.status(200).send({ status: true, hash: tx.transactionHash });
  } catch (error) {
    res.status(500).send({ status: false, message: "Transfer Failed" });
  }
}
async function getabi(req, res) {
  try {
    const web3 = new Web3(
      req.body.network && req.body.network === "MAINNET"
        ? process.env.MAINNET
        : process.env.TESTNET
    );

    const contract = await new web3.eth.Contract(
      abi,
      process.env.CONTRACT_ADDRESS
    );
    // console.log(contract);
    // const decimals = await contract.methods.decimals().call();
    // console.log(decimals);
    // transfer event abi
    // const transferAbi = await contract.methods.transfer(req.body.to, (req.body.amount * 10**decimals).toString()).encodeABI();
    res.status(200).send({ status: true, contract: contract });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: "Transfer Failed" });
  }
}

async function messageSubcrit(msg, element) {
  return new Promise(async (resolve, reject) => {
    const web3 = new Web3(process.env.MAINNET);



    // let msg = 'DEFI WARRIOR f2de3efa6de740979420d73cedc2de14.SkENCLnurwfxImLpjmJqUPAuHOdWUdKjJtnXAGykQqgbAYWauELZtDnYjrEDfrtXNVvoLQSQXKZBUcfuMYnpJEjgEriClTGUNoRDiwtrXNdrLrXhJwUxfCmhhhVeBHfaFOafpYiXJSZsYCsoPiDRRr';
    let privateKey = await decryptSecretKey(element.secretKey, element.walletAddress); // element.walletAddress сделано для теста т.к пароль является адресом кошелька, надо будет заменить на подпись\хеш, которую мы получим от метомаска
    let sigObj = await web3.eth.accounts.sign(msg, privateKey.privateKey);

    resolve(sigObj)
  })


}


async function cryptSecretKey(privateKey, password) {
  const web3 = new Web3(process.env.MAINNET);
  let crypt = await web3.eth.accounts.encrypt(privateKey, password);
  return crypt
};

async function decryptSecretKey(keystoreJsonV3, password) {
  const web3 = new Web3(process.env.MAINNET);
  let decrypt = await web3.eth.accounts.decrypt(keystoreJsonV3, password);

  return decrypt
};

module.exports = {
  createAccount,
  getBalance,
  getTokenBalance,
  transfer,
  transferToken,
  getabi,
  messageSubcrit,
  cryptSecretKey
};
