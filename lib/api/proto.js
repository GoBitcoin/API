var Hapi = require('hapi');
var Schema = require('protobuf').Schema;
var FS = require('fs');

var internals = {
  bitcoinSchema: new Schema(FS.readFileSync('lib/api/protos/bitcoin.desc')),
  bitcoinServerSchema: new Schema(FS.readFileSync('lib/api/protos/bitcoinserver.desc')),
  paymentRequestSchema: new Schema(FS.readFileSync('lib/api/protos/paymentrequest.desc'))
};

// Deserialize payment details
// param: payment detail buffer
exports.deserializePaymentDetails = function (pdBuffer) {
  var paymentDetailsProto = internals.paymentRequestSchema['payments.PaymentDetails '];
  var paymentDetailsDeserialized = paymentDetailsProto.parse(pdBuffer);
  return paymentDetailsDeserialized;
};

// Deserialize payment request
// Will automatically print deserialized payment details (comment out in production)
// param: payment request buffer
exports.deserializePaymentRequest = function (prBuffer) {
  if (Buffer.isBuffer(prBuffer)) {
    var paymentRequestProto = internals.paymentRequestSchema['payments.PaymentRequest '];
    var paymentRequestDeserialized = paymentRequestProto.parse(prBuffer);
    console.log('Deserialized PayReq: ', JSON.stringify(paymentRequestDeserialized));
    var paymentDetailsDeserialized = internals.deserializePaymentDetails(paymentRequestDeserialized.serializedPaymentDetails);
    console.log('Deserialized PayDet: ', JSON.stringify(paymentDetailsDeserialized));
    return paymentRequestDeserialized;
  } else if (typeof prBuffer == 'string ' || prBuffer instanceof String) {
    return internals.deserializePaymentRequest(new Buffer(prBuffer, 'ascii '));
  } else {
    console.log("[deserializePaymentRequest]: Param must be buffer/string");
  }
};

// Deserialize payment request
// param: payment buffer
exports.deserializePayment = function (pBuffer) {
  var paymentProto = internals.paymentRequestSchema['payments.Payment'];
  var paymentDeserialized = paymentProto.parse(pBuffer);
  return paymentDeserialized;
};