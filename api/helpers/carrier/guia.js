module.exports = {
  friendlyName: 'Imprimir Guia',
  description: 'Guia carrier.',
  inputs: {
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
    let url = 'http://sandbox.coordinadora.com/agw/ws/guias/1.6/server.php?wsdl';
    //let url = 'http://guias.coordinadora.com/ws/guias/1.6/server.php?wsdl';
    let requestArgs={
      'p':{
        'codigo_remision': inputs.tracking,
        'margen_izquierdo':0,
        'margen_superior':0,
        'formato_impresion':null,
        'usuario':'ultrapharma.ws',
        'clave':'0ca0f3400231bba13faabca2982ae051ace67713345bb797adad70d3220ec9a3',
      }
    };
    let options = {};
    soap.createClient(url, options, (err, client) =>{
      let method = client['Guias_reimprimirGuia'];
      if(err){return exits.error(err);}
      method(requestArgs, async (err, result)=>{
        if(err){return exits.error(err);}
        if(result){
          return exits.success(result.return.pdf.$value);
        }
      });
    });

  }
};

