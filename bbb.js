let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let b = require('bonescript');
let v = 0.5;
var pinos = {
  left:
    {
      front: 'P9_21',
      back: 'P9_16'
    },
  right: {
    front: 'P9_14',
    back: 'P9_22'
  }
};

io.on('connection', (socket) => {

  socket.on('disconnect', function () {
    io.emit('close', { message: 'Conex  o encerrrada', event: 'close' });
  });

  socket.on('getPins', function () {
    console.log('pinos');
    io.emit('pins', { pinos: pinos, event: 'pinos' });
  });

  socket.on('acelerador', function () {
    switch (v) {
      case 0.5:
        v = 0.4;
        break;
      case 0.4:
        v = 0.3;
        break;
      case 0.3:
        v = 0.2;
        break;
      case 0.2:
        v = 0.1;
        break;
      case 0.1:
        v = 0;
        break;
    }
    b.pinMode(pinos.left.back, b.OUTPUT);
    b.pinMode(pinos.left.front, b.OUTPUT);
    b.pinMode(pinos.right.back, b.OUTPUT);
    b.pinMode(pinos.right.front, b.OUTPUT);
    console.log("Acelera");
    v = 0.5;
    b.analogWrite(pinos.left.front, v, 2000.0);
    b.analogWrite(pinos.left.back, v, 2000.0);
    b.analogWrite(pinos.right.back, v, 2000.0);
    b.analogWrite(pinos.right.front, v, 2000.0);
    
    io.emit('acelera', { message: 'Acelera', event: 'gas' });
  });

  socket.on('freio', function () {
    console.log("Freia");
    b.pinMode(pinos.left.back, b.OUTPUT);
    b.pinMode(pinos.left.front, b.OUTPUT);
    b.pinMode(pinos.right.back, b.OUTPUT);
    b.pinMode(pinos.right.front, b.OUTPUT);
    b.analogWrite(pinos.left.front, 0.5, 2000.0);
    b.analogWrite(pinos.left.back, 0.5, 2000.0);
    b.analogWrite(pinos.right.front, 0.5, 2000.0);
    b.analogWrite(pinos.right.back, 0.5, 2000.0);
    io.emit('freia', { message: 'Freio', event: 'break' });
  });
  socket.on('direita', function () {
    io.emit('direita', { message: 'Direita', event: 'right' });
  });
  socket.on('esquerda', function () {
    io.emit('esquerda', { message: 'Esquerda', event: 'left' });
  });
  socket.on('cambio', function (pos) {
    socket.pos = pos;
    io.emit('cambio', { message: 'Cambio', event: 'march' });
  });

});

var port = 1337;

http.listen(port, function () {
  console.log('listening in http://192.168.0.13:' + port);
});



