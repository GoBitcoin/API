git submodule foreach git pull
protoc --descriptor_set_out=lib/api/protos/bitcoinserver.desc --include_imports lib/api/protos/bitcoinserver.proto 
protoc --descriptor_set_out=lib/api/protos/bitcoin.desc --include_imports lib/api/protos/bitcoin.proto 
protoc --descriptor_set_out=lib/api/protos/paymentrequest.desc --include_imports lib/api/protos/paymentrequest.proto 
