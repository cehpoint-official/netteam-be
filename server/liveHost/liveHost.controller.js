const Host = require('../host/host.model');
const User = require('../user/model');
const Setting = require('../setting/setting.model');
const LiveStreamingHistory = require('../liveStreamingHistory/liveStreamingHistory.model');
const LiveHost = require('./liveHost.model');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

//FCM node
var FCM = require('fcm-node');
var config = require('../../config');
var fcm = new FCM(config.SERVER_KEY);

//live host
exports.hostIsLive = async (req, res) => {
  try {
    if (req.body.hostId) {
      const host = await Host.findById(req.body.hostId);

      if (!host) {
        return res
          .status(200)
          .json({ status: false, message: 'host does not found!!' });
      }

      const setting = await Setting.findOne({});

      //console.log("-----setting---------", setting);

      if (!setting) {
        return res
          .status(200)
          .json({ status: false, message: 'Setting does not found!!' });
      }

      const liveStreamingHistory = new LiveStreamingHistory();

      //Generate Token
      const role = RtcRole.PUBLISHER;
      const uid = req.body.agoraUID ? req.body.agoraUID : 0;
      const expirationTimeInSeconds = 24 * 3600;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      const token = await RtcTokenBuilder.buildTokenWithUid(
        setting.agoraKey,
        setting.agoraCertificate,
        liveStreamingHistory._id.toString(),
        uid,
        role,
        privilegeExpiredTs
      );

      //console.log("-----token", token);

      host.isOnline = true;
      host.isBusy = true;
      host.isLive = true;
      host.token = token;
      host.channel = liveStreamingHistory._id.toString();
      host.liveStreamingId = liveStreamingHistory._id.toString();
      host.agoraUid = req.body.agoraUID ? req.body.agoraUID : 0;

      await host.save();

      //Live Host History In LiveStreaming History
      liveStreamingHistory.hostId = host._id;
      (liveStreamingHistory.startTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
      })),
        await liveStreamingHistory.save();

      //If Live Host So Old hostWise Data Save Else Create New host Save In Host
      const liveHost = await LiveHost.findOne({ hostId: host._id });

      const createLiveHost = new LiveHost();

      let liveHostData;

      if (liveHost) {
        liveHost.liveStreamingId = liveStreamingHistory._id;
        liveHost.agoraUID = req.body.agoraUID;
        liveHostData = await LiveHostFunction(liveHost, host);
      } else {
        createLiveHost.liveStreamingId = liveStreamingHistory._id;
        createLiveHost.agoraUID = req.body.agoraUID;
        liveHostData = await LiveHostFunction(createLiveHost, host);
      }

      let matchQuery = {};

      if (liveHost) {
        matchQuery = { $match: { _id: { $eq: liveHost._id } } };
      } else {
        matchQuery = { $match: { _id: { $eq: createLiveHost._id } } };
      }

      const liveHost_ = await LiveHost.aggregate([matchQuery]);

      const user = await User.find({
        isBlock: false,
        isHost: false,
      }).distinct('fcm_token');
      //console.log("notification to users ---------------", user);

      const payload = {
        registration_ids: user,
        notification: {
          title: `${host.name} is live now`,
          body: 'click and watch now!!',
          image: host.profileImage,
        },
        data: {
          _id: host._id,
          image: host.image,
          profileImage: host.profileImage,
          isLive: host.isLive,
          token: host.token,
          channel: host.channel,
          level: host.level,
          name: host.name,
          age: host.age,
          callCharge: host.callCharge,
          isOnline: host.isOnline,
          coin: host.coin,
          liveStreamingId: liveHostData.liveStreamingId,
          view: liveHostData.view,
          favorite: false,
          isBusy: host.isBusy,
          type: 'LIVE',
        },
      };

      await fcm.send(payload, function (err, response) {
        if (err) {
          console.log('Something has gone wrong!!', err);
        } else {
          console.log('Notification sent successfully:', response);
        }
      });

      //console.log("-------------------liveHost_--------------", liveHost_);

      return res.status(200).json({
        status: true,
        message: 'Success!!',
        liveHost: liveHost_[0],
      });
    } else {
      return res.status(500).json({
        status: false,
        message: 'Invalid details!!',
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error!!',
    });
  }
};

const LiveHostFunction = async (host, data) => {
  host.name = data.name;
  host.country = data.country;
  host.image = data.image;
  host.album = data.album;
  host.token = data.token;
  host.channel = data.channel;
  host.coin = data.coin;
  host.hostId = data._id;
  host.dob = data.dob;

  await host.save();

  return host;
};

//get live host list
exports.getLiveHostList = async (req, res) => {
  try {
    
    const host = await LiveHost.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          _id: 1,
          hostId: 1,
          name: 1,
          country: 1,
          image: 1,
          token: 1,
          channel: 1,
          coin: 1,
          dob: 1,
          agoraUID: 1,
          liveStreamingId: 1,
        },
      },
      {
        $addFields: {
          isFake: false,
        },
      },
    ]);


  
    if (host.length === 0) {
      return res
        .status(200)
        .json({ status: false, message: 'No data found!!' });
    } else {
      return res.status(200).json({
        status: true,
        message: 'Success!!',
        host: host,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error!!',
    });
  }
};
