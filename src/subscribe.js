

const subscribe = (socket, address, code, command) => {
    socket.send(`${code}["subscribe",["${address}.${command}"]]`);

    


    // socket.on('message', (data) => {
    //     const event = parseBuffer(data);
    //     console.log('Received message:', event);
    //   });

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


module.exports = subscribe;