const ViewStory = require("./viewStory.model");

//import model
const User = require("../user/model");
const Story = require("../hostStory/hostStory.model");

//create viewUser of story
exports.viewUser = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.storyId) {
      return res.status(200).json({ status: false, message: "Invalid details!!" });
    }

    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    const story = await Story.findById(req.query.storyId);
    if (!story) {
      return res.status(200).json({ status: false, message: "Story does not found!!" });
    }

    const viewUserExist = await ViewStory.findOne({
      userId: user._id,
      storyId: story._id,
    });

    if (viewUserExist) {
      return res.status(200).json({
        status: true,
        message: "viewUser already exists.",
      });
    }

    const viewStory = new ViewStory();

    viewStory.userId = user._id;
    viewStory.storyId = story._id;
    viewStory.expiration_date = story.expiration_date;

    await viewStory.save();

    story.view += 1;
    await story.save();

    return res.status(200).json({ status: true, message: "Success", viewStory });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
