const express = require("express");
const route = express.Router();
const path = require("path");

//Admin Route
const adminRouter = require("./server/admin/admin.route");
route.use("/admin", adminRouter);

//User Route
const userRouter = require("./server/user/route");
route.use("/user", userRouter);

//User Route
const redeemRouter = require("./server/redeem/redeem.route");
route.use("/redeem", redeemRouter);

//Request Route
const requestRouter = require("./server/request/request.route");
route.use("/request", requestRouter);

//Host Route
const hostRouter = require("./server/host/host.route");
route.use("/host", hostRouter);

//Gift Category Route
const giftCategoryRouter = require("./server/giftCategory/giftCategory.route");
route.use("/giftCategory", giftCategoryRouter);

//Gift  Route
const giftRouter = require("./server/gift/gift.route");
route.use("/gift", giftRouter);

//Banner  Route
const bannerRouter = require("./server/banner/banner.route");
route.use("/banner", bannerRouter);

//Coin Plan  Route
const coinPlanRouter = require("./server/coinPlan/coinPlan.route");
route.use("/coinPlan", coinPlanRouter);

//Setting  Route
const settingRouter = require("./server/setting/setting.route");
route.use("/setting", settingRouter);

//Live Host  Route
const liveHostRouter = require("./server/liveHost/liveHost.route");
route.use("/liveHost", liveHostRouter);

//Complaint Route
const ComplaintRoute = require("./server/complaint/complaint.route");
route.use("/complaint", ComplaintRoute);

//Story Route
const StoryRoute = require("./server/hostStory/hostStory.route");
route.use("/story", StoryRoute);

//ViewStory Route
const ViewStoryRoute = require("./server/viewStory/viewStory.route");
route.use("/ViewStory", ViewStoryRoute);

//chat Route
const ChatRoute = require("./server/chat/chat.route");
route.use("/chat", ChatRoute);

//ChatTopic Route
const ChatTopicRoute = require("./server/chatTopic/chatTopic.route");
route.use("/chatTopic", ChatTopicRoute);

//Block Route
const BlockRoute = require("./server/block/block.route");
route.use("/block", BlockRoute);

//Dashboard Route
const DashboardRoute = require("./server/dashboard/dashboard.route");
route.use("/dashboard", DashboardRoute);

//History Route
const HostStoryRoute = require("./server/history/history.route");
route.use("/history", HostStoryRoute);

//History Route
const rattingRoute = require("./server/ratting/ratting.route");
route.use("/ratting", rattingRoute);

//Random Route
const RandomRoute = require("./server/random/random.route");
route.use("/random", RandomRoute);

//RandomMatch History Route
const RandomMatchRoute = require("./server/randomHistory/randomHistory.route");
route.use("/randomMatchHistory", RandomMatchRoute);

//stickerRoute Route
const StickerRoute = require("./server/sticker/sticker.route");
route.use("/sticker", StickerRoute);

//flagRoute Route
const FlagRoute = require("./server/flag/flag.route");
route.use("/flag", FlagRoute);

//Notification route
const NotificationRoute = require("./server/notification/notification.route");
route.use("/notification", NotificationRoute);

//Withdraw route
const WithdrawRoute = require("./server/withdraw/withdraw.route");
route.use("/withdraw", WithdrawRoute);

//Login route
const LoginRoute = require("./server/login/login.route");
route.use("/", LoginRoute);

module.exports = route;