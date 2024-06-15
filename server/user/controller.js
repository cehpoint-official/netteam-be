const User = require("./model");

//import model
const Host = require("../host/host.model");
const History = require("../history/history.model");

//config
const config = require("../../config");

//nodemailer
var nodemailer = require("nodemailer");

//fs
const fs = require("fs");

//login and Create user API [App]
exports.loginUser = async (req, res) => {
  try {
    if (!req.body.identity || req.body.loginType === undefined || !req.body.fcm_token)
      return res.status(200).json({ status: false, message: "Invalid Details!!" });

    let userQuery;

    if (req.body.loginType == 0) {
      if (req.body.identity) {
        userQuery = await User.findOne({ identity: req.body.identity });
      }
    } else if (req.body.loginType == 1) {
      if (!req.body.email) {
        return res.status(200).json({ status: false, message: "Email is required!!" });
      }

      // if (req.body.identity) {
      //   userQuery = await User.findOne({
      //     $or: [{ identity: req.body.identity }, { email: req.body.email }],
      //   });
      // }

      userQuery = await User.findOne({ email: req.body.email });
    } else if (req.body.loginType == 2) {
      if (!req.body.uniqueID) {
        return res.status(200).json({ status: false, message: "uniqueID is required!!" });
      }

      if (!req.body.password) {
        return res.status(200).json({ status: false, message: "Password is required!!" });
      }

      if (req.body.uniqueID) {
        userQuery = await User.findOne({ uniqueID: req.body.uniqueID });
      }

      if (!user || req.body.uniqueID != user.uniqueID) {
        return res.status(200).json({ status: false, message: "Invalid uniqueID" });
      }

      if (req.body.password != user.password) {
        return res.status(200).json({ status: false, message: "Invalid Password" });
      }
    }

    const user = userQuery;

    if (user) {
      console.log("user login");

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "You are blocked by admin!" });
      }

      const user_ = await userFunction(user, req);

      return res.status(200).json({
        status: true,
        message: "User login Successfully!!",
        user: user_,
      });
    } else {
      console.log("new user");

      const newUser = new User();

      //unique ID Create
      let LastUser = await User.findOne().sort({ uniqueID: -1 });
      const cnt = parseInt(LastUser?.uniqueID);
      var count;
      if (!cnt) {
        count = 1;
      } else {
        count = cnt + 1;
      }

      var size = count.toString().length;
      newUser.uniqueID =
        size === 1
          ? `000000${count}`
          : size === 2
          ? `00000${count}`
          : size === 3
          ? `0000${count}`
          : size === 4
          ? `000${count}`
          : size === 5
          ? `00${count}`
          : size === 6
          ? `0${count}`
          : count;

      //Password Generate
      const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let password = "";
      for (let i = 0; i < 8; i++) {
        password += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
      newUser.password = password;
      newUser.isSignup = true;
      newUser.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

      const user = await userFunction(newUser, req);

      // var transporter = nodemailer.createTransport({
      //   service: "gmail",
      //   auth: {
      //     user: "madhurmk40@gmail.com",
      //     pass: "fdydknibeszaglxo",
      //   },
      // });

      // var mailOptions = {
      //   from: "madhurmk40@gmail.com",
      //   to: user.email,
      //   subject: "Hokoo Password",
      //   text: `Your One Time Password is ${user.password}`,
      // };

      // transporter.sendMail(mailOptions, function (error, info) {
      //   if (error) {
      //     console.log(error);
      //   } else {
      //     console.log("Email sent: " + info.response);
      //   }
      // });

      return res.status(200).json({
        status: true,
        message: "Signup Success And Your Password Send In your Email!!",
        user,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error!!",
    });
  }
};

const userFunction = async (user, data_) => {
  const data = data_.body;
  const file = data_.file;

  user.name = data.name ? data.name : user.name;
  user.email = data.email ? data.email : user.email;
  user.mobileNumber = data.mobileNumber ? data.mobileNumber : user.mobileNumber;
  user.identity = data.identity;
  user.loginType = data.loginType ? data.loginType : user.loginType;
  user.platformType = data.platformType ? data.platformType : user.platformType;
  user.gender = data.gender ? data.gender : user.gender;
  user.image = data.image
    ? data.image
    : !user.image
    ? !file
      ? user.gender === "Female"
        ? `${config.baseURL}storage/female.png`
        : `${config.baseURL}storage/male.png`
      : config.baseURL + file.path
    : user.image;

  user.dob = data.dob ? data.dob : user.dob;
  user.coin = data.coin ? data.coin : user.coin;
  user.fcm_token = data.fcm_token;
  user.age = data.age;
  user.country = data.country ? data.country.toLowerCase().trim() : user.country;
  user.lastLogin = new Date().toLocaleString("en-US");
  user.uniqueID = data.uniqueID ? data.uniqueID : user.uniqueID;

  // var newUsers;

  // if (data.loginType == 1 || data.loginType == 2) {
  //   newUsers = await User.findOne({ email: user.email });
  // }

  // if (!newUsers) {
  //   await user.save();
  // }
  // const users = await User.findById(user._id);
  // return users;

  await user.save();
  return user;
};

//All User Get API  [Backend]
exports.userGet = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const userCount = await User.find().countDocuments();

    const userAll = await User.find()
      .select("name image email gender country coin isBlock")
      .skip((start - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      status: true,
      message: "finally , get all users by the admin.",
      userCount,
      userAll,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Sever Error" });
  }
};

//Single User Get API [App,Backend]
//exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.query.userId);

//     if (!user)
//       return res
//         .status(200)
//         .json({ status: false, message: "User does not Exist!!" });

//     if (user.plan.coinPlanId !== null && user.plan.planStartDate !== null) {
//       const user_ = await checkPlan(user._id);

//       return res
//         .status(200)
//         .json({ status: true, message: "Success!!", user: user_ });
//     }

//     const user_ = await checkPlan(user._id);
//     return res
//       .status(200)
//       .json({ status: true, message: "Success!!", user: user_ });
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .json({
//         status: false,
//         error: error.message || "Internal Server Error!!",
//       });
//   }
//};

exports.userProfile = async (req, res) => {
  try {
    const ID = req.query.id;
    const findUser = await User.findById(ID);

    //console.log("findUser----------", findUser);

    if (!ID || !findUser) {
      return res.status(400).json({ status: false, message: "Invalid ID" });
    }

    return res.status(200).json({
      status: true,
      message: "User Profile Get Successfully",
      findUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Sever Error" });
  }
};

//Update User API [App]
exports.updateUser = async (req, res) => {
  try {
    if (!req.body.userId) {
      return res.status(200).json({ status: false, message: "Invalid Details!" });
    }

    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not Exist!" });
    }

    if (req.file) {
      if (user.image) {
        const image = user.image.split("storage");

        if (image[1] !== "/male.png" && image[1] !== "/female.png") {
          if (image) {
            if (fs.existsSync("storage" + image[1])) {
              fs.unlinkSync("storage" + image[1]);
            }
          }
        }
      }
      user.image = config.baseURL + req.file.path;
    }

    user.name = req.body.name ? req.body.name : user.name;
    user.gender = req.body.gender ? req.body.gender : user.gender;
    user.bio = req.body.bio ? req.body.bio : user.bio;
    user.dob = req.body.dob ? req.body.dob : user.dob;
    user.country = req.body.country ? req.body.country.toLowerCase().trim() : user.country;

    user.age = req.body.age ? parseInt(req.body.age) : user.age;

    await user.save();

    return res.status(200).json({ status: true, message: "Success", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Sever Error" });
  }
};

//user block or unblock
exports.isBlock = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, massage: "UserId is requried!!" });
    }

    const user = await User.findById(req.query.userId);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    user.isBlock = !user.isBlock;

    await user.save();

    return res.status(200).json({
      status: true,
      message: "Success!!",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//check user plan is expired or not
const checkPlan = async (userId, res) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not exist!!" });
    }

    if (user.plan.planStartDate !== null && user.plan.coinPlanId !== null) {
      const plan = await premiumPlan.findById(user.plan.coinPlanId);

      if (!plan) {
        return res.status(200).json({ status: false, message: "Plan does not exist!!" });
      }

      if (plan.validityType.toLowerCase() === "day") {
        const diffTime = moment(new Date()).diff(moment(new Date(user.plan.planStartDate)), "day");
        if (diffTime > plan.validity) {
          user.isIncome = false;
          user.plan.planStartDate = null;
          user.plan.coinPlanId = null;
        }
      }
      if (plan.validityType.toLowerCase() === "month") {
        const diffTime = moment(new Date()).diff(moment(new Date(user.plan.planStartDate)), "month");
        if (diffTime >= plan.validity) {
          user.isIncome = false;
          user.plan.planStartDate = null;
          user.plan.coinPlanId = null;
        }
      }
      if (plan.validityType.toLowerCase() === "year") {
        const diffTime = moment(new Date()).diff(moment(new Date(user.plan.planStartDate)), "year");
        if (diffTime >= plan.validity) {
          user.isIncome = false;
          user.plan.planStartDate = null;
          user.plan.coinPlanId = null;
        }
      }
    }

    await user.save();

    const user_ = await User.findById(userId);
    return user_;
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error!!!",
    });
  }
};

//admin can add or less the Coin or diamond of user through admin panel
exports.addOrLessCoin = async (req, res) => {
  try {
    if (!req.body.userId && !req.body.hostId) return res.status(200).json({ status: false, message: "Invalid details!!" });

    let userQuery;

    if (req.body.userId) {
      userQuery = await User.findById(req.body.userId);
    } else {
      userQuery = await Host.findById(req.body.hostId);
    }

    const user = userQuery;

    if (!user) return res.status(200).json({ status: false, message: "User does not found!!" });

    if (req.body.coin && parseInt(req.body.coin) === user.coin)
      return res.status(200).json({
        status: true,
        message: "Success!!",
        user,
      });

    const history = new History();

    if (req.body.coin) {
      if (user.coin > req.body.coin) {
        //put entry on history in outgoing
        history.isIncome = false;
        history.coin = user.coin - req.body.coin;
      } else {
        //put entry on history in income
        history.isIncome = true;
        history.coin = req.body.coin - user.coin;
      }
      user.coin = req.body.coin;
    }

    await user.save();

    if (req.body.userId) {
      history.userId = user._id;
    } else {
      history.hostId = user._id;
    }
    history.type = 8;
    history.date = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    await history.save();

    return res.status(200).json({
      status: true,
      message: "Success!!",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//admin can add or less the Coin or diamond of user through admin panel
exports.addCoinByAdmin = async (req, res) => {
  try {
    if (!req.body.uniqueID || !req.body.coin) return res.status(200).json({ status: false, message: "Invalid details!!" });
    if (req.body.coin < 0) return res.status(200).json({ status: false, message: "Coin is not decrease!!" });

    const user = await User.findOne({
      uniqueID: req.body.uniqueID,
      isHost: false,
    });

    if (!user) return res.status(200).json({ status: false, message: "User does not found!!" });

    user.coin = parseInt(user.coin) + parseInt(req.body.coin);
    await user.save();

    const history = new History();

    history.isIncome = true;
    history.coin = parseInt(req.body.coin);
    history.userId = user;
    history.hostId = null;
    history.type = 8;
    history.date = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    await history.save();

    return res.status(200).json({
      status: true,
      message: "Success!!",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get admin addCoin history
exports.adminAddCoinHistory = async (req, res) => {
  try {
    const history = await History.find({ type: 8, hostId: null })
      .sort({
        createdAt: -1,
      })
      .populate("userId", "uniqueID");

    return res.status(200).json({
      status: true,
      message: "Success!!",
      history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
