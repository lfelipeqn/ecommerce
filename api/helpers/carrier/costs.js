module.exports = {
  friendlyName: 'Shipping Costs',
  description: 'Get shipping costs from traking number',
  inputs: {
    tracking:{
      type:'string'
    }
  },
  exits: {
    success: {
      description: 'All done.',
    },
  },


  fn: async function (inputs, exits) {
    let order = await Order.findOne({tracking:inputs.tracking}).populate('addressDelivery');
    let seller = await Seller.findOne({id:order.seller}).populate('mainAddress');
    seller.mainAddress = await Address.findOne({id:seller.mainAddress.id}).populate('city');
    let city = await City.findOne({id:order.addressDelivery.city});
    let oitems = await OrderItem.find({order:order.id})
    .populate('product')
    .populate('productvariation');

    for(let pkg of oitems){
      pkg.productvariation.package = pkg.productvariation.package ? await Packages.findOne({id: pkg.productvariation.package}): '';
    }

    let requestArgs={
      'p':{
        'nit':'',
        'div':'',
        'cuenta':'3',
        'product':'0',
        'origen':seller.mainAddress.city.code+'000',
        'destino':city.code+'000',
        'valoracion':(order.totalProducts/1.19)*0.7,
        'nivel_servicio':{
          'item':1
        },
        'detalle':{
          'item':[]
        },
        'apikey':'a91872a2-59cd-11ec-bf63-0242ac130002',
        'clave':'iV3mS8qV8uE4pI5m',
      }
    };
    let items = [];
    for(let p of oitems){
      items.push({
        'ubl':'0',
        'alto':(p.productvariation.package.height).toString(),
        'ancho':(p.productvariation.package.width).toString(),
        'largo':(p.productvariation.package.length).toString(),
        'peso': (p.productvariation.package.weight).toString(),
        'unidades':'1',
      });
    }
    requestArgs.p.detalle.item = items;
    let result = await sails.helpers.carrier.coordinadora.soap(requestArgs,'Cotizador_cotizar','test',/*'prod',*/'tracking');
    await Order.updateOne({id:order.id}).set({fleteFijo:parseFloat(result.Cotizador_cotizarResult.flete_fijo),fleteVariable:parseFloat(result.Cotizador_cotizarResult.flete_variable),fleteTotal:parseFloat(result.Cotizador_cotizarResult.flete_total)});
    return exits.success();
  }


};

