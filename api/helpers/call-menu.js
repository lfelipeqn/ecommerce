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
    if(inputs.hostname !== undefined && inputs.hostname !== '' && inputs.hostname!=='iridio.co' && inputs.hostname!=='demo.1ecommerce.app' && inputs.hostname!=='localhost' && inputs.hostname!=='ultravape.co' && inputs.hostname!=='1ecommerce.app'){
      seller = await Seller.findOne({domain:inputs.hostname,active:true});
      productfilter.seller=seller.id;
    }

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
    <div class="navbar-item is-size-7 is-uppercase has-text-centered"><a href="/ver/marca/ultra-vape" class="has-text-white has-text-weight-bold">Productos</a></div>
      <div class="navbar-item is-size-7 is-uppercase has-text-centered"><a rel="nofollow" class="has-text-white has-text-weight-bold" href="/ver/categoria/inicio-redenciones">Redención</a></div>
      <div class="navbar-item is-size-7 is-uppercase has-text-centered"><a rel="nofollow" class="has-text-white has-text-weight-bold" href="#">Contacto</a></div>`;

    let navbarmobile =`<aside class="menu has-text-centered"><ul class="menu-list">`;


    navbarmobile +=`
        <li class="menu-item menu-item-mobile"><a class="is-uppercase has-text-weight-bold is-inline-block is-size-7 has-text-white" href="/">Inicio</a></li>
        <li class="menu-item menu-item-mobile"><a class="is-uppercase has-text-weight-bold is-inline-block is-size-7 has-text-white" href="/ver/marca/ultra-vape">Productos</a></li>
        <li class="menu-item menu-item-mobile"><a class="is-uppercase has-text-weight-bold is-inline-block is-size-7 has-text-white" href="/ver/categoria/inicio-redenciones">Redención</a></li>
        <li class="menu-item menu-item-mobile"><a class="is-uppercase has-text-weight-bold is-inline-block is-size-7 has-text-white" href="#">Contacto</a></li>`;
 
    navbarmobile +=`</ul></aside>`;

    navmenu.navbar = navbar;
    navmenu.navbarmobile = navbarmobile;
    navmenu.updated = moment().valueOf();

    return exits.success(navmenu);
  }

};

