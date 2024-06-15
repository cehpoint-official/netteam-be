const Request = require("./request.model");
const User = require("../user/model");
const Host = require("../host/host.model");
const { deleteFile } = require("../../util/deleteFile");

const { baseURL } = require("../../config");
const fs = require("fs");

//Request Create API [App]
exports.requestStore = async (req, res) => {
  try {
    if (!req.body.bio || !req.body.userId || !req.files || !req.body.country) {
      deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    const existRequest = await Request.findOne({ userId: user._id });

    if (existRequest?.isAccepted === false) {
      return res.status(200).json({
        status: true,
        message: "You have already sent host request!! ",
      });
    }

    if (existRequest?.isAccepted === true) {
      const host = await Host.findOne({ uniqueID: existRequest.uniqueID });

      // console.log("host---", host);

      if (!host) {
        return res.status(200).json({
          status: false,
          message: "This User is Not Host!!",
        });
      }

      return res.status(200).json({
        status: false,
        message: "This user Is Already Become a Host!!",
        request: host,
      });
    }

    const request = new Request();

    request.userId = user._id;
    request.uniqueID = user.uniqueID;
    request.name = user.name;
    request.bio = req?.body?.bio;
    request.age = user.age;
    request.image = baseURL + req?.files?.image[0].path;
    request.video = baseURL + req?.files?.video[0].path;
    request.gender = user.gender;
    request.email = user.email;
    request.country = req?.body?.country;
    request.identity = user.identity;
    request.date = new Date().toLocaleString("en-US");

    await request.save();

    return res.status(200).json({
      status: true,
      message: "Host Request Sent Successfully!",
      request,
    });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//All Request Get API [App,Backend]
exports.requestGet = async (req, res) => {
  try {
    const requestAll = await Request.find({ isAccepted: false });

    const requestCount = await Request.find().countDocuments();

    return res.status(200).json({
      status: true,
      message: "request get successfully!!",
      requestCount,
      requestAll,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error!!",
    });
  }
};

//Request Update [Backend]
exports.requestUpdate = async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(200).json({ status: false, message: "Host Request Not Found!!" });
    }

    if (req.files.image) {
      if (request.image) {
        const image = request?.image.split("storage");
        if (image) {
          if (fs.existsSync("storage" + image[1])) {
            fs.unlinkSync("storage" + image[1]);
          }
        }
      }
      request.image = baseURL + req.files.image[0].path;
    }

    if (req.files.video) {
      if (request.video) {
        const video = request?.video.split("storage");
        if (video) {
          if (fs.existsSync("storage" + video[1])) {
            fs.unlinkSync("storage" + video[1]);
          }
        }
      }
      request.video = baseURL + req.files.video[0].path;
    }

    request.name = req.body.name ? req.body.name : request.name;
    request.bio = req.body.bio ? req.body.bio : request.bio;
    request.age = req.body.age ? parseInt(req.body.age) : request.age;
    request.gender = req.body.gender ? req.body.gender : request.gender;
    request.email = req.body.email ? req.body.email : request.email;
    await request.save();

    const data = await Request.findById(request._id);

    return res.status(200).json({ status: true, message: "Success", request: data });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//Host Request Accept [Backend]
exports.requestAccept = async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(200).json({ status: false, message: "Request Not Found!!" });

    if (request.isAccepted === true) {
      return res.status(200).json({ status: false, message: "This Host Is already Accept!!!" });
    }

    request.isAccepted = true;
    await request.save();

    const user = await User.findById(request.userId);

    user.isHost = true;
    await user.save();

    const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }

    const host = new Host();

    host.name = request.name;
    host.bio = request.bio;
    host.image = request.image;
    host.album = request.image;
    host.uniqueID = request.uniqueID;
    host.password = password;
    host.gender = request.gender;
    host.email = request.email;
    host.age = request.age;
    host.identity = request.identity;
    host.country = request.country;

    await host.save();

    return res.status(200).json({ status: true, message: "Success!!", request });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!!",
    });
  }
};
