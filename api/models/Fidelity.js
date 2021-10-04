/**
 * Fidelity.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    concept:{type:'string'},
    user:{model:'user',required:true},
    order:{model:'order'},
    status:{model:'orderstate'},
    points:{type:'number',required:true},
    pointvalue:{type:'number',required:true}

  },

};

