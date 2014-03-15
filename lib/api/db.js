var pg = require("pg");
var Config = require('./config');

var dbInstance = function () {
  this.initialize();
};

// Optional callback
dbInstance.prototype.initialize = function (cb) {
  // dbInstance = redis.createClient(Config.database.development.port, Config.database.development.host);
  // dbInstance.on("error", function (err) {
  //   if (err)
  //     cb('Database connection error: ' + JSON.stringify(err));
  // });
  // console.log("DB connected correctly!");
  // cb()
  this.client = new pg.Client(Config.database.uri);
  this.checkCreateDB();
  this.checkCreateTables();
};

dbInstance.prototype.close = function () {
  this.client.end();
};

dbInstance.prototype.checkCreateDB = function (cb) {
  var queryString = "CREATE DATABASE " + Config.database.db;
  console.log(queryString);
  var self = this;
  this.client.connect(function (err) {
    if (err) {
      console.log('[db.js - checkCreateDB]: ' + err);
      return {
        error: '[db.js - checkCreateDB]: ' + err
      };

    } else {
      self.client.query(queryString, function (err) {
        console.log('[db.js - checkCreateDB]: ' + err);
        if (err) {
          return {
            error: '[db.js - checkCreateDB]: ' + err
          };
        }
      });
    }
  });
};

dbInstance.prototype.checkCreateTables = function (cb) {
  var queryString = 'CREATE TABLE IF NOT EXISTS ' + Config.database.paymentTable + '(';
  queryString += 'id SERIAL,';
  queryString += 'hash text NOT NULL,';
  queryString += 'address text NOT NULL,';
  queryString += 'amount bigint NOT NULL,';
  queryString += 'memo text,';
  queryString += 'ack_memo text,';
  queryString += 'payment_request bytea,';
  queryString += 'PRIMARY KEY (id))';
  console.log(queryString);
  this.client.query(queryString, function (err) {
    if (err) {
      console.log('[db.js - checkCreateTables]: ' + err);
      return {
        error: '[db.js - checkCreateTables]: ' + err
      };

    }
  });
};

dbInstance.prototype.insert = function (object, cb) {
  var queryString = 'INSERT INTO ' + Config.database.paymentTable + ' (';
  queryString += 'hash, address, amount, memo, ack_memo) VALUES (\'';
  queryString += object.hash + '\',\'' || '';
  queryString += object.address + '\',' || '';
  queryString += object.amount + ',\'' || 0;
  queryString += object.memo + '\',\'';
  queryString += object.ackmemo;
  queryString += '\') RETURNING id';
  console.log(queryString);
  this.client.query(queryString, function (err, result) {

    //for next task in async.waterfall
    if (err) {
      cb('[db.js - insert]: ' + err);
    } else if (result.rows[0].id) {
      cb(null, null, result.rows[0].id, object.address);
    } else {
      cb('[db.js - insert]: Unknown fail');
    }
  });
};

dbInstance.prototype.getId = function (id, cb) {
  var queryString = 'SELECT * FROM ' + Config.database.paymentTable + ' WHERE id=' + id;
  var ret = {};
  var query = this.client.query(queryString, function (err, result) {
    if (err) {
      ret = {
        error: err
      };
    }
    console.log(result.rows[0]);
    ret = {
      data: result.rows[0]
    };
  });
  return ret;
};

dbInstance.prototype.getPaymentRequestForId = function (id, cb) {
  var queryString = 'SELECT encode(payment_request, \'hex\') FROM ' + Config.database.paymentTable + ' WHERE id=' + id;
  this.client.query(queryString, function (err, result) {
    if (result.rows.length > 0) {
      callback(result.rows[0]);
    } else {
      callback(null);
    }
  });
};

dbInstance.prototype.getHash = function (hash, foundCB, cb) {
  var queryString = 'SELECT * FROM ' + Config.database.paymentTable + ' WHERE hash=\'' + hash + '\'';
  var query = this.client.query(queryString, function (err, result) {
    if (err) {
      cb('[db.js - getHash]: ' + err);
    } else if (result.rows.length > 0) {
      //if found, we execute 
      console.log('[db.js - getHash]: ' + result.rows[0].id);
      // waterfall cb set skip = true
      cb(null, true, result.rows[0].id);
    } else {
      cb(null, null, null);
    }

  });
};

/**
 * Updates a single column of a row with given id
 * @param  {Integer}   id     id of the row
 * @param  {Object}   object has an (updateKey) and (updateValue|updateByte)
 * @param  {Function} cb     callback with (error, result) as params
 */
dbInstance.prototype.updateSingleColumn = function (id, object, cb) {
  var queryString = 'UPDATE ' + Config.database.paymentTable;
  queryString += ' SET ' + object.updateKey + '=' + (object.updateValue || 'decode(\'' + object.updateByte + '\', \'hex\')');
  queryString += ' WHERE id=' + id + ' RETURNING id';
  console.log(queryString);
  this.client.query(queryString, function (err, result) {
    //for next task in async.waterfall
    if (err) {
      cb('[db.js - updateSingleColumn]: ' + err);
    } else if (result.rows.length > 0) {
      console.log('[db.js - updateSingleColumn]: ' + result.rows[0].id);
      cb(null, result.rows[0].id);
    } else {
      cb('[db.js - updateSingleColumn]: Unknown fail');
    }
  });
};


dbInstance.prototype.nextIndex = function () {

};

//singleton db instance
exports = module.exports = new dbInstance();