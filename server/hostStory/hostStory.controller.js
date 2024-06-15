const HostStory = require("./hostStory.model");

// import model
const Host = require("../host/host.model");
const ViewStory = require("../viewStory/viewStory.model");
const User = require("../user/model");

//import config
const config = require("../../config");

const { deleteFile } = require("../../util/deleteFile");
const fs = require("fs");

//create story
exports.store = async (req, res) => {
  try {
    if (!req.body.hostId || !req.files) return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });

    const host = await Host.findById(req.body.hostId);
    if (!host) {
      return res.status(200).json({ status: false, message: "Host does not Exist!!" });
    }

    const story = await new HostStory();

    if (req.files.image) {
      story.image = config.baseURL + req.files.image[0].path;
    }

    if (req.files.video) {
      story.video = config.baseURL + req.files.video[0].path;
    }

    story.hostId = host._id;
    story.startDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    story.endDate = new Date(new Date().setSeconds(new Date().getSeconds() + 86400)).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    const createdAt = new Date();
    console.log("createdAt in story create: ", createdAt);

    const expirationDate = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); //Add 24 hours in milliseconds
    story.expiration_date = expirationDate;

    await story.save();

    return res.status(200).json({ status: true, message: "Success", story });
  } catch (error) {
    console.log(error);
    if (req.files.image) deleteFile(req.files.image[0]);
    if (req.files.video) deleteFile(req.files.video[0]);
    return res.status(200).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get host story list for user
exports.getHostStory = async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);

    if (!user) return res.status(200).json({ status: false, message: "User does not found!!" });

    const story = await HostStory.aggregate([
      {
        $lookup: {
          from: "viewstories",
          let: {
            user: user._id,
            story: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$storyId", "$$story"] }, { $eq: ["$userId", "$$user"] }],
                },
              },
            },
          ],
          as: "isView",
        },
      },
      {
        $project: {
          // hostStory: "$hostStory",
          image: 1,
          video: 1,
          view: 1,
          hostId: 1,
          startDate: 1,
          endDate: 1,
          createdAt: 1,
          isView: {
            $cond: [{ $eq: [{ $size: "$isView" }, 0] }, false, true],
          },
        },
      },
      {
        $group: {
          _id: "$hostId",
          hostStory: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "hosts",
          localField: "_id",
          foreignField: "_id",
          as: "host",
        },
      },
      {
        $unwind: {
          path: "$host",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: "$host._id",
          hostName: "$host.name",
          hostImage: "$host.image",
          hostStory: 1,
          createdAt: "$host.createdAt",
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json({
      status: true,
      message: "Success!!",
      story,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: true,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//delete story
exports.delete = async (req, res) => {
  try {
    if (!req.query.storyId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const story = await HostStory.findById(req.query.storyId);

    if (!story) {
      return res.status(200).json({ status: false, message: "Story does not exist!!" });
    }

    if (fs.existsSync(story.image)) {
      fs.unlinkSync(story.image);
    }

    if (fs.existsSync(story.video)) {
      fs.unlinkSync(story.video);
    }

    await ViewStory.deleteMany({ storyId: story._id });

    await story.deleteOne();

    return res.status(200).json({ status: true, message: "data deleted successfully!!" });
  } catch (error) {
    console.log(error);
    deleteFile(req.files);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get all story hostWise
exports.hostWiseAllStory = async (req, res) => {
  try {
    if (!req.query.hostId) return res.status(200).json({ status: false, message: "Host id is required!!" });

    const host = await Host.findById(req.query.hostId);

    if (!host) {
      return res.status(200).json({ status: false, message: "Host does not exist!!" });
    }

    const story = await HostStory.find({ hostId: req.query.hostId }).sort({
      createdAt: 1,
    });

    return res.status(200).json({ status: true, message: "Success!!", story });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//story deleted after 24 hourFunction
exports.expireStory = async (req, res) => {
  const story = await HostStory.find();

  const crtDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

  await story.map(async (exStory) => {
    if (crtDate > exStory.endDate) {
      console.log("ex", exStory.endDate);
      console.log("ctrDate", crtDate);
      console.log("this story deleted after 24 hour--------", exStory);

      const story_ = await HostStory.findById(exStory._id);

      if (story_) {
        if (fs.existsSync(story_.image)) {
          fs.unlinkSync(story_.image);
        }
        if (fs.existsSync(story_.video)) {
          fs.unlinkSync(story_.video);
        }
      }

      await ViewStory.deleteMany({ storyId: story_?._id });

      await story_.deleteOne();
      return story_;
    }
  });
};
