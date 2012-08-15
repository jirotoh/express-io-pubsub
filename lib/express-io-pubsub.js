(function() {
  var MongoStore, Store, mongodb,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  mongodb = require('mongodb');

  Store = (function() {

    Store.init = function(config) {
      switch (config.type) {
        case "mongodb":
          return new MongoStore(config.conn);
        default:
          throw new Error('Invalid Storage Type');
      }
    };

    function Store(conn) {
      this.conn = conn;
    }

    Store.prototype.connect = function() {
      throw new Error('must override');
    };

    Store.prototype.insert = function() {
      throw new Error('must override');
    };

    Store.prototype.listen = function() {
      throw new Error('must override');
    };

    return Store;

  })();

  MongoStore = (function(_super) {

    __extends(MongoStore, _super);

    function MongoStore() {
      MongoStore.__super__.constructor.apply(this, arguments);
    }

    MongoStore.prototype.connect = function(next) {
      if (this.collection) return next(this.collection);
      return mongodb.connect(this.conn, {}, function(err, db) {
        return db.collection('events', function(err, collection) {
          this.collection = collection;
          return next(this.collection);
        });
      });
    };

    MongoStore.prototype.insert = function(room, event, data) {
      return this.connect(function(collection) {
        console.log('insert into collection');
        return collection.insert({
          room: room,
          event: event,
          data: data
        }, function(err) {
          if (err) throw err;
        });
      });
    };

    MongoStore.prototype.listen = function(next) {
      console.log('trying to listen');
      return this.connect(function(collection) {
        var cursor, stream;
        console.log('got collection');
        cursor = collection.find({}, {
          tailable: true
        });
        stream = cursor.stream();
        return stream.on('data', function(doc) {
          console.log('got item');
          console.log(doc);
          return next(doc.room, doc.event, doc.data);
        });
      });
    };

    return MongoStore;

  })(Store);

  exports.middleware = function(config) {
    var store;
    store = Store.init(config);
    return function(req, res, next) {
      req.publish = function(room, event, data) {
        return store.insert(room, event, data);
      };
      return next();
    };
  };

  exports.listen = function(sockets, config) {
    var store;
    store = Store.init(config);
    return store.listen(function(room, event, data) {
      console.log('broadcasting');
      return sockets["in"](room).emit(event, data);
    });
  };

}).call(this);
