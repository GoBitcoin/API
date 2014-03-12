API
======

API of super secret project

##Install
`npm install`

`git submodule init, sync`

`brew install protobuf`

`sh bootstrap.sh`

##API
### CREATE
**Example:**`localhost:8001/create?address={address}&amount={amount}&memo={memo}&ackmemo={ackmemo}`
####Create flow:
  1. when the server receives the four properties of payment details (**address, amount, memo, ackmemo**) from the POST, the first thing we do is hash it and check if the hash already exists in our database. This is to avoid create duplicate records
  2. If the duplication check returns no result, we now know this is a new payment detail. We insert it to the database, and the database would return us the id of the new record
  3. After we get the id from the database, we will now construct the payment details protobuf and send it to the signing server to get it signed.
  4. The signing server will return us the protobuf of payment request. We will now store this payment request into our database into the same row as above. 

## PAY

localhost:8001/pay/{id}

## GET

localhost:8001/get/{id}
