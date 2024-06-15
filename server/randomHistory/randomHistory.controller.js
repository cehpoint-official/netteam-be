const RandomHistory = require("./randomHistory.model");

//import model
const User = require("../user/model");
const Host = require("../host/host.model");
const Block = require("../block/block.model");

//get randomMatch history for user
exports.hostMatchHistory = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res
        .status(200)
        .json({ status: false, message: "User Id is required!!" });
    }

    const user = await User.findById(req.query.userId);

    if (!user) {
      return res
        .status(200)
        .json({ status: "false", message: "User does not found!!" });
    }

    const blockHost = await Block.find({ userId: user._id }).distinct("hostId");

    const randomHistory = await RandomHistory.aggregate([
      {
        $match: {
          userId: user._id,
        },
      },
      { $match: { hostId: { $nin: blockHost } } },
      // {
      //   $sort: { createdAt: -1 },
      // },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $lookup: {
          from: "hosts",
          let: { hostId: "$hostId" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$hostId"] } } }],
          as: "hostId",
        },
      },
      {
        $project: {
          user: { $first: "$userId" },
          host: { $first: "$hostId" },
          date: 1,
        },
      },
      {
        $project: {
          userName: "$user.name",
          hostName: "$host.name",
          hostId: "$host._id",
          coin: "$host.coin",
          hostImage: "$host.image",
          profileImage: "$host.profileImage",
          hostCountry: "$host.country",
          hostAge: "$host.age",
          hostGender: "$host.gender",
          isOnline: "$host.isOnline",
          callCharge: "$host.callCharge",
          date: 1,
        },
      },
      { $addFields: { sortDate: { $toDate: "$date" } } },
      { $sort: { sortDate: -1 } },
    ]);

    if (randomHistory.length === 0) {
      return res
        .status(200)
        .json({ status: false, message: "No data found!!" });
    } else {
      return res.status(200).json({
        status: true,
        message: "success",
        //data: [],
        data: randomHistory,
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

//get randomMatch history for host
exports.userMatchHistory = async (req, res) => {
  try {
    if (!req.query.hostId) {
      return res
        .status(200)
        .json({ status: false, message: "Host Id is required!!" });
    }

    const host = await Host.findById(req.query.hostId);

    if (!host) {
      return res
        .status(200)
        .json({ status: "false", message: "Host does not exist!!" });
    }
    const blockUser = await Block.find({ hostId: host._id }).distinct("userId");

    const randomHistory = await RandomHistory.aggregate([
      {
        $match: {
          hostId: host._id,
        },
      },
      { $match: { userId: { $nin: blockUser } } },
      // {
      //   $sort: { createdAt: -1 },
      // },
      {
        $lookup: {
          from: "users",
          let: { userId: "$userId" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }],
          as: "userId",
        },
      },
      {
        $lookup: {
          from: "hosts",
          localField: "hostId",
          foreignField: "_id",
          as: "hostId",
        },
      },
      {
        $project: {
          user: { $first: "$userId" },
          host: { $first: "$hostId" },
          date: 1,
        },
      },
      {
        $project: {
          userName: "$user.name",
          userImage: "$user.image",
          userGender: "$user.gender",
          userId: "$user._id",
          coin: "$user.coin",
          userCountry: "$user.country",
          userAge: "$user.age",
          isOnline: "$user.isOnline",
          hostName: "$host.name",
          date: 1,
        },
      },
      { $addFields: { sortDate: { $toDate: "$date" } } },
      { $sort: { sortDate: -1 } },
    ]);

    if (randomHistory.length === 0) {
      return res
        .status(200)
        .json({ status: false, message: "No data found!!" });
    } else {
      return res.status(200).json({
        status: true,
        message: "success",
        //data: [],
        data: randomHistory,
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
