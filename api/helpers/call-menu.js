module.exports = {
  friendlyName: 'Call menu',
  description: '',
  inputs: {
    hostname:{
      type:'string'
    }
  },
  exits: {
    success: {
      description: 'All done.',
    },
  },
  fn: async function (inputs,exits) {
    let moment = require('moment');
    let seller = null;
    let navmenu = {};
    let filter = {active:true};
    let productfilter={active:true};

    let cids = [];

    seller = await Seller.findOne({domain:inputs.hostname,active:true});
    productfilter.seller=seller.id;

    let brands = await Product.find({
      where:{seller:productfilter.seller,active:true,type:'product'},
      select: ['manufacturer', 'seller']
    });

    let manufac = [];

    for(let product of brands){
      delete product.id;
      if(!manufac.includes(product.manufacturer)){
        manufac.push(product.manufacturer);
      }
    }
    delete brands;

    let filterProducts = await Manufacturer.find({
      where:{id:manufac,active:true},
      select:['name','url']
    });


    let categories = await Category.find({
      where: {active:true},
      select: ['name','url']
    }).populate('products',productfilter);
    for(let c of categories){
      if(!cids.includes(c.id) && c.products.length>0){
        cids.push(c.id);
      }
    }
    filter.id=cids;

    let navbar = `<div class="navbar-item is-size-7 is-uppercase has-text-centered"><a href="/" class="has-text-white has-text-weight-bold">Inicio</a></div>
    <div class="navbar-item is-size-7 is-uppercase has-text-centered"><a href="/ver/marca/`+filterProducts[0].url+`" class="has-text-white has-text-weight-bold">Productos</a></div>
      <div class="navbar-item is-size-7 is-uppercase has-text-centered"><a rel="nofollow" class="has-text-white has-text-weight-bold" href="/ver/categoria/inicio-redenciones">Redención</a></div>
      <div class="navbar-item is-size-7 is-uppercase has-text-centered"><a rel="nofollow" class="has-text-white has-text-weight-bold" href="#">Contacto</a></div>`;

    let navbarmobile =`<aside class="menu has-text-centered"><ul class="menu-list">`;


    navbarmobile +=`
        <li class="menu-item menu-item-mobile"><a class="is-uppercase has-text-weight-bold is-inline-block is-size-7 has-text-white" href="/">Inicio</a></li>
        <li class="menu-item menu-item-mobile"><a class="is-uppercase has-text-weight-bold is-inline-block is-size-7 has-text-white" href="/ver/marca/`+filterProducts[0].url+`">Productos</a></li>
        <li class="menu-item menu-item-mobile"><a class="is-uppercase has-text-weight-bold is-inline-block is-size-7 has-text-white" href="/ver/categoria/inicio-redenciones">Redención</a></li>
        <li class="menu-item menu-item-mobile"><a class="is-uppercase has-text-weight-bold is-inline-block is-size-7 has-text-white" href="#">Contacto</a></li>`;

    navbarmobile +=`</ul></aside>`;

    navmenu.navbar = navbar;
    navmenu.navbarmobile = navbarmobile;
    navmenu.updated = moment().valueOf();

    return exits.success(navmenu);
  }

};

