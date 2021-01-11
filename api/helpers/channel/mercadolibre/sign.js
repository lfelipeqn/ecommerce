module.exports = {
  friendlyName: 'Init',
  description: 'Init mercadolibre.',
  inputs: {
    seller:{
      type:'string',
      required:true,
    },
  },
  exits: {
    success: {
      description: 'All done.',
    },
    error:{
      description: 'Error'
    },
  },
  fn: async function (inputs,exits) {
    const meli = require('mercadolibre-nodejs-sdk');
    let integration = await Integrations.findOne({channel:'mercadolibre',seller:inputs.seller});
    let mercadolibre = new meli.OAuth20Api();
    if (integration) {
      let opts = {
        'grantType': "refresh_token", // "authorization_code" | 
        'clientId': integration.user, // String | 
        'clientSecret': integration.key, // String | 
        //'redirectUri': "redirectUri_example", // String | 
        'code': integration.secret, // String | 
        'refreshToken': integration.url // String | 
      };
      mercadolibre.getToken(opts, async (error, data, response) => {
        if(error){ console.log(error); return exits.error(error);}
        let updated = await Integrations.updateOne({id:integration.id}).set({
          url:response.body['refresh_token'],
          secret:response.body['access_token'],
        });
        return exits.success(updated);
      });
    } else {
      return exits.error('No existe integracion');
    }
  }


};

