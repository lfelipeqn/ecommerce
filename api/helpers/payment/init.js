module.exports = {
  friendlyName: 'Init',
  description: 'Init payment.',
  inputs:{
    method:{
      type:'string',
      required:true,
    }
  },
  exits: {
    success: {
      description: 'All done.',
    },
  },
  fn: async function (inputs, exits) {
    let publicKey = '';
    let privateKey = '';

    publicKey = 'af9068694b6f52fb537cb8fc0d4571b2';
    privateKey = 'fbda2a06312c6917057ca6e120232ff2';

    const epayco = require('epayco-sdk-node')({
      apiKey: publicKey,
      privateKey: privateKey,
      lang: 'ES',
      test: false
    });

    return exits.success(epayco);

  }

};

