const App = require('express');
const Http = require('http').Server;
const Server = require('socket.io');

var pinos = {
  left:
    {
      front: 'P9_21',
      back: 'P9_16',
      reverse: ['P8_11', 'P8_15']
    },
  right: {
    front: 'P9_14',
    back: 'P9_22',
    reverse: ['P8_12', 'P8_16']
  }
};


class RobotServer {

  constructor(pins, port) {
    this.bone = require('bonescript');
    this.pins = pins;
    this.userConnected = false;
    this.app = new App();
    this.http = new Http(this.app);
    this.io = new Server(this.http);
    this.http.listen(port, () => { console.log('Server Ready'); });

    this.io.on('connection', (socket) => { this.startConn(socket) });
    this.startRobot();
  }
  startRobot() {
    this.bone.pinMode(this.pins.left.back, this.bone.OUTPUT);
    this.bone.pinMode(this.pins.left.front, this.bone.OUTPUT);
    this.bone.pinMode(this.pins.right.back, this.bone.OUTPUT);
    this.bone.pinMode(this.pins.right.front, this.bone.OUTPUT);
    this.bone.pinMode(this.pins.left.reverse[0], this.bone.OUTPUT);
    this.bone.pinMode(this.pins.right.reverse[0], this.bone.OUTPUT);
    this.bone.pinMode(this.pins.left.reverse[1], this.bone.OUTPUT);
    this.bone.pinMode(this.pins.right.reverse[1], this.bone.OUTPUT);
    this.moveRobot({
      left:
        {
          front: 0,
          back: 0,
          reverse: [0, 0]
        },
      right: {
        front: 0,
        back: 0,
        reverse: [0, 0]
      }
    });
  }


  moveRobot(values) {
    this.bone.digitalWrite(this.pins.left.reverse[0], values.left.reverse[0]);
    this.bone.digitalWrite(this.pins.left.reverse[1], values.left.reverse[1]);
    this.bone.digitalWrite(this.pins.right.reverse[0], values.right.reverse[0]);
    this.bone.digitalWrite(this.pins.right.reverse[1], values.right.reverse[1]);
    this.bone.digitalWrite(this.pins.left.front, values.left.front);
    this.bone.digitalWrite(this.pins.left.back, values.left.back);
    this.bone.digitalWrite(this.pins.right.front, values.right.front);
    this.bone.digitalWrite(this.pins.right.back, values.right.back);
  }

  startConn(socket) {
    socket.on('moveRobot', (values) => {
      this.moveRobot(values);
    })
    socket.on('latency', (startTime, cb) => {
      cb(startTime);
    });

    socket.on('error', () => {
      console.log('Connection Error');
      this.userConnected = false;
      this.moveRobot({
        left:
          {
            front: 0,
            back: 0,
            reverse: [0, 0]
          },
        right: {
          front: 0,
          back: 0,
          reverse: [0, 0]
        }
      });
    });

    socket.on('pair', (cb) => {
      console.log('New Connection Request');
      if (this.userConnected) {
        cb(false);
      } else {
        this.userConnected = true;
        cb(true);
      }
    });


    socket.on('getRobot', (cb) => {
      console.log('New Get Bot Request');
      cb({
        name: 'Jeredy Controller',
        version: 'Palmas 5',
        pins: this.pins
      });
    });

    socket.on('disconnect', () => {
      console.log('Connection  Closed');
      this.userConnected = false;
      this.moveRobot({
        left:
          {
            front: 0,
            back: 0,
            reverse: [0, 0]
          },
        right: {
          front: 0,
          back: 0,
          reverse: [0, 0]
        }
      });
    });
  }
}


var servidor = new RobotServer(pinos, 1337);
console.log(servidor);