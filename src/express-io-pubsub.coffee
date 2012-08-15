mongodb = require 'mongodb'

# Data Storage
class Store
  @init: (config) ->
    switch config.type
      when "mongodb"
        return new MongoStore config.conn
      else
        throw new Error('Invalid Storage Type')
  constructor: (@conn) ->
  connect: ->
    throw new Error('must override')
  insert: ->
    throw new Error('must override')
  listen: ->
    throw new Error('must override')

class MongoStore extends Store
  # db.createCollection('events', {capped: true, size: 10000, max: 100})
  connect: (next) ->
    return next @collection if @collection
    mongodb.connect @conn, {}, (err, db) ->
      db.collection 'events', (err, @collection) ->
        next @collection

  insert: (room, event, data) ->
    @connect (collection) ->
      collection.insert {room: room, event: event, data: data}, (err) ->
        throw err if err

  listen: (next) ->
    @connect (collection) ->
      cursor = collection.find {}, {tailable: true}
      stream = cursor.stream()

      stream.on 'data', (doc) ->
        next doc.room, doc.event, doc.data

# Publishing Middleware
exports.middleware = (config) ->
  store = Store.init config
  return (req, res, next) ->
    req.publish = (room, event, data) ->
      store.insert room, event, data
    next()

# Subscription
exports.listen = (sockets, config) ->
  store = Store.init config
  store.listen (room, event, data) ->
    sockets.in(room).emit event, data

