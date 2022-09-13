module.exports = {
  friendlyName: 'Tracking',
  description: 'Tracking coordinadora.',
  inputs:{
    tracking:{
      type:'string',
      required:true
    }
  },
  exits: {
    success: {
      description: 'All done.',
    },
  },
  fn: async function (inputs,exits) {
    let soap = require('strong-soap').soap;
    let url = 'http://sandbox.coordinadora.com/ags/1.5/server.php?wsdl';
    //let url = 'https://ws.coordinadora.com/ags/1.5/server.php?wsdl';

    let requestArgs={
      'p':{
        'codigo_remision': inputs.tracking,
        'nit':null,
        'div':null,
        'referencia':null,
        'imagen':0,
        'anexo':0,
        'apikey':'a91872a2-59cd-11ec-bf63-0242ac130002',
        'clave':'iV3mS8qV8uE4pI5m',
      }
    };
    let options = {};
    soap.createClient(url, options, (err, client) =>{
      if(err){return exits.success();}
      let method = client['Seguimiento_simple'];
      method(requestArgs, async (err, result)=>{
        if(err){return exits.success();}
        return exits.success(result['Seguimiento_simpleResult']);
      });
    });
  }
};

