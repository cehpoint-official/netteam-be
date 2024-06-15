//Model
const Block = require("./block.model");

//import model
const User = require("../user/model");
const Host = require("../host/host.model");

//block unblock User or Host
exports.blockUnblock = async (req, res) => {
  try {
    if (!req.body || !req.body.type || !req.body.userId || !req.body.hostId) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid detalis!!" });
    }

    const user = await User.findById(req.body.userId);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not exists!!" });
    }

    const host = await Host.findById(req.body.hostId);

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Host does not exists!!" });
    }

    const block = await Block.findOne({
      $and: [
        {
          userId: user._id,
          hostId: host._id,
          type: req.body.type,
        },
      ],
    });

    if (block) {
      await Block.deleteOne({
        userId: user._id,
        hostId: host._id,
        type: req.body.type,
      });

      return res.status(200).send({
        status: true,
        message: "Unblocked Successfully!!",
        isBlock: false,
      });
    } else {
      const block = await Block();

      block.userId = user._id;
      block.hostId = host._id;
      block.type = req.body.type;

      await block.save();

      return res.status(200).json({
        status: true,
        message: "Blocked Successfully!!",
        isBlock: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get Block List of user or host
exports.getBlockUserHost = async (req, res) => {
  try {
    if (!req.query.type) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid details!!" });
    }

    let user, host, matchQuery, lookupMatch, projectMatch, unwindMatch;

    if (req.query.type === "user") {
      if (!req.query.userId) {
        return res
          .status(200)
          .json({ status: false, message: "UserId is requried!!" });
      }

      user = await User.findById(req.query.userId);

      if (!user) {
        return res
          .status(200)
          .json({ status: false, message: "User does not exist!!" });
      }

      matchQuery = { $and: [{ userId: user._id }, { type: "user" }] };

      lookupMatch = {
        $lookup: {
          from: "hosts",
          as: "host",
          localField: "hostId",
          foreignField: "_id",
        },
      };

      unwindMatch = {
        $unwind: {
          path: "$host",
          preserveNullAndEmptyArrays: false,
        },
      };

      projectMatch = {
        $project: {
          name: "$host.name",
          image: "$host.image",
          blockId: "$host._id",
        },
      };
    } else if (req.query.type === "host") {
      if (!req.query.hostId) {
        return res
          .status(200)
          .json({ status: false, message: "HostId is required!!" });
      }

      host = await Host.findById(req.query.hostId);

      if (!host) {
        return res
          .status(200)
          .json({ status: false, message: "Host does not exist!!" });
      }

      matchQuery = matchQuery = {
        $and: [{ hostId: host._id }, { type: "host" }],
      };

      lookupMatch = {
        $lookup: {
          from: "users",
          as: "user",
          localField: "userId",
          foreignField: "_id",
        },
      };

      unwindMatch = {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      };

      projectMatch = {
        $project: {
          name: "$user.name",
          image: "$user.image",
          blockId: "$user._id",
        },
      };
    }

    const block = await Block.aggregate([
      {
        $match: matchQuery,
      },
      lookupMatch,
      unwindMatch,
      projectMatch,
    ]);

    if (block.length === 0) {
      return res
        .status(200)
        .json({ status: false, message: "No data found!!" });
    }

    return res.status(200).json({
      status: true,
      message: "Success!!",
      block,
      //block: [],
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
