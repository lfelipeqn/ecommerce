/**
 * Variation.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name:{type:'string',required:true, maxLength:15},
    cm:{type:'number', allowNull:true},
    col:{type:'string', allowNull:true},
    mx:{type:'string', allowNull:true},
    us:{type:'string', allowNull:true},
    eu:{type:'string', allowNull:true},
    wide:{type:'number', allowNull:true},
    unit:{type:'number', allowNull:true},
    measure:{type:'string', isIn:['centímetro', 'gramo','mililitro','unidad']},
    gender:{model:'gender'},
    category:{model:'category'},
    seller:{model:'seller'},
    manufacturer:{model:'manufacturer'}
  },

};

