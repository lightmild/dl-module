require("should");
var helper = require("../../helper");

var purchaseRequestDataUtil = require("../../data-util/garment-purchasing/purchase-request-data-util");
var purchaseOrderDataUtil = require("../../data-util/garment-purchasing/purchase-order-data-util");
var validatePO = require("dl-models").validator.garmentPurchasing.garmentPurchaseOrder;
var PurchaseOrderManager = require("../../../src/managers/garment-purchasing/purchase-order-manager");
var purchaseOrderManager = null;

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            purchaseOrderManager = new PurchaseOrderManager(db, {
                username: 'dev'
            });
            done();
        })
        .catch(e => {
            done(e);
        });
});

var listPurchaseOrder = [];
it('#01. should success when get new data purchase-request ', function (done) {
    purchaseRequestDataUtil.getNewTestData()
        .then(purchaseRequest => {
            listPurchaseOrder.push(purchaseRequest);
            done();
        })
        .catch(e => {
            done(e);
        });
});
var createdId = {};
it('#02. should success when create new purchase-order', function (done) {
    purchaseOrderManager.createMultiple(listPurchaseOrder)
        .then(data => {
            data.should.be.instanceof(Array);
            createdId = data[0];
            done();
        })
        .catch(e => {
            done(e);
        });
});

var createdData;
var categoryId;
it(`#03. should success when get created data with id`, function (done) {
    purchaseOrderManager.getSingleById(createdId)
        .then((data) => {
            data.should.instanceof(Object);
            validatePO(data);
            createdData = data;
            categoryId = createdData.items[0].categoryId
            done();
        })
        .catch((e) => {
            done(e);
        });
});

it("#04. should success when read data", function (done) {
    purchaseOrderManager.read({
        filter: {
            _id: createdId
        }
    })
        .then((documents) => {
            //process documents
            documents.should.have.property("data");
            documents.data.should.be.instanceof(Array);
            documents.data.length.should.not.equal(0);
            done();
        })
        .catch((e) => {
            done(e);
        });
});

it('#05. should success when get data by keyword', function (done) {
    var shipmentDate = new Date();
    var moment = require('moment');
    purchaseOrderManager.getPurchaseOrderByTag(categoryId,"#buyer1",moment(shipmentDate).format("YYYY-MM-DD"))
        .then(data => {
            data.should.be.instanceof(Array);
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#06. should success when delete data`, function (done) {
    purchaseOrderManager.delete(createdData)
        .then((id) => {
            id.toString().should.equal(createdId.toString());
            done();
        })
        .catch((e) => {
            done(e);
        });
});


it(`#07. should _deleted=true`, function (done) {
    purchaseOrderManager.getSingleByQuery({
        _id: createdId
    })
        .then((data) => {
            validatePO(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch((e) => {
            done(e);
        });
});