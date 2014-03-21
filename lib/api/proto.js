var Hapi = require('hapi');
var Schema = require('protobuf').Schema;
var FS = require('fs');

var internals = {
  bitcoinSchema: new Schema(FS.readFileSync('lib/api/protos/bitcoin.desc')),
  bitcoinServerSchema: new Schema(FS.readFileSync('lib/api/protos/bitcoinserver.desc')),
  paymentRequestSchema: new Schema(FS.readFileSync('lib/api/protos/paymentrequest.desc'))
};

// Serialize payment details
// param: payment details object
// {}
exports.serializePaymentDetails = function (pdObject) {
  var paymentDetailsProto = internals.paymentRequestSchema['payments.PaymentDetails'];
  var paymentDetailsSerialized = paymentDetailsProto.serialize(pdObject);
  return paymentDetailsSerialized;
};

// Serialize payment request
// param: payment request object
// {}
exports.serializePaymentRequest = function (prObject) {
  var paymentRequestProto = internals.paymentRequestSchema['payments.PaymentRequest'];
  var paymentRequestSerialized = paymentRequestProto.serialize(prObject);
  return paymentRequestSerialized;
};

// Serialize payment
// param: payment object
// {}
exports.serializePayment = function (pObject) {
  var paymentProto = internals.paymentRequestSchema['payments.Payment'];
  var paymentSerialized = paymentProto.serialize(pObject);
  return paymentSerialized;
};

// Serialize broadcast payment
// param: broadcast payment object 
// {paymentRequest: deserializedPR, payment: deserializedP}
exports.serializeBroadcastPayment = function (bpObj) {
  var broadcastPaymentProto = internals.bitcoinServerSchema['BitcoinServer.BroadcastPayment'];
  var broadcastPaymentSerialized = broadcastPaymentProto.serialize(bpObj);
  return broadcastPaymentSerialized;
};

// Deserialize payment details
// param: payment detail buffer
exports.deserializePaymentDetails = function (pdBuffer) {
  if (Buffer.isBuffer(pdBuffer)) {
    var paymentDetailsProto = internals.paymentRequestSchema['payments.PaymentDetails'];
    var paymentDetailsDeserialized = paymentDetailsProto.parse(pdBuffer);
    return paymentDetailsDeserialized;
  } else if (typeof pdBuffer == 'string' || pdBuffer instanceof String) {
    return exports.deserializePaymentDetails(new Buffer(pdBuffer, 'ascii'));
  } else {
    console.log("[deserializePaymentDetails]: Param must be buffer/string");
  }
};

// Deserialize payment request
// Will automatically print deserialized payment details (comment out in production)
// param: payment request buffer
exports.deserializePaymentRequest = function (prBuffer) {
  if (Buffer.isBuffer(prBuffer)) {
    var paymentRequestProto = internals.paymentRequestSchema['payments.PaymentRequest'];
    var paymentRequestDeserialized = paymentRequestProto.parse(prBuffer);
    console.log('Deserialized PayReq: ', JSON.stringify(paymentRequestDeserialized));
    // var paymentDetailsDeserialized = internals.deserializePaymentDetails(paymentRequestDeserialized.serializedPaymentDetails);
    // console.log('Deserialized PayDet: ', JSON.stringify(paymentDetailsDeserialized));
    return paymentRequestDeserialized;
  } else if (typeof prBuffer == 'string' || prBuffer instanceof String) {
    return exports.deserializePaymentRequest(new Buffer(prBuffer, 'ascii'));
  } else {
    console.log("[deserializePaymentRequest]: Param must be buffer/string");
  }
};

// Deserialize payment request
// param: payment buffer
exports.deserializePayment = function (pBuffer) {
  if (Buffer.isBuffer(pBuffer)) {
    var paymentProto = internals.paymentRequestSchema['payments.Payment'];
    var paymentDeserialized = paymentProto.parse(pBuffer);
    return paymentDeserialized;
  } else if (typeof pBuffer == 'string' || pBuffer instanceof String) {
    return exports.deserializePayment(new Buffer(pBuffer, 'ascii'));
  } else {
    console.log("[deserializePayment]: Param must be buffer/string");
  }
};

// Deserialize broadcast payment
// param: broadcast payment buffer
exports.deserializeBroadcastPayment = function (bpBuffer) {
  if (Buffer.isBuffer(bpBuffer)) {
    var broadcastPaymentProto = internals.bitcoinServerSchema['BitcoinServer.BroadcastPayment'];
    var broadcastPaymentDeserialized = broadcastPaymentProto.parse(bpBuffer);
    return broadcastPaymentDeserialized;
  } else if (typeof bpBuffer == 'string' || bpBuffer instanceof String) {
    return exports.deserializeBroadcastPayment(new Buffer(bpBuffer, 'ascii'));
  } else {
    console.log("[deserializeBroadcastPayment]: Param must be buffer/string");
  }
};