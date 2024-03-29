/**
 * Product.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    type:{type:'string', isIn:['product','prize','service'],defaultsTo:'product'},
    name: {type:'string'},
    reference:{type:'string'},
    description:{type:'string'},
    descriptionShort:{type:'string'},
    group:{type:'string'},
    active:{type:'boolean',required:true},
    tax:{model:'tax'},
    mainCategory: {model:'category'},
    mainColor: {model:'color'},
    manufacturer: {model:'manufacturer'},
    gender:{model:'gender'},
    externalId:{type:'string'},
    stock:{type:'boolean',defaultsTo:false},
    seller: {model:'seller'},
    fidelityplan:{model:'fidelityplan'},
    activity:{type:'string'},
    categories:{
      collection:'category',
      via:'products'
    },
    images:{
      collection: 'productimage',
      via: 'product'
    },
    variations:{
      collection:'productvariation',
      via:'product'
    },
    channels:{
      collection:'productchannel',
      via:'product'
    },
    features:{
      collection:'productfeature',
      via:'product'
    },
    suppliers:{
      collection:'supplier',
      via:'products'
    },
    discount:{
      collection:'catalogdiscount',
      via:'products'
    }
  },
};

