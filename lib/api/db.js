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
  this.client = new pg.Client(Config.database.development.uri);
  this.checkCreateDB();
  this.checkCreateTables();
};

dbInstance.prototype.close = function () {
  this.client.end();
};

dbInstance.prototype.checkCreateDB = function (cb) {
  var queryString = "CREATE DATABASE " + Config.database.development.db;
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
      cb(null, result.rows[0].id);
    } else {
      cb('[db.js - insert]: Unknown fail');
    }
  });
};

dbInstance.prototype.get = function (id, cb) {
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

dbInstance.prototype.updateSingleColumn = function (id, object, cb) {
  var queryString = 'UPDATE ' + Config.database.paymentTable;
  queryString += ' SET ' + object.updateKey + '=' + (object.updateValue || 'decode(\'' + object.updateByte + '\', \'hex\')');
  queryString += ' WHERE id=' + id + ' RETURNING id';
  console.log(queryString);
  this.client.query(queryString, function (err, result) {
    //for next task in async.waterfall
    if (err) {
      cb('[db.js - updateSingleColumn]: ' + err);
    } else if (result.rows[0].id) {
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