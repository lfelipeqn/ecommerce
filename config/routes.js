/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  /* ----- FRONT ROUTES  -----*/
  '/': 'IndexController.index',
  'POST /login' : {action:'login'},
  '/logout' : {action:'logout'},
  'GET /list/category/:id' : 'CategoryController.listcategory',
  'GET /list/product/:id' : 'ProductController.listproduct',
  'GET /cart' : 'CartController.viewcart',
  'PUT /cart' : 'CartController.addtocart',
  'GET /register' : 'UserController.registerform',
  'POST /register' : 'UserController.createuser',
  'POST /verify' : 'UserController.validatemail',
  'GET /addresses' : 'AddressController.addresses',
  'GET /address/:id?' : 'AddressController.address',
  'POST /address/create' : 'AddressController.newaddress',
  'POST /address/edit/:id' : 'AddressController.editaddress',
  'GET /address/delete/:id' : 'AddressController.deleteaddress',
  'GET /checkout' : 'IndexController.checkout',
  'POST /order' : 'OrderController.createorder',
  /* ----- FIN FRONT ROUTES  -----*/
  /* ----- ADMIN ROUTES  -----*/
  'GET /manufacturers/:action?/:id?' : 'ManufacturersController.listbrands',
  'POST /manufacturer/create': 'ManufacturersController.addbrand',
  'PUT /manufacturers/:id' : 'ManufacturersController.brandstate',
  'GET /categories/list/:id?': 'CategoryController.showcategories',
  'GET /categories/:id' : 'CategoryController.getchildren',
  'GET /parent/:id' : 'CategoryController.getparent',
  'POST /categories/create/:id?': 'CategoryController.addcategory',
  'PUT /categories/:id' : 'CategoryController.categorystate',
  'POST /categories/edit/:id' : 'CategoryController.editcategory',
  'GET /sellers/:action?/:id?' : 'SellerController.showsellers',
  'POST /seller/create' : 'SellerController.createseller',
  'PUT /seller/:id' : 'SellerController.sellerstate',
  'POST /seller/edit/:id' : 'SellerController.editseller',
  'GET /colors/:action?/:id?' : 'ColorController.showcolors',
  'POST /color/create' : 'ColorController.createcolor',
  'POST /color/edit/:id' : 'ColorController.editcolor',
  'GET /products/:action?/:id?' : 'ProductController.showproducts',
  'POST /product/create' : 'ProductController.createproduct',
  'POST /product/images' : 'ProductController.productimages',
  'PUT /image/:id' : 'ProductController.setcover',
  'PUT /images/remove/:id' : 'ProductController.removeimage',
  'PUT /products/:id' : 'ProductController.productstate',
  'POST /products/variations/:id' : 'ProductController.productvariations',
  'DELETE /variations/remove/:id' : 'ProductController.deletevariations',
  'GET /taxes/:action?/:id?' : 'TaxController.showtaxes',
  'POST /tax/create' : 'TaxController.createtax',
  'POST /tax/edit/:id' : 'TaxController.edittax',
  'GET /variations/:action?/:id?':'VariationController.showvariations',
  'POST /variation/create':'VariationController.createvariation',
  'POST /variation/edit/:id':'VariationController.editvariation',
  'GET /suppliers/:action?/:id?' : 'SupplierController.showsuppliers',
  'POST /supplier/create' : 'SupplierController.createsupplier',
  'PUT /supplier/:id' : 'SupplierController.supplierstate',
  'POST /supplier/edit/:id' : 'SupplierController.editsupplier',

  'GET /countries/:action?/:id?' : 'CountriesController.showcountries',
  'POST /country/create':'CountriesController.createcountry',
  'POST /country/edit/:id':'CountriesController.editcountry',
  'PUT /country/:id' : 'CountriesController.countrystate',

  'GET /regions/:action?/:id?' : 'CountriesController.showregions',
  'POST /region/create':'CountriesController.createregion',
  'POST /region/edit/:id':'CountriesController.editregion',
  'PUT /region/:id' : 'CountriesController.regionstate',

  'GET /cities/:region/:action?/:id?' : 'CountriesController.showcities',
  'POST /city/create':'CountriesController.createcity',
  'POST /city/edit/:id':'CountriesController.editcity',
  'PUT /city/:id' : 'CountriesController.citystate',

  'GET /find/regions/:id' : 'CountriesController.countryregions',
  'GET /find/cities/:id' : 'CountriesController.regioncities',

  'GET /carriers/:action?/:id?' : 'CarrierController.showcarriers',
  'POST /carrier/create' : 'CarrierController.createcarrier',
  'PUT /carrier/:id' : 'CarrierController.carrierstate',
  'POST /carrier/edit/:id' : 'CarrierController.editcarrier',

  'GET /order/state/:action?/:id?' : 'OrderController.liststates',
  'POST /orderstate/create' : 'OrderController.stateadd',
  'POST /orderstate/edit/:id' : 'OrderController.stateedit',
  'PUT /orderstate/:id' : 'OrderController.validstate',
  'GET /orders/:action?/:id?' : 'OrderController.listorders',
  'GET /discounts/:action?/:id?' : 'DiscountController.discounts',
  'POST /discount/create' : 'DiscountController.creatediscount',
  'PUT /order/update' : 'OrderController.updateorder'
  /* ----- FIN ADMIN ROUTES  -----*/

  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
