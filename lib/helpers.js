var _ = require('lodash');

exports.parseDevDetails = function (miner, response) {
  var data;

  if (response.DEVS && response.DEVS.length > 0) {
    data = _.extend({}, miner, {
      devices: _.extend({}, response.DEVS)
    });
  }

  if (response.DEVDETAILS && response.DEVDETAILS.length > 0) {
    data = _.extend({}, miner, {
      devices: _.extend({}, response.DEVDETAILS)
    });
  }

  return data;
};

exports.parsePools = function (miner, response) {
  var data;

  if (response.POOLS && response.POOLS.length > 0) {
    var pools = _.map(response.POOLS, function (pool) {
      return {
        Alive: pool.Status === 'Alive',
        Accepted: pool.Accepted,
        Discarded: pool.Discarded,
        Pool: pool.POOL,
        Priority: pool.Priority,
        Rejected: pool.Rejected,
        Status: pool.Status,
        'Stratum URL': pool['Stratum URL'],
        URL: pool.URL,
        User: pool.User,
        'Last Share Time': pool['Last Share Time']
      };
    });

    return _(pools).each(function (pool) {
      pool.Active = _.max(pools, function (p) { return p['Last Share Time']; }).Pool === pool.Pool;
    })
    .sortBy(function (pool) {
      return pool.Pool;
    }).value();
  }
};

exports.parseSummary = function (miner, response) {
  var data;

  if (response.SUMMARY && response.SUMMARY.length > 0) {
    data = _.extend({}, miner, response);
  }

  return data;
};