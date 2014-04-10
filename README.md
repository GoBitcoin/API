API
======

API of super secret project

##Install
`npm install`

`git submodule init`

`git submodule update`

`brew install protobuf`

`grunt build`

`grunt server`


##Change config
rename lib/api/example_config.js to config.js
fill it in according to your setup.

##Deploy
[Wiki](https://github.com/GoBitcoin/API/wiki/Deploy)

##API
### CREATE
**Example:**`localhost:8001/create?address={address}&amount={amount}&memo={memo}&ackmemo={ackmemo}`
####Create flow:
  1. when the server receives the four properties of payment details (**address, amount, memo, ackmemo**) from the POST, the first thing we do is hash it and check if the hash already exists in our database. This is to avoid create duplicate records
  2. If the duplication check returns no result, we now know this is a new payment detail. We insert it to the database, and the database would return us the id of the new record
  3. After we get the id from the database, we will now construct the payment details protobuf and send it to the signing server to get it signed.
  4. The signing server will return us the protobuf of payment request. We will now store this payment request into our database into the same row as above.
  5. We then generate a link /pay/{id} and return that to the user


## PAY
**Example:**`localhost:8001/pay/{id}`
####Pay flow:
  1. After create generates the pay URL, the user will open it up (in some wallet app)
  2. When we receive the get for /pay/{id} we simply look it up in the db and return the corresponding payment request protobuf. The client (wallet on user's phone) is responsible for verifying the signing, as well as displaying the payment info
  3. User confirms the payment, and the wallet will send a post to our /send/{id}

## SEND
**Example:**`localhost:8001/send/{id}`
####Send flow:
  1. Here we will receive the Payment protobuf from the user's wallet, we will deserialize it
  2. Find the payment request protobuf corresponds to the id passed in from the database, and construct the "BroadcastPayment" protobuf
  3. POST that protobuf to the broadcast server

