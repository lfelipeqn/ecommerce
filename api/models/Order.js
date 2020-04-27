/**
 * Order.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    totalOrder:{
      type:'number',
      defaultsTo:0,
    },
    totalShipping:{
      type:'number',
      defaultsTo:0,
    },
    totalProducts:{
      type:'number',
      defaultsTo:0
    },
    totalDiscount:{
      type:'number',
      defaultsTo:0
    },
    conversionRate:{
      type:'number',
      defaultsTo:1,
    },
    customer:{
      model:'user',
      required:true,
    },
    addressDelivery:{
      model:'address'
    },
    cart:{
      model:'cart',
      required:true,
    },
    currentstatus:{
      model:'orderstate',
      required:true,
    },
    paymentMethod:{
      type:'string'
    },
    paymentId:{
      type:'string'
    },
    paymentOption:{
      type:'ref',
      defaultsTo:''
    },
    seller:{
      model:'seller'
    }

  },

};

