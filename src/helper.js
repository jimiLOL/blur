const { default: axios } = require("axios");
const tunnel = require('tunnel');
const moment = require('moment');

const fs = require('fs');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // случайный индекс от 0 до i

        // поменять элементы местами
        // мы используем для этого синтаксис "деструктурирующее присваивание"
        // подробнее о нём - в следующих главах
        // то же самое можно записать как:
        // let t = array[i]; array[i] = array[j]; array[j] = t
        [array[i], array[j]] = [array[j], array[i]];
    }
};

function proxyInit(proxy) {
    try {
        let proxyArray = proxy.split(":", 4);

        return { host: proxyArray[0], port: proxyArray[1] }

    } catch (e) {
        console.log(e);
        console.log(proxy);
        // process.exit(1)
    }


};
async function getIP(agent) {
    return await axios.get('https://api.ipify.org', { httpsAgent: agent, timeout: 10000 }).then(res => {
        // console.log('PROXY IP^ ' + res.data);
        return {title: 'ok'}
    }).catch(e => {
        // console.log(e.message);
        return {error: e.message}
    })
};

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

function initAgent(proxyOptions) {
    let agent = tunnel.httpsOverHttp({
        proxy: proxyOptions,
    });
    return agent
}


function delDublicateProxy(proxy) {
    const newProxyArray = [];
    proxy.forEach((ele, i) => {
        let filter = proxy.filter(x => x == ele);

        if (filter.length == 1) {
            newProxyArray.push(ele)
        }

    });
    return newProxyArray
};

function makeid(length) {
    var result   = '';
    var characters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random()*charactersLength));
   }
   return result;
};
 

function filterProxy(arrayProxy) {
    const proxyFile = fs.readFileSync('./errorProxy.txt', { encoding: 'utf8', flag: 'r' });
    const proxy = proxyFile.split('\n', 100200);
    // console.log(proxy);
    let proxyF = delDublicateProxy(arrayProxy);
    const newProxy = [];
    proxyF.forEach(element => {
        let filter = proxy.filter(x => x == element);
        if (filter.length == 0) {
            newProxy.push(element);
        }

    });
    console.log(newProxy.length);
    return newProxy

}

function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function randn_bm(min, max, skew) {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
  }

  function setDateFormatMoment(d, setday) {
    if (setday == "1d") {
      d = moment(d).format("YYYY-MM-DD");
  
      return d;
    }
    if (setday == "1h") {
      // let d = moment(d).format("YYYY-MM-DD[T]HH");
  
      d = moment(d).format("YYYY-MM-DD[T]HH");
  
      // console.log(setStartTime);
  
      return d;
    }
    if (setday == "1s") {
      d = moment(d).format("YYYY-MM-DD[T]HH:mm:ss");
  
      return d;
    }
    if (setday == "1m") {
      d = moment(d).format("YYYY-MM-DD[T]HH:mm");
  
      return d;
    }
    if (setday == "5m") {
      d = moment(d).format("YYYY-MM-DD[T]HH:mm");
  
      return d;
    }
    if (setday == "15m") {
      d = moment(d).format("YYYY-MM-DD[T]HH:mm");
  
      return d;
    }
    if (setday == "30m") {
      d = moment(d).format("YYYY-MM-DD[T]HH:mm");
  
      return d;
    }
    if (setday == "1w") {
      d = moment(d).format("YYYY-MM-DD");
  
      return d;
    }
    if (setday == "1month") {
      d = moment(d).format("YYYY-MM");
  
      return d;
    }
    if (setday == "2month") {
      d = moment(d).format("YYYY-MM");
  
      return d;
    }
    if (setday == "3month") {
      d = moment(d).format("YYYY-MM");
  
      return d;
    }
    if (setday == "1y") {
      d = moment(d).format("YYYY");
  
      return d;
    }
  }
  function getMax(arr) {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {
    // console.log(arr[len] > max);

        max = arr[len] > max ? arr[len] : max;
      // console.log(max);

    }
    return max;
}

function getMin(arr) {
  let len = arr.length;
  let min = +Infinity;

  while (len--) {
      min = arr[len] < min ? arr[len] : min;
  }
  return min;
}

  const helper = { shuffle, proxyInit, getIP, uuid, getRandomInt, initAgent, timeout, delDublicateProxy, filterProxy, makeid, randn_bm, setDateFormatMoment, getMin, getMax };
  module.exports = helper;

