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
    data = _.extend({}, miner, response);
  }

  return data;
};

exports.parseSummary = function (miner, response) {
  var data;

  if (response.SUMMARY && response.SUMMARY.length > 0) {
    data = _.extend({}, miner, response);
  }

  return data;
};