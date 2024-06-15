const Notification = require("./notification.model");

//import model
const User = require("../user/model");
const Host = require("../host/host.model");

const dayjs = require("dayjs");

var utc = require("dayjs/plugin/utc");
var timezone = require("dayjs/plugin/timezone");
dayjs.extend(timezone);
dayjs.extend(utc);

var FCM = require("fcm-node");
const { baseURL, SERVER_KEY } = require("../../config");
var fcm = new FCM(SERVER_KEY);

//Get User Notification List
exports.getUserNotificationList = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid details!!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const user = await User.findById(req.query.userId);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "user not found!!" });
    }

    const notification = await Notification.aggregate([
      { $match: { userId: user._id } },
      { $match: { $or: [{ type: null }, { type: "user" }] } },
      {
        $project: {
          userId: 1,
          hostId: 1,
          notificationType: 1,
          message: 1,
          type: 1,
          title: 1,
          image: 1,
          album: 1,
          date: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          notification: [
            { $skip: start }, // how many records you want to skip
            { $limit: limit },
          ],
        },
      },
    ]);

    let now = dayjs().tz("Asia/Kolkata");

    const notificationList = notification[0].notification.map((data) => ({
      ...data,
      time:
        now.diff(data.date, "minute") <= -290 &&
        now.diff(data.date, "minute") >= -330
          ? now.diff(data.date, "minute") + 329 + " minutes ago"
          : now.diff(data.date, "hour") >= 24
          ? dayjs(data.date).format("DD MMM, YYYY")
          : now.diff(data.date, "hour") + 4 + " hour ago",
    }));

    if (notification[0].notification.length === 0) {
      return res
        .status(200)
        .json({ status: false, message: "No data found!!", notification: [] });
    }

    return res.status(200).json({
      status: true,
      message: "Success!!",
      notification: notificationList,
      //notification: [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//Get Host Notification List
exports.getHostNotificationList = async (req, res) => {
  try {
    if (!req.query.hostId) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid details!!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const host = await Host.findById(req.query.hostId);

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "host not found!!" });
    }

    const notification = await Notification.aggregate([
      { $match: { hostId: host._id } },
      { $match: { $or: [{ type: null }, { type: "host" }] } },
      {
        $project: {
          userId: 1,
          hostId: 1,
          notificationType: 1,
          message: 1,
          type: 1,
          title: 1,
          image: 1,
          date: 1, //user.name if it is non-null  //"Admin" string if user.name is null or missing.
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          notification: [
            { $skip: start }, // how many records you want to skip
            { $limit: limit },
          ],
        },
      },
    ]);

    let now = dayjs().tz("Asia/Kolkata");

    const notificationList = notification[0].notification.map((data) => ({
      ...data,
      time:
        now.diff(data.date, "minute") <= -290 &&
        now.diff(data.date, "minute") >= -330
          ? now.diff(data.date, "minute") + 329 + " minutes ago"
          : now.diff(data.date, "hour") >= 24
          ? dayjs(data.date).format("DD MMM, YYYY")
          : now.diff(data.date, "hour") + 4 + " hour ago",
    }));

    if (notification[0].notification.length === 0) {
      return res
        .status(200)
        .json({ status: false, message: "No data found!!", notification: [] });
    }

    return res.status(200).json({
      status: true,
      message: "Success!!",
      notification: notificationList,
      // notification: [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//send notification by admin panel
exports.sendNotification = async (req, res) => {
  try {
    if (req.body.notificationType.trim().toLowerCase() === "user") {
      const user = await User.find({
        $and: [{ isBlock: false }, { isHost: false }],
      }).distinct("fcm_token");

      const user_ = await User.find({
        $and: [{ isBlock: false }, { isHost: false }],
      });

      const payload = {
        registration_ids: user,
        notification: {
          body: req.body.description,
          title: req.body.title,
          image: req.file ? baseURL + req.file.path : "",
        },
        data: {
          data: {},
          type: "ADMIN",
          loginType: "user",
        },
      };

      await user_.map(async (data) => {
        const notification = new Notification();

        notification.userId = data._id;
        notification.title = req.body.title;
        notification.message = req.body.description;
        notification.image = req.file ? baseURL + req.file.path : "";
        notification.notificationType = 0;
        notification.type = "user";
        notification.date = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        });

        await notification.save();
      });

      await fcm.send(payload, function (err, response) {
        if (response) {
          console.log("Successfully sent with response: ", response);
          return res.status(200).json({
            status: true,
            message: "Successfully sent message!!!",
          });
        } else {
          console.log("Something has gone wrong!", err);
          return res.status(200).json({
            status: false,
            message: "Something has gone wrong!!",
          });
        }
      });
    } else if (req.body.notificationType.trim().toLowerCase() === "host") {
      const host = await Host.find({
        $and: [{ isBlock: false }, { isHost: true }],
      }).distinct("fcm_token");

      const host_ = await Host.find({
        $and: [{ isBlock: false }, { isHost: true }],
      });

      const payload = {
        registration_ids: host,
        notification: {
          body: req.body.description,
          title: req.body.title,
          image: req.file ? baseURL + req.file.path : "",
        },
        data: {
          data: {},
          type: "ADMIN",
          loginType: "host",
        },
      };

      host_.map(async (data) => {
        const notification = new Notification();

        notification.hostId = data._id;
        notification.title = req.body.title;
        notification.image = req.file ? baseURL + req.file.path : "";
        notification.message = req.body.description;
        notification.notificationType = 0;
        notification.type = "host";
        notification.date = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        });

        await notification.save();
      });

      await fcm.send(payload, function (err, response) {
        if (response) {
          console.log("Successfully sent with response: ", response);

          return res.status(200).json({
            status: true,
            message: "Successfully sent message",
          });
        } else {
          console.log("Something has gone wrong!", err);

          return res.status(200).json({
            status: false,
            message: "Something has gone wrong!!",
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal server error!!",
    });
  }
};

//add field in user model
exports.updateFCM = async (req, res) => {
  try {
    console.log("aavyuu");
    if (!req.query.fcm_token || !req.query.userId || !req.query.type) {
      return res.status(200).json({
        status: false,
        message: "Invalid Details!",
      });
    }
    var query;
    if (req.query.type === "user") {
      query = await User.findById(req.query.userId);
    } else if (req.query.type === "host") {
      query = await Host.findById(req.query.userId);
    }

    const user = query;
    if (!user)
      return res.status(200).json({ status: false, message: "User not found" });

    user.fcm_token = req.query.fcm_token;
    await user.save();

    return res.status(200).json({ status: true, message: "Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error !",
    });
  }
};
