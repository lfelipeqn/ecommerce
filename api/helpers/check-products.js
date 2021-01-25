module.exports = {


  friendlyName: 'Product checker service',


  description: 'Check and validate a product list',


  inputs: {
    product: { type: 'ref' },
    seller: { type: 'string' },
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async (inputs, exits) => {
    let pro = {};
    let gen = null;
    pro.name = inputs.product.name.toLowerCase().trim();

    if(!inputs.product.reference){
      throw new Error(`${pro.name} sin referencia`);
    }

    pro.reference = inputs.product.reference.toUpperCase().trim();
    pro.description = inputs.product.description.trim();
    pro.descriptionShort = inputs.product.descriptionShort.trim();
    pro.color  = inputs.product.color || '';
    let textPredictor = inputs.product.textLink ? inputs.product.textLink : inputs.product.name+' '+inputs.product.reference;

    if(inputs.product.manufacturer){
      let brand = (await Manufacturer.findOne({ name: inputs.product.manufacturer.toLowerCase() }));
      if(!brand){
        throw new Error(`Ref: ${pro.reference} : ${inputs.product.manufacturer.toLowerCase()} esta marca no se encuentra registrada`);
      }
      pro.manufacturer = brand.id;
    }else{
      throw new Error(`Ref: ${pro.reference} : ${pro.name} sin marca`);
    }

    let color = await sails.helpers.tools.findColor(`${pro.color ? (textPredictor + ' ' + pro.color) : textPredictor}`);
    if(color && color.length > 0){
      pro.mainColor = color[0];
    }else{
      throw new Error(`Ref: ${pro.reference} : ${pro.name} sin color`);
    }

    let gender = await sails.helpers.tools.findGender(textPredictor);
    if (gender && gender.length>0) {
      pro.gender = gender[0];
      gen = await Gender.findOne({id:gender[0]});
    } else {
      pro.gender = (await Gender.findOne({ name: 'unisex' })).id;
    }
    let cats = await sails.helpers.tools.findCategory(textPredictor + ' ' + gen.name + ' ' + inputs.product.manufacturer);
    if(cats.length>0){
      pro.categories = cats;
      let main = await Category.find({id:cats}).sort('level DESC');
      pro.mainCategory = main[0].id;
    }else{
      throw new Error(`Ref: ${pro.reference} : ${inputs.product.manufacturer.toLowerCase()} no se pudo identificar la categoria`);
    }




    if (inputs.product.tax) {
      tax = (await Tax.findOne({ value: inputs.product.tax.rate }));
      if(tax)
      {pro.tax = tax.id;}
    } else {
      tax  = (await Tax.findOne({ value: 0 }));
      if(tax)
      {pro.tax = tax.id;}
    }

    pro.seller = inputs.seller;
    pro.externalId = inputs.product.externalId || '';
    pro.register = inputs.product.register || '';
    pro.active = inputs.product.active;
    pro.width = (inputs.product.width === undefined || inputs.product.width === null || inputs.product.width < 1) ? 15 : inputs.product.width;
    pro.height = (inputs.product.height === undefined || inputs.product.height === null || inputs.product.height < 1) ? 15 : inputs.product.height;
    pro.length = (inputs.product.length === undefined || inputs.product.length === null || inputs.product.length < 1) ? 32 : inputs.product.length;
    pro.weight = (inputs.product.weight === undefined || inputs.product.weight === null || inputs.product.weight === 0) ? 1 : inputs.product.weight;
    pro.price =  inputs.product.price;
    pro.product_weight =  inputs.product.product_weight;

    return exits.success(pro);

  }

};
