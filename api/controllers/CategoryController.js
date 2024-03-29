/**
 * CategoryController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  showcategories: async function (req,res) {
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'showcategories')){
      throw 'forbidden';
    }

    var error = null;
    let action = null;
    let childs = null;
    let id = null;
    let category = null;
    let parentId = 0;
    if(req.param('id')){
      id = req.param('id');
      category = await Category.findOne({id:id}).populate('parent');
      childs = await sails.helpers.categoryChildren(category.id);
      let parent = await Category.findOne({id:category.parent.id});
      parentId = parent.id;
    }else{
      category = await Category.findOne({name:'inicio'});
      childs = await sails.helpers.categoryChildren(category.id);
      parentId = category.id;
    }
    if(req.param('action')){
      action = req.param('action');
      childs['children'] = [await Category.findOne({name:'inicio'})];
    }
    return res.view('pages/catalog/categories',{layout:'layouts/admin',categories:childs.children,action:action,error:error,current:category,parent:parentId});
  },
  addcategory: async function(req,res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'addcategory')){
      throw 'forbidden';
    }
    var isActive=false;
    var error = null;
    if(req.body.activo==='on'){isActive=true;}
    let current = await Category.findOne({id:req.body.current});
    let dafiticat = '';
    let liniocat = '';
    let liniomxcat = '';
    let mercadolibrecat = '';
    let mercadolibremxcat = '';
    let walmartcat = '';
    if(req.body['dafiti[]']!==undefined){
      if(typeof req.body['dafiti[]']!=='string'){
        dafiticat = req.body['dafiti[]'].join(',');
      }else{
        dafiticat = req.body['dafiti[]'];
      }
    }
    if(req.body['linio[]']!==undefined){
      if(typeof req.body['linio[]']!=='string'){
        liniocat = req.body['linio[]'].join(',');
      }else{
        liniocat = req.body['linio[]'];
      }
    }
    if(req.body['liniomx[]']!==undefined){
      if(typeof req.body['liniomx[]']!=='string'){
        liniomxcat = req.body['liniomx[]'].join(',');
      }else{
        liniomxcat = req.body['liniomx[]'];
      }
    }
    if(req.body['mercadolibre[]']!==undefined){
      if(typeof req.body['mercadolibre[]']!=='string'){
        mercadolibrecat = req.body['mercadolibre[]'].join(',');
      }else{
        mercadolibrecat = req.body['mercadolibre[]'];
      }
    }
    if(req.body['mercadolibremx[]']!==undefined){
      if(typeof req.body['mercadolibremx[]']!=='string'){
        mercadolibremxcat = req.body['mercadolibremx[]'].join(',');
      }else{
        mercadolibremxcat = req.body['mercadolibremx[]'];
      }
    }
    if(req.body['walmart[]']!==undefined){
      if(typeof req.body['walmart[]']!=='string'){
        walmartcat = req.body['walmart[]'].join(',');
      }else{
        walmartcat = req.body['walmart[]'];
      }
    }
    try{
      let filename = await sails.helpers.fileUpload(req,'logo',2000000,'images/categories');
      await Category.create({
        name:req.body.nombre.trim().toLowerCase(),
        logo:filename[0].filename,
        description:req.body.descripcion,
        tags: req.body.tags ? req.body.tags : '',
        dafiti:dafiticat,
        linio: liniocat,
        liniomx: liniomxcat,
        mercadolibre: mercadolibrecat,
        mercadolibremx: mercadolibremxcat,
        walmart: walmartcat,
        parent:current.id,
        active:isActive,
        url:(current.name.trim().toLowerCase().replace(/\s/g,'-'))+'-'+(req.body.nombre.trim().toLowerCase()).replace(/\s/g,'-'),
        level:current.level+1
      }).fetch();
    }catch(err){
      error = err.msg;
      if(err.code==='badRequest'){
        await Category.create({
          name:req.body.nombre.trim().toLowerCase(),
          description:req.body.descripcion,
          tags: req.body.tags ? req.body.tags : '',
          parent:current.id,
          dafiti:dafiticat,
          linio: liniocat,
          liniomx: liniomxcat,
          mercadolibre: mercadolibrecat,
          mercadolibremx: mercadolibremxcat,
          walmart: walmartcat,
          active:isActive,
          url:(current.name.trim().toLowerCase().replace(/\s/g,'-'))+'-'+(req.body.nombre.trim().toLowerCase()).replace(/\s/g,'-'),
          level:current.level+1
        }).fetch();
      }
    }

    await Category.updateOne({id:current.id}).set({hasChildren:true});

    if (error===undefined || error===null || error.code==='badRequest'){
      return res.redirect('/categories/list');
    }else{
      return res.redirect('/categories/list?error='+error);
    }
  },
  editcategory: async function(req,res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'editcategory')){
      throw 'forbidden';
    }
    var isActive=false;
    var error = null;
    const route = 'images/categories';
    let category = await Category.findOne({id:req.param('id')})
    let parent = await Category.findOne({id:req.body.current});
    let dafiticat = '';
    let liniocat = '';
    let liniomxcat = '';
    let mercadolibrecat = '';
    let mercadolibremxcat = '';
    let walmartcat = '';
    if(req.body['dafiti[]']!==undefined){
      if(typeof req.body['dafiti[]']!=='string'){
        dafiticat = req.body['dafiti[]'].join(',');
      }else{
        dafiticat = req.body['dafiti[]'];
      }
    }
    if(req.body['linio[]']!==undefined){
      if(typeof req.body['linio[]']!=='string'){
        liniocat = req.body['linio[]'].join(',');
      }else{
        liniocat = req.body['linio[]'];
      }
    }
    if(req.body['liniomx[]']!==undefined){
      if(typeof req.body['liniomx[]']!=='string'){
        liniomxcat = req.body['liniomx[]'].join(',');
      }else{
        liniomxcat = req.body['liniomx[]'];
      }
    }
    if(req.body['mercadolibre[]']!==undefined){
      if(typeof req.body['mercadolibre[]']!=='string'){
        mercadolibrecat = req.body['mercadolibre[]'].join(',');
      }else{
        mercadolibrecat = req.body['mercadolibre[]'];
      }
    }
    if(req.body['mercadolibremx[]']!==undefined){
      if(typeof req.body['mercadolibremx[]']!=='string'){
        mercadolibremxcat = req.body['mercadolibremx[]'].join(',');
      }else{
        mercadolibremxcat = req.body['mercadolibremx[]'];
      }
    }
    if(req.body['walmart[]']!==undefined){
      if(typeof req.body['walmart[]']!=='string'){
        walmartcat = req.body['walmart[]'].join(',');
      }else{
        walmartcat = req.body['walmart[]'];
      }
    }
    if(req.body.activo==='on'){isActive=true;}
    let body = {
      name:req.body.nombre,
      description:req.body.descripcion,
      tags: req.body.tags ? req.body.tags : '',
      parent:parent.id,
      url:(parent.name.trim().toLowerCase().replace(/\s/g,'-'))+'-'+(category.name.trim().toLowerCase()).replace(/\s/g,'-'),
      active:isActive,
      level:parent.level+1
    };

    if(dafiticat){body.dafiti=dafiticat}
    if(liniocat){body.linio=liniocat}
    if(liniomxcat){body.liniomx=liniomxcat}
    if(mercadolibrecat){body.mercadolibre=mercadolibrecat}
    if(mercadolibremxcat){body.mercadolibremx=mercadolibremxcat}
    if(walmartcat){body.walmart=walmartcat}
    
    try{
      uploaded = await sails.helpers.fileUpload(req,'logo',2000000,route);
      if(uploaded){
        body.logo=uploaded[0].filename;
      }
      await Category.updateOne({id:category.id}).set(body);
    }catch(err){
      error = err.msg;
      if(err.code==='badRequest'){
        await Category.updateOne({id:category.id}).set(body);
      }
    }
    if(req.body.parent!==parent.id){
      await Category.removeFromCollection(req.body.parent,'children').members([category.id]);
      await Category.addToCollection(parent.id,'children',category.id);
      await Category.updateOne({id:parent.id}).set({hasChildren:true});
      
      let categoryRoute = await sails.helpers.tools.buildTree(category.id); //Construimos el Arbol Ascendente a partir de la categoría modificada, solo si el Padre fue modificado
      let catProducts = await Category.findOne({id:category.id}).populate('products'); //Obtenemos la lista de Productos de la categoria modificada.

      for(let p of catProducts.products){
        if(!categoryRoute.includes(p.mainCategory)){categoryRoute.push(p.mainCategory);} //Se mantiene la categoría principal del producto
        await Product.replaceCollection(p.id,'categories').members(categoryRoute); //Se reemplaza la ruta anterior del árbol de categorias
        categoryRoute.splice(categoryRoute.indexOf(p.mainCategory), 1); //Se elimina la categoria principal de la nueva ruta para evitar cambiar o agregar categorias incorrectas.
      }

    }

    if (error===undefined || error===null || error.code==='badRequest'){
      return res.redirect('/categories/list');
    }else{
      return res.redirect('/categories/list?error='+error);
    }
  },
  deletecategory:async(req, res)=>{
    if (!req.isSocket) {
      return res.badRequest();
    }
    let category = await Category.findOne({id:req.body.category})
    .populate('parent')
    .populate('children')
    .populate('products');
    if(category.children.length>0){
      for(let c in category.children){
        await Category.updateOne({id:category.children[c].id}).set({
          parent:category.parent.id
        });
      }
      await Category.updateOne({id:category.parent.id}).set({hasChildren:true});
    }
    if(category.products.length>0){
      for(let p in category.products){
        await Product.removeFromCollection(category.products[p].id,'categories').members([category.id]);
        await Product.addToCollection(category.products[p].id,'categories').members([category.parent.id]);
      }
    }
    await Category.destroyOne({id:category.id});
    return res.send('deleted');
  },
  getchildren: async function(req,res){
    if (!req.isSocket) {
      return res.badRequest();
    }
    var id = req.param('id');
    var childs = await Category.findOne({id:id}).populate('children');

    return res.send(childs.children);
  },
  getparent: async function(req,res){
    if (!req.isSocket) {
      return res.badRequest();
    }
    var id = req.param('id');
    var parent = await Category.findOne({id:id}).populate('parent');

    return res.send(parent);
  },
  categorystate: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'categorystate')){
      throw 'forbidden';
    }
    if (!req.isSocket) {
      return res.badRequest();
    }
    var id = req.param('id');
    var state = req.param('active');
    var updatedCategory = await Category.updateOne({id:id}).set({active:state});
    return res.send(updatedCategory);
  },
  dafiticategories: async (req,res)=>{
    if(!req.isSocket){
      return res.badrequest();
    }
    try{
      let channel = await Channel.find({name: 'dafiti'});
      let integration = await Integrations.find({where:{channel:channel[0].id},limit:1});
      if(integration.length>0){
        let route = await sails.helpers.channel.dafiti.sign(integration[0].id,'GetCategoryTree',integration[0].seller);
        let response = await sails.helpers.request(channel[0].endpoint,'/?'+route,'GET');
        return res.ok(JSON.parse(response));
      }else{
        return res.serverError();
      }
    }catch(err){
      return res.serverError(err);
    }
  },
  liniocategories: async (req,res)=>{
    if(!req.isSocket){
      return res.badrequest();
    }
    try{
      let channel = await Channel.find({name: 'linio'});
      let integration = await Integrations.find({where:{channel:channel[0].id},limit:1});
      if(integration.length>0){
        let route = await sails.helpers.channel.linio.sign(integration[0].id,'GetCategoryTree',integration[0].seller);
        let response = await sails.helpers.request(channel[0].endpoint,'/?'+route,'GET');
        return res.ok(JSON.parse(response));
      }else{
        return res.serverError();
      }
    }catch(err){
      return res.serverError(err);
    }
  },
  liniomxcategories: async (req,res)=>{
    if(!req.isSocket){
      return res.badrequest();
    }
    try{
      let channel = await Channel.find({name: 'liniomx'});
      let integration = await Integrations.find({where:{channel:channel[0].id},limit:1});
      if(integration.length>0){
        let route = await sails.helpers.channel.liniomx.sign(integration[0].id,'GetCategoryTree',integration[0].seller);
        let response = await sails.helpers.request(channel[0].endpoint,'/?'+route,'GET');
        return res.ok(JSON.parse(response));
      }else{
        return res.serverError();
      }
    }catch(err){
      return res.serverError(err);
    }
  },
  walmartcategories: async (req,res)=>{
    if(!req.isSocket){
      return res.badrequest();
    }
    try{
      let channel = await Channel.find({name: 'walmart'});
      let integration = await Integrations.find({where:{channel:channel[0].id},limit:1});
      if(integration.length>0){
        let response = await sails.helpers.channel.walmart.categories();
        return res.ok(response);
      }else{
        return res.serverError();
      }
    }catch(err){
      return res.serverError(err);
    }
  },
  mercadolibrecategories: async (req,res)=>{
    if(!req.isSocket){
      return res.badrequest();
    }
    try{
      let body = await sails.helpers.channel.mercadolibre.findCategory(req.body.category_name)
      .intercept((err)=>{
        return new Error(err.message);
      });
      return res.ok(body);
    }catch(err){
      return res.serverError(err);
    }
  },
  mercadolibremxcategories: async (req,res)=>{
    if(!req.isSocket){
      return res.badrequest();
    }
    try{
      let body = await sails.helpers.channel.mercadolibremx.findCategory(req.body.category_name)
      .intercept((err)=>{
        return new Error(err.message);
      });
      return res.ok(body);
    }catch(err){
      return res.serverError(err);
    }
  },
  categoryindex: async (req, res) => {
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if ((rights.name !== 'superadmin') && !_.contains(rights.permissions,'updateindex')) {
      throw 'forbidden';
    }
    let documents = [];
    let categories = await Category.find({level:{'>=':4}});

    categories.forEach(pr => {
      let doc = {
        type: req.param('action'), // add or delete
        id: pr.id
      };

      if (req.param('action') === 'add') {
        doc['fields'] = {
          id: pr.id,
          category: pr.name
        };
      }
      documents.push(doc);
    });
    let AWS = require('aws-sdk');
    AWS.config.loadFromPath('./config.json');
    let endpoint = 'doc-predictor-1ecommerce-if3tuwyqkbztsy2a2j3voan7bu.us-east-1.cloudsearch.amazonaws.com';
    var csd = new AWS.CloudSearchDomain({ endpoint: endpoint });
    var params = {
      contentType: 'application/json', // required
      documents: JSON.stringify(documents) // required
    };
    csd.uploadDocuments(params, (err, data) => {
      if (err) { console.log(err, err.stack); } // an error occurred
      let index = new AWS.CloudSearch();
      index.indexDocuments({ DomainName: 'predictor-1ecommerce' }, (err, data) => {
        if (err) { console.log(err); }
        console.log(data);
        return res.redirect('/inicio');
      });
    });
  },
  categoryscheme: async (req,res) =>{
    let AWS = require('aws-sdk');
    AWS.config.loadFromPath('./config.json');
    let cloudsearch = new AWS.CloudSearch();
    let categories = await Category.find({
      where:{level:{'>=':4}},
      select: ['name', 'tags']
      /*skip:50,*/
      //limit:560
    });
    let params = {
      AnalysisScheme: { /* required */
        AnalysisSchemeLanguage: 'es', /* required */
        AnalysisSchemeName: 'category_scheme', /* required */
        AnalysisOptions: {
          AlgorithmicStemming: 'full',
          //StemmingDictionary: 'STRING_VALUE',
          Stopwords: JSON.stringify(["tipo","pack","tela","moda","adultos","adulto","am","pm","fm","all","dr","ds","in","de","la","que","el","en","y","a","los","del","se","las","por","un","para","con","no","una","su","al","lo","como","más","pero","sus","le","ya","o","este","sí","porque","esta","entre","cuando","muy","sin","sobre","también","me","hasta","hay","donde","quien","desde","todo","nos","durante","todos","uno","les","ni","contra","otros","ese","eso","ante","ellos","e","esto","mí","antes","algunos","qué","unos","yo","otro","otras","otra","él","tanto","esa","estos","mucho","quienes","nada","muchos","cual","poco","ella","estar","estas","algunas","algo","nosotros","mi","mis","tú","te","ti","tu","tus","ellas","nosotras","vosotros","vosotras","os","mío","mía","míos","mías","tuyo","tuya","tuyos","tuyas","suyo","suya","suyos","suyas","nuestro","nuestra","nuestros","nuestras","vuestro","vuestra","vuestros","vuestras","esos","esas","estoy","estás","está","estamos","estáis","están","esté","estés","estemos","estéis","estén","estaré","estarás","estará","estaremos","estaréis","estarán","estaría","estarías","estaríamos","estaríais","estarían","estaba","estabas","estábamos","estabais","estaban","estuve","estuviste","estuvo","estuvimos","estuvisteis","estuvieron","estuviera","estuvieras","estuviéramos","estuvierais","estuvieran","estuviese","estuvieses","estuviésemos","estuvieseis","estuviesen","estando","estado","estada","estados","estadas","estad","he","has","ha","hemos","habéis","han","haya","hayas","hayamos","hayáis","hayan","habré","habrás","habrá","habremos","habréis","habrán","habría","habrías","habríamos","habríais","habrían","había","habías","habíamos","habíais","habían","hube","hubiste","hubo","hubimos","hubisteis","hubieron","hubiera","hubieras","hubiéramos","hubierais","hubieran","hubiese","hubieses","hubiésemos","hubieseis","hubiesen","habiendo","habido","habida","habidos","habidas","soy","eres","es","somos","sois","son","sea","seas","seamos","seáis","sean","seré","serás","será","seremos","seréis","serán","sería","serías","seríamos","seríais","serían","era","eras","éramos","erais","eran","fui","fuiste","fue","fuimos","fuisteis","fueron","fuera","fueras","fuéramos","fuerais","fueran","fuese","fueses","fuésemos","fueseis","fuesen","siendo","sido","tengo","tienes","tiene","tenemos","tenéis","tienen","tenga","tengas","tengamos","tengáis","tengan","tendré","tendrás","tendrá","tendremos","tendréis","tendrán","tendría","tendrías","tendríamos","tendríais","tendrían","tenía","tenías","teníamos","teníais","tenían","tuve","tuviste","tuvo","tuvimos","tuvisteis","tuvieron","tuviera","tuvieras","tuviéramos","tuvierais","tuvieran","tuviese","tuvieses","tuviésemos","tuvieseis","tuviesen","teniendo","tenido","tenida","tenidos","tenidas","tened"]),
        }
      },
      DomainName: 'predictor-1ecommerce' /* required */
    };
    let aliases = {
      groups: [
        ["cangurera","riñonera","canguro","cancgurera"],
        ["morral","mochila","tula"],
        ["hip hop","hiphop","hip-hop"],
        ["nailon","nylon"],
        ["medias","calcetines"],
        ["juego","set","kit"],
        ["binoculos","binoculares","binóculos"],
        ["sleeping bag","sleeping","saco dormir","bolsa dormir"],
        ["pava","sombrero"],
        ["balón","bola","pelota","balon"],
        ["panti","panties","panty"],
        ["campismo","camping","campamento","acampar","acampada"],
        ["portafolio","portfolio"],
        ["termo","caramañola","botilito","caramau00d1ola","carimañola"],
        ["pantaloneta","short","bermudas"],
        ["gorro","gorra","cachucha"],
        ["nevera","cooler","refrigerador"],
        ["fiambrera","portacomida","porta comida"],
        ["catre","cama"],
        ["conjunto deportivo","sudadera","pantalón sudadera","sudaderas","sweat pants"],
        ["camiseta polo","polo","tipo polo"],
        ["camiseta","camisetas","tshirt","t-shirt"],
        ["chaqueta","chamarra"],
        ["cinturón","correa"],
        ["abrigo","abrigos"],
        ["masculino","hombre","señor","caballero","ombre","macho","hombres","viejo","men","man"],
        ["femenino","mujer","dama","señora","mujeres","hembra","vieja","femenina","women","woman"],
        ["niño","muchacho","joven","junior masculino","infante","niños", "junior niño"],
        ["niña","muchacha","jovencita","junior femenino","infanta", "niñas", "junior niñas"],
        ["perro","perra","canino","canina","caninos", "perros cachorrros", "perro cachorro","perros"],
        ["gato","gata","felino","felina","felinos", "gatos cachorrros", "gato cachorro","gatos"],
        ["cicla","bicicleta","monareta"],
        ["moto","motocicleta"],
        ["auto","automovil","auto móvil","automobil"],
      ],
      aliases : {}
    };
    for(let category of categories){
      if(category.tags !== null && category.tags !== '' && category.tags.length >= 3  && category.tags !== ' '){
        let tags = category.tags.split(',').filter(x => x);
        aliases.aliases[category.name.trim().toLowerCase()] = tags.map(t => t.trim().toLowerCase());
      }
    }
    params.AnalysisScheme.AnalysisOptions.Synonyms = JSON.stringify(aliases);
    
    cloudsearch.defineAnalysisScheme(params, function(err, data) {
      if (err){throw 'Error de Esquema:'+err.message;} // an error occurred
      if(data){
        cloudsearch.indexDocuments({ DomainName: 'predictor-1ecommerce' }, (err, data) => {
          if (err) { throw 'Error Indexando: '+err.message};
          return res.redirect('/inicio');
        });
      }
    });
  }
};
