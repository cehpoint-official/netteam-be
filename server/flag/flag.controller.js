const Flag = require("./flag.model");
const axios = require("axios");

exports.store = async (req, res) => {
  console.log("--");
  try {
    await axios
      .get("https://restcountries.com/v2/all")
      .then(async (res) => {
        console.log("     response log   ", res.data.length);
        await res.data.map(async (data) => {
          const flag = new Flag();
          flag.name = data.name;
          flag.flag = data.flag;
          await flag.save();
        });
      })
      .catch((error) => {
        {
          console.log(error);
        }
      });
    return res.status(200).json({ status: true, message: "Success" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};
exports.index = async (req, res) => {
  try {
    const flag = await Flag.find();
    return res.status(200).json({ status: true, message: "Success", flag });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};
