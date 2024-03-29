/**
 * CarrierController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  showcarriers: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'showcarriers')){
      throw 'forbidden';
    }
    let error= req.param('error') ? req.param('error') : null;
    let carrier = null;
    let action = req.param('action') ? req.param('action') : null;
    let id = req.param('id') ? req.param('id') : null;
    let carriers = await Carrier.find();
    if(id){
      carrier = await Carrier.findOne({id:id});
    }
    res.view('pages/carriers/carriers',{layout:'layouts/admin',carriers:carriers,action:action,carrier:carrier,error:error});
  },
  showpackets: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'showpackets')){
      throw 'forbidden';
    }
    let error= req.param('error') ? req.param('error') : null;
    let pack = null;
    let action = req.param('action') ? req.param('action') : null;
    let id = req.param('id') ? req.param('id') : null;
    let packages = await Packages.find();
    if(id){
      pack = await Packages.findOne({id:id});
    }
    res.view('pages/carriers/packages',{layout:'layouts/admin',packages:packages,action:action,pack:pack,error:error});
  },
  createpackage: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'createpackage')){
      throw 'forbidden';
    }
    let error=null;
    try{
      await Packages.create({
        packageName:req.body.packageName,
        width:req.body.width,
        height:req.body.height,
        length:req.body.length,
        weight:req.body.weight,
        packageunits: req.body.packageunits
      });
    }catch(err){
      error=err;
    }
    if (error===undefined || error===null){
      return res.redirect('/packets');
    }else{
      return res.redirect('/packets?error='+error);
    }
  },
  editpackage: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'editpackage')){
      throw 'forbidden';
    }
    let error=null;
    let id = req.param('id');
    try{

      await Packages.updateOne({id:id}).set({
        packageName:req.body.packageName,
        width:req.body.width,
        height:req.body.height,
        length:req.body.length,
        weight:req.body.weight,
        packageunits: req.body.packageunits
      });

    }catch(err){
      error=err;
      if(error.code==='badRequest'){
        await Packages.updateOne({id:id}).set({
          packageName:req.body.packageName,
          width:req.body.width,
          height:req.body.height,
          length:req.body.length,
          weight:req.body.weight,
          packageunits: req.body.packageunits
        });
      }
    }

    if (error===undefined || error===null || error.code==='badRequest'){
      return res.redirect('/packets');
    }else{
      return res.redirect('/packets?error='+error);
    }
  },
  createcarrier: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'createcarrier')){
      throw 'forbidden';
    }
    let error=null;
    let isActive = (req.body.activo==='on') ? true : false;
    try{
      let filename = await sails.helpers.fileUpload(req,'logo',2000000,'images/carriers');
      await Carrier.create({
        name:req.body.name.trim().toLowerCase(),
        url:req.body.url,
        logo: filename[0].filename,
        active:isActive});
    }catch(err){
      error=err;
    }
    if (error===undefined || error===null){
      return res.redirect('/carriers');
    }else{
      return res.redirect('/carriers?error='+error);
    }
  },
  editcarrier: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'editcarrier')){
      throw 'forbidden';
    }
    let error=null;
    let isActive = (req.body.activo==='on') ? true : false;
    let id = req.param('id');
    let route = 'images/carriers';
    try{
      uploaded = await sails.helpers.fileUpload(req,'logo',2000000,route);

      await Carrier.updateOne({id:id}).set({
        name:req.body.name.trim().toLowerCase(),
        url: req.body.url,
        logo: uploaded[0].filename,
        active:isActive});

    }catch(err){
      error=err;
      if(error.code==='badRequest'){
        await Carrier.updateOne({id:id}).set({
          name:req.body.name.trim().toLowerCase(),
          url: req.body.url,
          active:isActive});
      }
    }

    if (error===undefined || error===null || error.code==='badRequest'){
      return res.redirect('/carriers');
    }else{
      return res.redirect('/carriers?error='+error);
    }
  },
  carrierstate: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'carrierstate')){
      throw 'forbidden';
    }
    if (!req.isSocket) {
      return res.badRequest();
    }
    var id = req.param('id');
    var state = req.body.active;
    var updatedCarrier = await Carrier.updateOne({id:id}).set({active:state});
    return res.send(updatedCarrier);
  },
  shipment:async (req, res) =>{
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'shipment')){
      throw 'forbidden';
    }
    let tracking = req.param('tracking');
    let orders = await Order.find({tracking:tracking});
    let guia=null;
    let label=null;
    for(let order of orders){
      if(order.channel==='direct' || order.channel==='iridio' || (order.transport && order.transport === 'coordinadora')){
        guia = await sails.helpers.carrier.guia(tracking);
        label = await sails.helpers.carrier.label(tracking);
      }else if(order.channel==='dafiti'){
        let oitems = await OrderItem.find({order:order.id});
        let litems = [];
        for(let it of oitems){
          if(!litems.includes(it.externalReference)){
            litems.push(it.externalReference);
          }
        }
        let route = await sails.helpers.channel.dafiti.sign(order.integration,'GetDocument',order.seller,['OrderItemIds=['+litems.join(',')+']','DocumentType=shippingParcel']);
        let response = await sails.helpers.request('https://sellercenter-api.dafiti.com.co','/?'+route,'GET');
        let result = JSON.parse(response);
        guia = result.SuccessResponse.Body.Documents.Document.File;
      }else if(order.channel==='linio'){
        let oitems = await OrderItem.find({order:order.id});
        let litems = [];
        for(let it of oitems){
          if(!litems.includes(it.externalReference)){
            litems.push(it.externalReference);
          }
        }
        let route = await sails.helpers.channel.linio.sign(order.integration,'GetDocument',order.seller,['OrderItemIds=['+litems.join(',')+']','DocumentType=shippingParcel']);
        let response = await sails.helpers.request('https://sellercenter-api.linio.com.co','/?'+route,'GET');
        let result = JSON.parse(response);
        guia = result.SuccessResponse.Body.Documents.Document.File;
      }else if(order.channel==='liniomx'){
        let oitems = await OrderItem.find({order:order.id});
        let litems = [];
        for(let it of oitems){
          if(!litems.includes(it.externalReference)){
            litems.push(it.externalReference);
          }
        }
        let route = await sails.helpers.channel.liniomx.sign(order.integration,'GetDocument',order.seller,['OrderItemIds=['+litems.join(',')+']','DocumentType=shippingParcel']);
        let response = await sails.helpers.request('https://sellercenter-api.linio.com.mx','/?'+route,'GET');
        let result = JSON.parse(response);
        guia = result.SuccessResponse.Body.Documents.Document.File;
      }else if(order.channel==='mercadolibre'){
        guia = await sails.helpers.channel.mercadolibre.shipping(order);
      }else if(order.channel==='mercadolibremx'){
        guia = await sails.helpers.channel.mercadolibremx.shipping(order);
      }

      if(order.channel==='walmart'){
        guia = await sails.helpers.channel.walmart.shipping(order);
      }
    }
    return res.view('pages/pdf',{layout:'layouts/admin',guia:guia,label:label});
  },
  generateguides: async function(req, res){
    res.view('pages/carriers/generateguides',{layout:'layouts/admin'});
  },
  multipleguides: async function(req, res){
    const PDFDocument = require('pdf-lib').PDFDocument;
    let htmlPdf  = require('html-pdf');
    let orderState = await OrderState.findOne({name: 'aceptado'});
    let state = await OrderState.findOne({name: 'empacado'});
    let stateProcess = await OrderState.findOne({name: 'en procesamiento'});
    const dateStart = req.body.startDate;
    const dateEnd = req.body.endDate;
    let numbers = req.body.numbers;
    let ordersSelected = req.body.ordersSelected;
    const seller = req.session.user.seller;
    let orders = null;
    try {
      if (dateStart && dateEnd) {
        orders = await Order.find({
          where: {
            seller: seller,
            channel: ['linio', 'dafiti','liniomx'],
            currentstatus: [orderState.id, stateProcess.id],
            createdAt: { '>': new Date(dateStart).valueOf(), '<': new Date(dateEnd).valueOf() }
          },
          sort: 'createdAt DESC'
        });
      } else if(numbers){
        const result = [];
        numbers = numbers.split(',');
        numbers.forEach(n => {
          result.push(parseInt(n));
        });
        orders = await Order.find({
          where: {
            seller: seller,
            channel: ['linio', 'dafiti','liniomx'],
            currentstatus: [orderState.id, stateProcess.id, state.id],
            reference: result
          },
          sort: 'createdAt DESC'
        });
      } else if(ordersSelected){
        orders = await Order.find({
          where: {
            seller: seller,
            channel: ['dafiti'],
            currentstatus: [orderState.id, stateProcess.id, state.id],
            id: ordersSelected
          },
          sort: 'createdAt DESC'
        });
      }
      if (orders && orders.length > 0) {
        let documents = [];
        for (const order of orders) {
          let oitems = await OrderItem.find({order:order.id}).populate('product');
          const documentType = oitems[0].shippingType;
          if(!order.tracking){
            await sails.helpers.carrier.shipment(order.id);
          }
          if (documentType === 'Cross docking' && order.channel === 'dafiti') {
            const resultOrder = await Order.findOne({id: order.id});
            if (resultOrder.tracking) {
              await Order.updateOne({id: order.id}).set({currentstatus: state.id});
              await OrderHistory.create({order: order.id, state: state.id});
              let litems = [];
              let integration = await Integrations.findOne({id: order.integration}).populate('channel');
              for(let it of oitems){
                await OrderItem.updateOne({id: it.id}).set({currentstatus: state.id});
                if(!litems.includes(it.externalReference)){
                  litems.push(it.externalReference);
                }
              }
              let route = await sails.helpers.channel.dafiti.sign(order.integration, 'GetDocument',order.seller,['OrderItemIds=['+litems.join(',')+']','DocumentType=shippingLabel']);
              let respo = await sails.helpers.request(integration.channel.endpoint,'/?'+route,'GET');
              let result = JSON.parse(respo);
              if(result.SuccessResponse){
                const html = `<html lang="en">
                <head>
                  <meta charset="utf-8">
                  <title>Template Report</title>
                </head>
                <body>
                  <div style="
                    position: relative;
                    width: 100%;
                    height: 0;
                    padding-bottom: 56.25%;
                  ">
                    <iframe src="data:text/html;base64,${result.SuccessResponse.Body.Documents.Document.File}" 
                      frameborder="0" allowfullscreen 
                      style="
                      width: 908px; 
                      height: 752px;
                      border: 0;
                      -ms-transform: scale(0.97);
                      -moz-transform: scale(0.97);
                      -o-transform: scale(0.97);
                      -webkit-transform: scale(0.97);
                      transform: scale(0.97);
                      -ms-transform-origin: 0 0;
                      -moz-transform-origin: 0 0;
                      -o-transform-origin: 0 0;
                      -webkit-transform-origin: 0 0;
                      transform-origin: 0 0;"
                    ></iframe>
                  </div>
                </body>
                </html>`;
                const options = {format: 'Letter', timeout: '200000'};
                const createPDF = (html, options) => new Promise(((resolve, reject) => {
                  htmlPdf.create(html, options).toBuffer((err, buffer) => {
                    if (err !== null) {reject(err);}
                    else {resolve(buffer);}
                  });
                }));

                const buffer = await createPDF(html, options);
                documents.push(buffer);
              }
            }
          } else {
            const resultOrder = await Order.findOne({id: order.id});
            if (resultOrder.tracking) {
              await Order.updateOne({id: order.id}).set({currentstatus: state.id});
              await OrderHistory.create({order: order.id, state: state.id});
              let litems = [];
              let integration = await Integrations.findOne({id: order.integration}).populate('channel');
              for(let it of oitems){
                await OrderItem.updateOne({id: it.id}).set({currentstatus: state.id});
                if(!litems.includes(it.externalReference)){
                  litems.push(it.externalReference);
                }
              }
              let route = order.channel === 'dafiti' ? await sails.helpers.channel.dafiti.sign(order.integration, 'GetDocument',order.seller,['OrderItemIds=['+litems.join(',')+']','DocumentType=shippingParcel']) :
              order.channel === 'liniomx' ? await sails.helpers.channel.liniomx.sign(order.integration,'GetDocument',order.seller,['OrderItemIds=['+litems.join(',')+']','DocumentType=shippingParcel']) :
              await sails.helpers.channel.linio.sign(order.integration,'GetDocument',order.seller,['OrderItemIds=['+litems.join(',')+']','DocumentType=shippingParcel']);
              let respo = await sails.helpers.request(integration.channel.endpoint,'/?'+route,'GET');
              let result = JSON.parse(respo);
              if(result.SuccessResponse){
                const resultBuf = Buffer.from(result.SuccessResponse.Body.Documents.Document.File, 'base64');
                documents.push(resultBuf);
              }
            }
          }
        }
        const mergedPdf = await PDFDocument.create();
        for (const pdfBytes of documents) {
          const pdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => {
            mergedPdf.addPage(page);
          });
        }
        const buf = await mergedPdf.save();
        const resultPdf = Buffer.from(new Uint8Array(buf)).toString('base64');
        return res.send({guia: resultPdf, error: null});
      } else {
        return res.send({guia: null, error: 'No se encontró pedidos para procesar'});
      }
    } catch (error) {
      return res.send({guia: null, error: error+' '+'Error al procesar guias'});
    }
  },
  shipmentcrossdocking: async function(req, res){
    let rights = await sails.helpers.checkPermissions(req.session.user.profile);
    if(rights.name!=='superadmin' && !_.contains(rights.permissions,'shipment')){
      throw 'forbidden';
    }
    let htmlPdf  = require('html-pdf');
    let tracking = req.param('tracking');
    let orders = await Order.find({tracking: tracking});
    let guia=null;
    let oitems = await OrderItem.find({order:orders[0].id});
    let litems = [];
    for(let it of oitems){
      if(!litems.includes(it.externalReference)){
        litems.push(it.externalReference);
      }
    }
    let route = await sails.helpers.channel.dafiti.sign(orders[0].integration,'GetDocument',orders[0].seller,['OrderItemIds=['+litems.join(',')+']',`DocumentType=shippingLabel`]);
    let response = await sails.helpers.request('https://sellercenter-api.dafiti.com.co','/?'+route,'GET');
    let result = JSON.parse(response);
    if (result.SuccessResponse) {
      const html = `<html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Template Report</title>
      </head>
      <body>
        <div style="
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%;
        ">
          <iframe src="data:text/html;base64,${result.SuccessResponse.Body.Documents.Document.File}" 
            frameborder="0" allowfullscreen 
            style="
            width: 908px; 
            height: 752px;
            border: 0;
            -ms-transform: scale(0.97);
            -moz-transform: scale(0.97);
            -o-transform: scale(0.97);
            -webkit-transform: scale(0.97);
            transform: scale(0.97);
            -ms-transform-origin: 0 0;
            -moz-transform-origin: 0 0;
            -o-transform-origin: 0 0;
            -webkit-transform-origin: 0 0;
            transform-origin: 0 0;"
          ></iframe>
        </div>
      </body>
      </html>`;
      const options = {format: 'Letter', timeout: '200000'};
      htmlPdf.create(html, options).toBuffer((err, buffer) => {
        if (err) {return console.log(err);}
        guia = Buffer.from(new Uint8Array(buffer)).toString('base64');
        return res.view('pages/pdf',{layout:'layouts/admin',guia, label:null});
      });
    } else {
      return res.view('pages/pdf',{layout:'layouts/admin',guia, label:null});
    }
  },
  showmanifest: async function(req, res){
    let htmlPdf  = require('html-pdf');
    let manifest = req.query.manifest;
    let orders = await Order.find({manifest: manifest});
    let resultManifest=null;
    let sign = await sails.helpers.channel.dafiti.sign(orders[0].integration,'GetManifestDocument',orders[0].seller,['ManifestCode='+manifest]);
    let response = await sails.helpers.request('https://sellercenter-api.dafiti.com.co','/?'+sign,'GET');
    let result = JSON.parse(response);
    if (result.SuccessResponse) {
      const html = `<html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Template Report</title>
      </head>
      <body>
        <div style="
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%;
        ">
          <iframe src="data:text/html;base64,${result.SuccessResponse.Body.File}" 
            frameborder="0" allowfullscreen 
            style="
            width: 908px; 
            height: 752px;
            border: 0;
            -ms-transform: scale(0.97);
            -moz-transform: scale(0.97);
            -o-transform: scale(0.97);
            -webkit-transform: scale(0.97);
            transform: scale(0.97);
            -ms-transform-origin: 0 0;
            -moz-transform-origin: 0 0;
            -o-transform-origin: 0 0;
            -webkit-transform-origin: 0 0;
            transform-origin: 0 0;"
          ></iframe>
        </div>
      </body>
      </html>`;
      const options = {format: 'Letter', timeout: '200000'};
      htmlPdf.create(html, options).toBuffer((err, buffer) => {
        if (err) {return console.log(err);}
        resultManifest = Buffer.from(new Uint8Array(buffer)).toString('base64');
        return res.view('pages/pdf',{layout:'layouts/admin',guia: resultManifest, label:null});
      });
    } else {
      return res.view('pages/pdf',{layout:'layouts/admin',guia: resultManifest, label:null});
    }
  }
};
