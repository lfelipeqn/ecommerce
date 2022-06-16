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

    publicKey = '83a2b717a6452fe08697f2a15b9d1a4d';
    privateKey = '84715e7c2726aa1c54b366c564ac7c6d';

    const epayco = require('epayco-sdk-node')({
      apiKey: publicKey,
      privateKey: privateKey,
      lang: 'ES',
      test: false
    });

    return exits.success(epayco);

  }

};

