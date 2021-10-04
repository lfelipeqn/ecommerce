/**
 * VariationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  showvariations: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'showvariations')){
      throw 'forbidden';
    }
    let filter = {};
    let error = null;
    let variation=null;
    let sellers = null;
    let brands = [];
    let genders = await Gender.find();
    let categories = await Category.find({level:2});
    let action = req.param('action') ? req.param('action') : null;
    let id = req.param('id') ? req.param('id') : null;
    let measures = ['centímetro', 'gramo','mililitro','unidad'];
    if (rights.name !== 'superadmin' && rights.name !== 'admin') {
      sellers = await Seller.find({ id: req.session.user.seller });
      filter.seller = req.session.user.seller;
    } else {
      sellers = await Seller.find();
    }
    let variations = await Variation.find({
      where: filter,
      sort: 'createdAt DESC'
    }).populate('gender').populate('category').populate('seller').populate('manufacturer');

    if(id){
      variation = await Variation.findOne({id:id}).populate('gender').populate('manufacturer');
      const productsSeller = await Product.find({seller: variation.seller}).populate('manufacturer');
      for (const product of productsSeller) {
        if(brands.length === 0 || !brands.some(brand => brand.id === product.manufacturer.id)){
          brands.push(product.manufacturer);
        }
      }
    }
    return res.view('pages/catalog/variations',{layout:'layouts/admin',sellers,variations:variations,categories:categories,action:action,error:error,variation:variation,brands,genders:genders,measures:measures});
  },
  createvariation: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'createvariation')){
      throw 'forbidden';
    }
    let error = null;
    try{
      await Variation.create({
        name:req.body.name.trim().toLowerCase(),
        gender:req.body.gender ? req.body.gender : null,
        category: req.body.category ? req.body.category : null,
        seller: req.body.seller ? req.body.seller : null,
        cm:req.body.cm ? req.body.cm : null,
        col:req.body.col ? req.body.col : null,
        mx:req.body.mx ? req.body.mx : null,
        us:req.body.us ? req.body.us : null,
        eu:req.body.eu ? req.body.eu : null,
        wide:req.body.wide ? req.body.wide : null,
        unit:req.body.unit ? req.body.unit : 1,
        measure:req.body.measure ? req.body.measure : 'unidad',
        packageunits: req.body.packageunits ? req.body.packageunits : 1,
        manufacturer: req.body.brand ? req.body.brand : null,
      });
    }catch(err){
      error = err;
    }
    if (error===undefined || error===null){
      return res.redirect('/variations');
    }else{
      return res.redirect('/variations?error='+error);
    }
  },
  editvariation: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'editvariation')){
      throw 'forbidden';
    }
    let error = null;
    try{
      await Variation.updateOne({id:req.param('id')}).set({
        name:req.body.name.trim().toLowerCase(),
        gender:req.body.gender ? req.body.gender : null,
        category: req.body.category ? req.body.category : null,
        seller: req.body.seller ? req.body.seller : null,
        cm:req.body.cm ? req.body.cm : null,
        col:req.body.col ? req.body.col : null,
        mx:req.body.mx ? req.body.mx : null,
        us:req.body.us ? req.body.us : null,
        eu:req.body.eu ? req.body.eu : null,
        wide:req.body.wide ? req.body.wide : null,
        unit:req.body.unit ? req.body.unit : 1,
        measure:req.body.measure ? req.body.measure : 'unidad',
        packageunits: req.body.packageunits ? req.body.packageunits : 1,
        manufacturer: req.body.brand ? req.body.brand : null,
      });
    }catch(err){
      error = err;
    }
    if (error===undefined || error===null){
      return res.redirect('/variations');
    }else{
      return res.redirect('/variations?error='+error);
    }
  }
};

