module.exports = {
  servers: {
    one: {
      host: 'research-osnet.fb2.frankfurt-university.de',
      username: 'meteorkalender',
      //"password": "meteor",
      // WARNING: Keys protected by a passphrase are not supported
      pem: 'deploy_rsa',
      // password:
      // or leave blank for authenticate from ssh-agent
    }
  },

  meteor: {
    name: 'MeteorKalenderTest',
    path: '.',
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true,
    },
    env: {
      PORT: 3001,
      ROOT_URL: 'http://test.meteorkalender.freeddns.org',
      MONGO_URL: 'mongodb://localhost/meteor'
    },
    dockerImage: 'cwaring/meteord:base',
    deployCheckWaitTime: 60
  },

  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};