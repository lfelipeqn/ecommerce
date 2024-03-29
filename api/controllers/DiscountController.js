/**
 * DiscountController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  discounts: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'discounts')){
      throw 'forbidden';
    }
    let moment = require('moment');
    let error = req.param('error') ? req.param('error') : null;
    let action = req.param('action') ? req.param('action') : null;
    let id = req.param('id') ? req.param('id') : null;
    let root = await Category.findOne({name:'inicio'});
    let discount = null;
    let integrations = null;

    if(id){
      discount = await CatalogDiscount.findOne({id:id})
      .populate('seller')
      .populate('integrations');
      integrations = await Integrations.find({seller:discount.seller.id});
    }
    let discounts = null;
    let sellers = null;
    if(rights.name!=='superadmin' && rights.name!=='admin'){
      sellers = await Seller.find({id:req.session.user.seller,active:true});
      discounts = await CatalogDiscount.find({seller:req.session.user.seller}).sort([{createdAt: 'DESC'}]).populate('seller');
    }else{
      sellers = await Seller.find({active:true});
      discounts = await CatalogDiscount.find().sort([{createdAt: 'DESC'}]).populate('seller');
    }
    let genders = await Gender.find();
    let colors = await Color.find();
    let manufacturers = await Manufacturer.find();
    return res.view('pages/discounts/discounts', {layout:'layouts/admin',error:error, discounts:discounts, integrations: integrations, sellers:sellers, genders:genders, colors:colors,manufacturers:manufacturers,action:action, discount:discount, moment:moment, root:root});
  },
  creatediscount: async (req, res) => {
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'discounts')){
      throw 'forbidden';
    }
    let moment = require('moment');
    let range = req.body.range.split(' - ');
    let action = req.param('action');
    let discount = null;

    try{

      let products = await Product.find({seller:req.body.seller}).populate('categories');
      if(req.body.category){
        for(let p of products){
          for(let pc of p.categories){
            if(pc.id===req.body.category){
              p.incategory = req.body.category;
            }
          }
        }
        products = products.filter(p => p.incategory === req.body.category);
      }
      if(req.body.manufacturer){products = products.filter(p => p.manufacturer===req.body.manufacturer);}
      if(req.body.color){products = products.filter(p => p.mainColor===req.body.color);}
      if(req.body.gender){products = products.filter(p => p.gender===req.body.gender);}

      if(products.length>0){
        let affected = [];
        for(let pr of products){
          if(!affected.includes(pr.id)){
            affected.push(pr.id);
          }
        }

        if(action==='edit'){
          discount = await CatalogDiscount.updateOne({id:req.param('id')}).set({
            name:req.body.name.toLowerCase().trim(),
            from:moment(range[0]).valueOf(),
            to:moment(range[1]).valueOf(),
            type:req.body.type,
            value:req.body.value,
            seller:req.body.seller,
            category:req.body.category ? req.body.category : null,
            manufacturer:req.body.manufacturer ? req.body.manufacturer : null,
            color:req.body.color ? req.body.color : null,
            gender:req.body.gender ? req.body.gender : null
          });
          await CatalogDiscount.replaceCollection(discount.id,'products').members(affected);
          if(req.body.integrations){
            await CatalogDiscount.replaceCollection(discount.id,'integrations').members(req.body.integrations);
          }else{
            let intlist = [];
            let integrations = await Integrations.find({where:{seller:req.body.seller},select:['id']});
            for(let integration of integrations){
              if(!intlist.includes(integration.id)){intlist.push(integration.id);}
            }
            await CatalogDiscount.replaceCollection(discount.id,'integrations').members(intlist);
          }
        }else{
          discount = await CatalogDiscount.create({
            name:req.body.name.toLowerCase().trim(),
            from:moment(range[0]).valueOf(),
            to:moment(range[1]).valueOf(),
            type:req.body.type,
            value:req.body.value,
            seller:req.body.seller,
            category:req.body.category ? req.body.category : null,
            manufacturer:req.body.manufacturer ? req.body.manufacturer : null,
            color:req.body.color ? req.body.color : null,
            gender:req.body.gender ? req.body.gender : null
          }).fetch();

          await CatalogDiscount.addToCollection(discount.id,'products').members(affected);
          if(req.body.integrations){
            await CatalogDiscount.addToCollection(discount.id,'integrations').members(req.body.integrations);
          }else{
            let intlist = [];
            let integrations = await Integrations.find({where:{seller:req.body.seller},select:['id']});
            for(let integration of integrations){
              if(!intlist.includes(integration.id)){intlist.push(integration.id);}
            }
            await CatalogDiscount.addToCollection(discount.id,'integrations').members(intlist);
          }
        }
      }else{
        let msg='No hay productos que coincidan con los criterios seleccionados. Por favor intenta nuevamente';
        return res.redirect('/discounts?error='+msg);
      }
    }catch(err){
      return res.redirect('/discounts?error='+err);
    }
    return res.redirect('/discounts');
  },
  coupons: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'discounts')){
      throw 'forbidden';
    }
    let moment = require('moment');
    let error = req.param('error') ? req.param('error') : null;
    let action = req.param('action') ? req.param('action') : null;
    let id = req.param('id') ? req.param('id') : null;
    let discount = null;
    if(id){
      discount = await CartDiscount.findOne({id:id});
    }
    let discounts = await CartDiscount.find().sort([{createdAt: 'DESC'}]);
    return res.view('pages/discounts/coupons', {layout:'layouts/admin',error:error, discounts:discounts, action:action, discount:discount, moment:moment});
  },
  createcoupon:async (req, res)=>{
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'discounts')){
      throw 'forbidden';
    }
    let moment = require('moment');
    let range = req.body.range.split(' - ');

    try{
      await CartDiscount.create({
        name:req.body.name.toLowerCase().trim(),
        code: req.body.code,
        from:moment(range[0]).valueOf(),
        to:moment(range[1]).valueOf(),
        type:req.body.type,
        value:req.body.value
      });
    }catch(err){
      return res.redirect('/coupons?error='+err);
    }
    return res.redirect('/coupons');
  },
  editcoupon:async (req, res)=>{
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'discounts')){
      throw 'forbidden';
    }
    let moment = require('moment');
    let range = req.body.range.split(' - ');

    try{
      await CartDiscount.updateOne({id:req.param('id')}).set({
        name:req.body.name.toLowerCase().trim(),
        code: req.body.code,
        from:moment(range[0]),
        to:moment(range[1]),
        type:req.body.type,
        value:req.body.value
      });
    }catch(err){
      return res.redirect('/coupons?error='+err);
    }
    return res.redirect('/coupons');
  },
  random:async(req,res)=>{
    if (!req.isSocket) {
      return res.badRequest();
    }
    let random = sails.helpers.strings.random();
    return res.send(random);
  },
  productdiscount: async (req, res) => {
    if (!req.isSocket) {
      return res.badRequest();
    }
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'discounts')){
      throw 'forbidden';
    }
    let moment = require('moment');
    let range = req.body.range.split(' - ');
    let discount = null;
    let affected = [];
    let product = await Product.findOne({id:req.body.product});

    discount = await CatalogDiscount.create({
      name:product.name.toLowerCase().trim(),
      from:moment(range[0]).valueOf(),
      to:moment(range[1]).valueOf(),
      type:req.body.type,
      value:req.body.value,
      seller:product.seller
    }).fetch();

    affected.push(product.id);

    await CatalogDiscount.addToCollection(discount.id,'products').members(affected);

    let intlist = [];
    let integrations = await Integrations.find({where:{seller:product.seller},select:['id']});
    for(let integration of integrations){
      if(!intlist.includes(integration.id)){intlist.push(integration.id);}
    }
    await CatalogDiscount.addToCollection(discount.id,'integrations').members(intlist);

    await sails.helpers.channel.channelSync(product);
    //let discounts = await Product.findOne({id:product.id}).populate('discount');

    return res.send(discount);
  },
  removepdiscount: async (req, res) =>{
    if (!req.isSocket) {
      return res.badRequest();
    }
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'discounts')){
      throw 'forbidden';
    }
    let members = [];
    try{
      members.push(req.body.product);
      await CatalogDiscount.removeFromCollection(req.body.discount,'products').members(members);
      let product = await Product.findOne({id:req.body.product});
      await sails.helpers.channel.channelSync(product);
      return res.send('ok');
    }catch(err){
      console.log(err);
      return res.send(err.message);
    }
  },
  findintegrations: async (req, res) =>{
    if(!req.isSocket){
      return res.badRequest();
    }
    let seller= req.param('seller');
    let integrations = await Integrations.find({where:{seller:seller},select:['name']});
    return res.send(integrations);
  },
  fidelity: async (req, res) =>{
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'discounts')){
      throw 'forbidden';
    }
    let error = req.param('error') ? req.param('error') : null;
    let moment = require('moment');
    let fidelities = await Fidelity.find({})
    .populate('user')
    .populate('order');

    return res.view('pages/discounts/fidelity', {layout:'layouts/admin',error:error,fidelities:fidelities,moment:moment});
  },
  fidelityplan: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'fideliyplan')){
      throw 'forbidden';
    }
    let error = req.param('error') ? req.param('error') : null;
    let action = req.param('action') ? req.param('action') : null;
    let id = req.param('id') ? req.param('id') : null;

    let fidelityplan = await FidelityPlan.find({});
    let planid = null;
    if(id){
      planid = await FidelityPlan.findOne({id:id});
    }

    return res.view('pages/discounts/fidelityplan', {layout:'layouts/admin',error, fidelityplan, planid, action});
  },
  createfidelityplan: async (req, res) => {
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'fideliyplan')){
      throw 'forbidden';
    }
    let action = req.param('action');

    try{
      if(action==='edit'){
        await FidelityPlan.updateOne({id:req.param('id')}).set({
          fidelityPlan:req.body.fidelityPlan.toLowerCase().trim(),
          typeFidelity:req.body.typeFidelity,
          amount:req.body.amount,
        });
      }else{
        await FidelityPlan.create({
          fidelityPlan:req.body.fidelityPlan.toLowerCase().trim(),
          typeFidelity:req.body.typeFidelity,
          amount:req.body.amount,
        });
      }
    }catch(err){
      return res.redirect('/fidelityplan?error='+err);
    }
    return res.redirect('/fidelityplan');
  },
};

