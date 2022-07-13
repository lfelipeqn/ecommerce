/**
 * FidelityPlan.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    fidelityPlan:{type:'string',required:true},
    typeFidelity:{
      type:'string',
      isIn:['Q','C'],
      required:true
    },
    amount:{type:'number', required:true}

  },

};

