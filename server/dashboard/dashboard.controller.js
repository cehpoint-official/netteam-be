const User = require("../user/model");
const Host = require("../host/host.model");
const Gift = require("../gift/gift.model");
const CoinPlan = require("../coinPlan/coinPlan.model");
const LiveHost = require("../liveHost/liveHost.model");
const LiveStreamingHistory = require("../liveStreamingHistory/liveStreamingHistory.model");

//get Admin Panel dashboard
exports.dashboard = async (req, res) => {
  try {
    const user = await User.find().countDocuments();
    const onlineUser = await User.find({ isOnline: true }).countDocuments();
    const onlineHost = await Host.find({ isOnline: true }).countDocuments();
    const host = await Host.find().countDocuments();
    const gift = await Gift.find().countDocuments();
    const coinPlan = await CoinPlan.find().countDocuments();
    const liveHost = await LiveHost.find().countDocuments();

    //coinplanRevenue
    const coinplanRevenue = await CoinPlan.aggregate([
      {
        $lookup: {
          from: "histories",
          let: { coinPlanId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$type", 2] },
                    { $eq: ["$coinPlanId", "$$coinPlanId"] },
                  ],
                },
              },
            },
          ],
          as: "coinPlan",
        },
      },
      {
        $unwind: {
          path: "$coinPlan",
        },
      },
      {
        $group: {
          _id: null,
          dollar: { $sum: "$dollar" },
        },
      },
    ]);

    const dashboard = {
      user,
      onlineUser,
      host,
      onlineHost,
      gift,
      coinPlan,
      liveHost,
      revenue: {
        dollar: coinplanRevenue.length > 0 ? coinplanRevenue[0].dollar : 0,
      },
    };

    return res
      .status(200)
      .json({ status: true, message: "Success!!", dashboard });
  } catch (error) {
    console.error(error);
    return res.status(200).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

//get date Wise analytic for admin panel
exports.analytic = async (req, res) => {
  try {
    if (!req.query.type || !req.query.startDate || !req.query.endDate) {
      return res
        .status(200)
        .json({ status: false, message: "Oops!! Invalid Details!!" });
    }

    let dateFilterQuery = {};

    let start_date = new Date(req.query.startDate);
    let end_date = new Date(req.query.endDate);

    dateFilterQuery = {
      analyticDate: {
        $gte: start_date,
        $lte: end_date,
      },
    };

    //console.log("dateFilterQuery--", dateFilterQuery);

    if (req.query.type === "UserHost") {
      var user = await User.aggregate([
        {
          $addFields: {
            analyticDate: {
              $toDate: {
                $arrayElemAt: [{ $split: ["$date", ", "] }, 0],
              },
            },
          },
        },
        {
          $match: dateFilterQuery,
        },
        {
          $group: {
            _id: "$analyticDate",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      var host = await Host.aggregate([
        {
          $addFields: {
            analyticDate: {
              $toDate: {
                $arrayElemAt: [{ $split: ["$date", ", "] }, 0],
              },
            },
          },
        },
        {
          $match: dateFilterQuery,
        },
        {
          $group: {
            _id: "$analyticDate",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      return res
        .status(200)
        .json({ status: true, message: "Success!!", user, host });
    }

    if (req.query.type === "LiveHost") {
      const liveHost = await LiveStreamingHistory.aggregate([
        {
          $addFields: {
            analyticDate: {
              $toDate: {
                $arrayElemAt: [{ $split: ["$date", ", "] }, 0],
              },
            },
          },
        },
        {
          $match: dateFilterQuery,
        },
        {
          $sort: { analyticDate: -1 },
        },
        {
          $group: {
            _id: { id: "$hostId", time: "$startTime" },
            doc: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$doc" },
        },
        {
          $group: {
            _id: "$startTime",
            count: { $sum: 1 },
          },
        },
      ]);

      return res
        .status(200)
        .json({ status: true, message: "Success!!", analytic: liveHost });
    }

    if (req.query.type === "Revenue") {
      //coinplan revenue
      const coinplanRevenue = await CoinPlan.aggregate([
        {
          $lookup: {
            from: "histories",
            let: { coinPlanId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$type", 2] },
                      { $eq: ["$coinPlanId", "$$coinPlanId"] },
                    ],
                  },
                },
              },
              {
                $addFields: {
                  analyticDate: {
                    $toDate: {
                      $arrayElemAt: [{ $split: ["$date", ", "] }, 0],
                    },
                  },
                },
              },
              {
                $match: dateFilterQuery,
              },
              {
                $sort: { analyticDate: -1 },
              },
              // {
              //   $group: {
              //     _id: "$analyticDate",
              //     count: {
              //       $sum: 1,
              //     },
              //   },
              // },
            ],
            as: "coinPlan",
          },
        },
        {
          $unwind: {
            path: "$coinPlan",
          },
        },
        {
          $group: {
            //_id: "$coinPlan",
            _id: "$coinPlan.analyticDate",
            dollar: { $sum: "$dollar" },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      return res.status(200).json({
        status: true,
        message: "Success!!",
        analytic: coinplanRevenue,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};
