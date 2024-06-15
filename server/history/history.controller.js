const History = require("./history.model");

//import model
const User = require("../user/model");
const Host = require("../host/host.model");
const Setting = require("../setting/setting.model");
const LiveHost = require("../liveHost/liveHost.model");

const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

//history for admin panel
exports.historyAdmin = async (req, res) => {
  try {
    if ((!req.query.userId && !req.query.hostId) || !req.query.type) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!!" });
    }

    let type;
    if (req.query.type === "call") {
      type = 3;
    } else if (req.query.type === "message") {
      type = 1;
    } else if (req.query.type === "gift") {
      type = 0;
    } else if (req.query.type === "coinPlan") {
      type = 2;
    } else if (req.query.type === "randomMatch") {
      type = 9;
    }

    let userQuery, matchQuery, lookupQuery, unwindQuery, projectQuery, user;

    if (req.query.userId) {
      userQuery = await User.findById(req.query.userId);

      user = userQuery;

      if (!user)
        return res
          .status(200)
          .json({ status: false, message: "User does not found!!" });

      matchQuery = {
        $and: [
          { userId: { $eq: user._id } },
          { type: { $eq: type } },
          {
            $or: [
              { isIncome: { $eq: false } },
              {
                $and: [{ isIncome: { $eq: true } }, { hostId: { $eq: null } }],
              },
            ],
          },
        ],
      };

      lookupQuery = {
        $lookup: {
          from: "hosts",
          let: { hostId: "$hostId" },
          as: "host",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$hostId", "$_id"],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      };

      projectQuery = {
        $project: {
          callStartTime: 1,
          callEndTime: 1,
          callConnect: 1,
          videoCallType: 1,
          duration: 1,
          coin: 1,
          date: 1,
          isIncome: 1,
          type: 1,
          callType: {
            $cond: [
              { $eq: ["$callConnect", false] },
              "MissedCall",
              {
                $cond: [{ $eq: ["$userId", user._id] }, "Outgoing", "Incoming"],
              },
            ],
          },
          hostId: "$host._id",
          hostName: { $ifNull: ["$host.name", null] },
        },
      };

      unwindQuery = {
        $unwind: {
          path: "$host",
          preserveNullAndEmptyArrays: true,
        },
      };
    } else if (req.query.hostId) {
      userQuery = await Host.findById(req.query.hostId);

      user = userQuery;

      if (!user)
        return res
          .status(200)
          .json({ status: false, message: "Host does not found!!" });

      matchQuery = {
        $and: [
          { hostId: { $eq: user._id } },
          { type: { $eq: type } },
          {
            $or: [
              { isIncome: { $eq: true } },
              {
                $and: [{ isIncome: { $eq: false } }, { userId: { $eq: null } }],
              },
            ],
          },
        ],
      };

      lookupQuery = {
        $lookup: {
          from: "users",
          as: "user",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$userId", "$_id"],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      };

      projectQuery = {
        $project: {
          callStartTime: 1,
          callEndTime: 1,
          callConnect: 1,
          coin: 1,
          date: 1,
          videoCallType: 1,
          isIncome: 1,
          duration: 1,
          type: 1,
          callType: {
            $cond: [
              { $eq: ["$callConnect", false] },
              "MissedCall",
              {
                $cond: [{ $eq: ["$hostId", user._id] }, "Outgoing", "Incoming"],
              },
            ],
          },
          userId: "$user._id",
          userName: { $ifNull: ["$user.name", null] },
        },
      };

      unwindQuery = {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      };
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const addFieldQuery_ = {
      shortDate: {
        $toDate: { $arrayElemAt: [{ $split: ["$date", ", "] }, 0] },
      },
    };

    let dateFilterQuery = {};

    if (req.query.startDate && req.query.endDate) {
      sDate = req.query.startDate + "T00:00:00.000Z";
      eDate = req.query.endDate + "T00:00:00.000Z";

      dateFilterQuery = {
        shortDate: { $gte: new Date(sDate), $lte: new Date(eDate) },
      };
    }

    if (
      req.query.type === "call" ||
      req.query.type === "message" ||
      req.query.type === "randomMatch" ||
      req.query.type === "gift"
    ) {
      const history = await History.aggregate([
        {
          $match: matchQuery,
        },
        {
          $addFields: addFieldQuery_,
        },
        {
          $match: dateFilterQuery,
        },
        {
          $sort: { date: -1 },
        },
        lookupQuery,
        unwindQuery,
        projectQuery,
        { $addFields: { sorting: { $toDate: "$date" } } },
        {
          $sort: { sorting: -1 },
        },
        {
          $facet: {
            callHistory: [
              { $skip: (start - 1) * limit }, //how many records you want to skip
              { $limit: limit },
            ],
            pageInfo: [
              { $group: { _id: null, totalRecord: { $sum: 1 } } }, //get total records count
            ],
            callCharge: [
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: {
                      $cond: [
                        { $eq: [type, 3] },
                        {
                          $cond: [{ $eq: ["$callConnect", true] }, "$coin", 0],
                        },
                        "$coin",
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      ]);
      return res.status(200).json({
        status: true,
        message: "Success!!",
        total:
          history[0].pageInfo.length > 0
            ? history[0].pageInfo[0].totalRecord
            : 0,
        totalCoin:
          history[0].callCharge.length > 0 ? history[0].callCharge[0].total : 0,
        history: history[0].callHistory,
      });
    } else if (req.query.type === "admin") {
      var ids = "";

      if (req.query.userId) {
        ids = { userId: { $eq: user._id }, type: 8 };
      } else {
        ids = { hostId: { $eq: user._id }, type: 8 };
      }

      //console.log("----ids----", ids);

      const history = await History.aggregate([
        { $match: ids },
        {
          $addFields: addFieldQuery_,
        },
        {
          $match: dateFilterQuery,
        },
        {
          $sort: { date: -1 },
        },
        {
          $project: {
            _id: 1,
            hostId: 1,
            isIncome: 1,
            coin: 1,
            userId: 1,
            type: 1,
            date: 1,
          },
        },
        {
          $facet: {
            history: [
              { $skip: (start - 1) * limit }, //how many records you want to skip
              { $limit: limit },
            ],
            pageInfo: [
              { $group: { _id: null, totalRecord: { $sum: 1 } } }, //get total records count
            ],
            totalCoin: [
              {
                $group: {
                  _id: null,
                  totalCoin: { $sum: "$coin" },
                },
              },
            ],
          },
        },
      ]);

      //console.log("------History------", history);

      return res.status(200).json({
        status: true,
        message: "Success!!",
        history: history[0].history,
        total:
          history[0].pageInfo.length > 0
            ? history[0].pageInfo[0].totalRecord
            : 0,
        totalCoin:
          history[0].totalCoin.length > 0
            ? history[0].totalCoin[0].totalCoin
            : 0,
      });
    } else if (req.query.type === "coinPlan") {
      const history = await History.aggregate([
        { $match: { userId: user._id, type: 2, coinPlanId: { $ne: null } } },
        {
          $addFields: addFieldQuery_,
        },
        {
          $match: dateFilterQuery,
        },
        {
          $sort: { date: -1 },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "coinplans",
            localField: "coinPlanId",
            foreignField: "_id",
            as: "coinPlan",
          },
        },
        {
          $unwind: {
            path: "$coinPlan",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            paymentGateway: 1,
            name: "$user.name",
            dollar: "$coinPlan.dollar",
            purchaseDate: "$date",
            analyticDate: 1,
            coin: 1,
          },
        },
        {
          $facet: {
            history: [
              { $skip: (start - 1) * limit }, //how many records you want to skip
              { $limit: limit },
            ],
            pageInfo: [
              { $group: { _id: null, totalRecord: { $sum: 1 } } }, //get total records count
            ],
            planCoin: [
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: "$coin",
                  },
                },
              },
            ],
          },
        },
      ]);

      return res.status(200).json({
        status: true,
        message: "Success!!",
        history: history[0].history,
        total:
          history[0].pageInfo.length > 0
            ? history[0].pageInfo[0].totalRecord
            : 0,
        totalCoin:
          history[0].planCoin.length > 0 ? history[0].planCoin[0].total : 0,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.purchaseCoinHistory = async (req, res) => {
  const start = req.query.start ? parseInt(req.query.start) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const addFieldQuery_ = {
    shortDate: {
      $toDate: { $arrayElemAt: [{ $split: ["$date", ", "] }, 0] },
    },
  };

  let dateFilterQuery = {};

  if (req.query.startDate && req.query.endDate) {
    sDate = req.query.startDate + "T00:00:00.000Z";
    eDate = req.query.endDate + "T00:00:00.000Z";

    dateFilterQuery = {
      shortDate: { $gte: new Date(sDate), $lte: new Date(eDate) },
    };
  }

  try {
    const history = await History.aggregate([
      { $match: { type: 2 } },
      {
        $addFields: addFieldQuery_,
      },
      {
        $match: dateFilterQuery,
      },
      {
        $sort: { date: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "coinplans",
          localField: "coinPlanId",
          foreignField: "_id",
          as: "coinPlan",
        },
      },
      {
        $unwind: {
          path: "$coinPlan",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          paymentGateway: 1,
          name: "$user.name",
          dollar: "$coinPlan.dollar",
          purchaseDate: "$date",
          analyticDate: 1,
          coin: 1,
        },
      },
      {
        $facet: {
          history: [
            { $skip: (start - 1) * limit }, //how many records you want to skip
            { $limit: limit },
          ],
          pageInfo: [
            { $group: { _id: null, totalRecord: { $sum: 1 } } }, //get total records count
          ],
          planCoin: [
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$coin",
                },
              },
            },
          ],
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Success!!",
      history,
      history: history[0].history,
      total:
        history[0].pageInfo.length > 0 ? history[0].pageInfo[0].totalRecord : 0,
      totalCoin:
        history[0].planCoin.length > 0 ? history[0].planCoin[0].total : 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//userDebit
exports.userDebit = async (req, res) => {
  try {
    if (!req.query.userId && !req.query.hostId) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!!" });
    }

    let userQuery, matchQuery, lookupQuery, unwindQuery, projectQuery, user;

    if (req.query.userId) {
      userQuery = await User.findById(req.query.userId);

      user = userQuery;

      if (!user)
        return res
          .status(200)
          .json({ status: false, message: "User does not found!!" });

      matchQuery = {
        $and: [{ userId: { $eq: user._id } }, { isIncome: { $eq: false } }],
      };

      lookupQuery = {
        $lookup: {
          from: "hosts",
          let: { hostId: "$hostId" },
          as: "host",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$hostId", "$_id"],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      };

      projectQuery = {
        $project: {
          callStartTime: 1,
          callEndTime: 1,
          callConnect: 1,
          videoCallType: 1,
          duration: 1,
          coin: 1,
          date: 1,
          isIncome: 1,
          type: 1,
          callType: {
            $cond: [
              { $eq: ["$callConnect", false] },
              "MissedCall",
              {
                $cond: [{ $eq: ["$userId", user._id] }, "Outgoing", "Incoming"],
              },
            ],
          },
          hostId: "$host._id",
          hostName: { $ifNull: ["$host.name", null] },
        },
      };

      unwindQuery = {
        $unwind: {
          path: "$host",
          preserveNullAndEmptyArrays: true,
        },
      };
    } else if (req.query.hostId) {
      userQuery = await Host.findById(req.query.hostId);

      user = userQuery;

      if (!user)
        return res
          .status(200)
          .json({ status: false, message: "Host does not found!!" });

      matchQuery = {
        $and: [{ hostId: { $eq: user._id } }, { isIncome: { $eq: true } }],
      };

      lookupQuery = {
        $lookup: {
          from: "users",
          as: "user",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$userId", "$_id"],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      };

      projectQuery = {
        $project: {
          callStartTime: 1,
          callEndTime: 1,
          callConnect: 1,
          coin: 1,
          date: 1,
          videoCallType: 1,
          isIncome: 1,
          duration: 1,
          type: 1,
          callType: {
            $cond: [
              { $eq: ["$callConnect", false] },
              "MissedCall",
              {
                $cond: [{ $eq: ["$hostId", user._id] }, "Outgoing", "Incoming"],
              },
            ],
          },
          userId: "$user._id",
          userName: { $ifNull: ["$user.name", null] },
        },
      };

      unwindQuery = {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      };
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let dateFilterQuery = {};

    if (req.query.startDate && req.query.endDate) {
      sDate = req.query.startDate + "T00:00:00.000Z";
      eDate = req.query.endDate + "T00:00:00.000Z";

      dateFilterQuery = {
        shortDate: { $gte: new Date(sDate), $lte: new Date(eDate) },
      };
    }

    const history = await History.aggregate([
      {
        $match: matchQuery,
      },
      {
        $addFields: {
          shortDate: {
            $toDate: { $arrayElemAt: [{ $split: ["$date", ", "] }, 0] },
          },
        },
      },
      {
        $match: dateFilterQuery,
      },
      lookupQuery,
      unwindQuery,
      projectQuery,
      { $addFields: { sorting: { $toDate: "$date" } } },
      {
        $sort: { sorting: -1 },
      },
      {
        $facet: {
          callHistory: [
            { $skip: (start - 1) * limit }, //how many records you want to skip
            { $limit: limit },
          ],
          pageInfo: [
            { $group: { _id: null, totalRecord: { $sum: 1 } } }, //get total records count
          ],
          callCharge: [
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$coin",
                },
              },
            },
          ],
        },
      },
    ]);
    return res.status(200).json({
      status: true,
      message: "Success!!",
      // history,
      total:
        history[0].pageInfo.length > 0 ? history[0].pageInfo[0].totalRecord : 0,
      totalCoin:
        history[0].callCharge.length > 0 ? history[0].callCharge[0].total : 0,
      history: history[0].callHistory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//adminCoinHistory
exports.adminCoinHistory = async (req, res) => {
  try {
    if (!req.query.userId && !req.query.hostId) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!!" });
    }

    let userQuery, matchQuery, lookupQuery, unwindQuery, projectQuery, user;

    if (req.query.userId) {
      userQuery = await User.findById(req.query.userId);

      user = userQuery;

      if (!user)
        return res
          .status(200)
          .json({ status: false, message: "User does not found!!" });
      matchQuery = {
        $and: [
          { userId: { $eq: user._id } },
          { isIncome: { $eq: true } },
          { type: { $eq: 8 } },
        ],
      };

      lookupQuery = {
        $lookup: {
          from: "hosts",
          let: { hostId: "$hostId" },
          as: "host",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$hostId", "$_id"],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      };

      projectQuery = {
        $project: {
          callStartTime: 1,
          callEndTime: 1,
          callConnect: 1,
          videoCallType: 1,
          duration: 1,
          coin: 1,
          date: 1,
          isIncome: 1,
          type: 1,
          callType: {
            $cond: [
              { $eq: ["$callConnect", false] },
              "MissedCall",
              {
                $cond: [{ $eq: ["$userId", user._id] }, "Outgoing", "Incoming"],
              },
            ],
          },
          hostId: "$host._id",
          hostName: { $ifNull: ["$host.name", null] },
        },
      };

      unwindQuery = {
        $unwind: {
          path: "$host",
          preserveNullAndEmptyArrays: true,
        },
      };
    } else if (req.query.hostId) {
      userQuery = await Host.findById(req.query.hostId);

      user = userQuery;

      if (!user)
        return res
          .status(200)
          .json({ status: false, message: "Host does not found!!" });

      matchQuery = {
        $and: [
          { hostId: { $eq: user._id } },
          { isIncome: { $eq: true } },
          { type: { $eq: 8 } },
        ],
      };

      lookupQuery = {
        $lookup: {
          from: "users",
          as: "user",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$userId", "$_id"],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      };

      projectQuery = {
        $project: {
          callStartTime: 1,
          callEndTime: 1,
          callConnect: 1,
          coin: 1,
          date: 1,
          videoCallType: 1,
          isIncome: 1,
          duration: 1,
          type: 1,
          callType: {
            $cond: [
              { $eq: ["$callConnect", false] },
              "MissedCall",
              {
                $cond: [{ $eq: ["$hostId", user._id] }, "Outgoing", "Incoming"],
              },
            ],
          },
          userId: "$user._id",
          userName: { $ifNull: ["$user.name", null] },
        },
      };

      unwindQuery = {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      };
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const addFieldQuery_ = {
      shortDate: {
        $toDate: { $arrayElemAt: [{ $split: ["$date", ", "] }, 0] },
      },
    };

    let dateFilterQuery = {};

    if (req.query.startDate && req.query.endDate) {
      sDate = req.query.startDate + "T00:00:00.000Z";
      eDate = req.query.endDate + "T00:00:00.000Z";

      dateFilterQuery = {
        shortDate: { $gte: new Date(sDate), $lte: new Date(eDate) },
      };
    }

    //console.log("----ids----", ids);

    const history = await History.aggregate([
      { $match: matchQuery },
      {
        $addFields: addFieldQuery_,
      },
      {
        $match: dateFilterQuery,
      },
      {
        $sort: { date: -1 },
      },
      {
        $project: {
          _id: 1,
          hostId: 1,
          isIncome: 1,
          coin: 1,
          userId: 1,
          type: 1,
          date: 1,
        },
      },
      {
        $facet: {
          history: [
            { $skip: (start - 1) * limit }, //how many records you want to skip
            { $limit: limit },
          ],
          pageInfo: [
            { $group: { _id: null, totalRecord: { $sum: 1 } } }, //get total records count
          ],
          totalCoin: [
            {
              $group: {
                _id: null,
                totalCoin: { $sum: "$coin" },
              },
            },
          ],
        },
      },
    ]);

    //console.log("------History------", history);

    return res.status(200).json({
      status: true,
      message: "Success!!",
      history: history[0].history,
      total:
        history[0].pageInfo.length > 0 ? history[0].pageInfo[0].totalRecord : 0,
      totalCoin:
        history[0].totalCoin.length > 0 ? history[0].totalCoin[0].totalCoin : 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//make Call API
exports.makeCall = async (req, res) => {
  try {
    console.log("makeCall API called--------------------", req.body);
    if (
      !req.body ||
      !req.body.callerId ||
      !req.body.receiverId ||
      !req.body.videoCallType ||
      !req.body.statusType
    ) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!!!" });
    }

    const setting = await Setting.findOne({});

    if (!setting)
      return res
        .status(200)
        .json({ status: false, message: "Setting does not found!!" });

    const outgoing = new History();

    //Generate Token
    const role = RtcRole.PUBLISHER;
    const uid = req.body.agoraUID ? req.body.agoraUID : 0;
    const expirationTimeInSeconds = 24 * 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = await RtcTokenBuilder.buildTokenWithUid(
      setting.agoraKey,
      setting.agoraCertificate,
      outgoing._id.toString(),
      uid,
      role,
      privilegeExpiredTs
    );

    let userQuery, hostQuery;

    if (req.body.videoCallType === "user") {
      userQuery = await User.findById(req.body.callerId); //caller
      hostQuery = await Host.findById(req.body.receiverId); //receiver
    } else if (req.body.videoCallType === "host") {
      userQuery = await User.findById(req.body.receiverId); //receiver
      hostQuery = await Host.findById(req.body.callerId); //caller
    }

    const user = userQuery;

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not found!!" });
    }

    const host = hostQuery;

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Host does not found!!" });
    }

    console.log("host is busy in make call api-----------", host.isBusy);
    console.log("user is busy in make call api-----------", user.isBusy);

    console.log("req.body.statusType Before----", req.body.statusType);

    if (req.body.statusType !== "live") {
      console.log("req.body.statusType After----", req.body.statusType);

      if (
        (host.isBusy && req.body.videoCallType === "user") ||
        (req.body.videoCallType === "host" && user.isBusy)
      ) {
        console.log("host.isBusy----", host.isBusy);
        console.log("user.isBusy----", user.isBusy);

        return res.status(200).json({
          status: false,
          message: "Receiver is busy with Someone else!!!",
        });
      }

      // if (host.isConnect) {
      //   console.log("host.isConnect-----", host.isConnect);

      //   return res.status(200).json({
      //     status: false,
      //     message: "Host is busy with someone else!!!",
      //   });
      // }
    }

    host.isBusy = true;
    // host.isConnect = true;
    await host.save();

    user.isBusy = true;
    await user.save();

    //history for make call
    //outgoing history
    outgoing.userId = user._id; //caller userId
    outgoing.type = 3;
    outgoing.isIncome = false;
    outgoing.hostId = host._id; //call receiver hostId
    outgoing.callStartTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    outgoing.date = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    outgoing.videoCallType = req.body.videoCallType;
    outgoing.callUniqueId = outgoing._id;

    await outgoing.save();

    //income history
    const income = new History();

    income.userId = user._id; //caller userId
    income.type = 3; //3:call
    income.isIncome = true;
    income.hostId = host._id; //call receiver hostId
    income.callStartTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    income.date = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    income.videoCallType = req.body.videoCallType;
    income.callUniqueId = outgoing._id;

    await income.save();

    if (req.body.statusType === "live") {
      const liveHost = await LiveHost.findOne({ hostId: host._id });

      if (liveHost) {
        liveHost.isInCall = true;
        await liveHost.save();
      }
    }
    console.log("statusType  of make call--------", req.body.statusType);

    const videoCall = {
      callerId: req.body.callerId,
      receiverId: req.body.receiverId,
      videoCallType: req.body.videoCallType,
      callerImage: req.body.callerImage,
      callerName: req.body.callerName,
      live: req.body.statusType,
      token: token,
      channel: outgoing._id.toString(),
      callId: outgoing._id,
    };

    console.log("caller user busy in call api -----------", user.isBusy);
    console.log("receiver user busy in call api ----------", host.isBusy);
    console.log("videoCall----------", videoCall);

    return res.status(200).json({
      status: true,
      message: "Success!!",
      data: videoCall,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//history of call for app
exports.historyApp = async (req, res) => {
  try {
    if ((!req.query.userId && !req.query.hostId) || !req.query.type) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!!" });
    }

    let type;
    if (req.query.type === "call") {
      type = 3;
    }

    let userQuery, matchQuery, lookupQuery, unwindQuery, projectQuery, user;

    if (req.query.userId) {
      userQuery = await User.findById(req.query.userId);

      user = userQuery;

      if (!user)
        return res
          .status(200)
          .json({ status: false, message: "User does not found!!" });

      matchQuery = {
        $and: [
          { userId: { $eq: user._id } },
          { type: { $eq: type } },
          {
            $or: [
              { isIncome: { $eq: false } },
              {
                $and: [{ isIncome: { $eq: true } }, { hostId: { $eq: null } }],
              },
            ],
          },
        ],
      };

      lookupQuery = {
        $lookup: {
          from: "hosts",
          let: { hostId: "$hostId" },
          as: "host",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$hostId", "$_id"],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      };

      projectQuery = {
        $project: {
          callStartTime: 1,
          callEndTime: 1,
          callConnect: 1,
          videoCallType: 1,
          duration: 1,
          coin: 1,
          date: 1,
          isIncome: 1,
          type: 1,
          callType: {
            $cond: [
              { $eq: ["$callConnect", false] },
              "MissedCall",
              {
                $cond: [{ $eq: ["$userId", user._id] }, "Outgoing", "Incoming"],
              },
            ],
          },
          hostId: "$host._id",
          hostName: { $ifNull: ["$host.name", null] },
        },
      };

      unwindQuery = {
        $unwind: {
          path: "$host",
          preserveNullAndEmptyArrays: true,
        },
      };
    } else if (req.query.hostId) {
      userQuery = await Host.findById(req.query.hostId);

      user = userQuery;

      if (!user)
        return res
          .status(200)
          .json({ status: false, message: "Host does not found!!" });

      matchQuery = {
        $and: [
          { hostId: { $eq: user._id } },
          { type: { $eq: type } },
          {
            $or: [
              { isIncome: { $eq: true } },
              {
                $and: [{ isIncome: { $eq: false } }, { userId: { $eq: null } }],
              },
            ],
          },
        ],
      };

      lookupQuery = {
        $lookup: {
          from: "users",
          as: "user",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$userId", "$_id"],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      };

      projectQuery = {
        $project: {
          callStartTime: 1,
          callEndTime: 1,
          callConnect: 1,
          coin: 1,
          date: 1,
          videoCallType: 1,
          isIncome: 1,
          duration: 1,
          type: 1,
          callType: {
            $cond: [
              { $eq: ["$callConnect", false] },
              "MissedCall",
              {
                $cond: [{ $eq: ["$hostId", user._id] }, "Outgoing", "Incoming"],
              },
            ],
          },
          userId: "$user._id",
          userName: { $ifNull: ["$user.name", null] },
        },
      };

      unwindQuery = {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      };
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    if (req.query.type === "call") {
      const history = await History.aggregate([
        {
          $match: matchQuery,
        },
        {
          $sort: { date: -1 },
        },
        lookupQuery,
        unwindQuery,
        projectQuery,
        {
          $facet: {
            callHistory: [
              { $skip: (start - 1) * limit }, //how many records you want to skip
              { $limit: limit },
            ],
            pageInfo: [
              { $group: { _id: null, totalRecord: { $sum: 1 } } }, //get total records count
            ],
            callCharge: [
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: {
                      $cond: [
                        { $eq: [type, 3] },
                        {
                          $cond: [{ $eq: ["$callConnect", true] }, "$coin", 0],
                        },
                        "$coin",
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      ]);
      return res.status(200).json({
        status: true,
        message: "Success!!",
        total:
          history[0].pageInfo.length > 0
            ? history[0].pageInfo[0].totalRecord
            : 0,
        totalCoin:
          history[0].callCharge.length > 0 ? history[0].callCharge[0].total : 0,
        history: history[0].callHistory,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
