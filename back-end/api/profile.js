const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const auth = require("../middleware/auth");
const Profile = require("../models/Profile");
const Post = require("../models/Post");
const request = require("request");
const config = require("config");

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res
        .status(404)
        .json({ msg: "There is no profile for this user." });
    }
    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
});

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);

    console.log(profile);

    if (!profile) {
      res.status(400).json({ msg: "No profile exists with the given user Id" });
    }

    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.post(
  "/",
  // array of middlewares
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "Skills is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    var skillsToAdd = skills.split(",");
    if (skillsToAdd) {
      profileFields.skills = skillsToAdd.map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      var profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
      } else {
        profile = new Profile(profileFields);
        await profile.save();
      }

      return res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error });
    }
  }
);

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required")
        .not()
        .isEmpty(),
      check("company", "Company is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, from, to, current, description } = req.body;
    try {
      var profile = await Profile.findOne({ user: req.user.id });

      if (!profile) {
        res.status(400).json({ msg: "No Profile to add experience to." });
      }

      var newExp = {
        title,
        company,
        from,
        to,
        current,
        description
      };

      profile.experience.unshift(newExp);
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(500).json("Unable to add experience");
    }
  }
);

router.delete("/", auth, async (req, res) => {
  try {
    await Post.deleteMany({ user: req.user.id });
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json("Profile Deleted successfully");
  } catch (error) {
    console.log(error);
    res.json("Could not delete profile.");
  }
});

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    var profile = await Profile.findOne({ user: req.user.id });

    var indexToRemove = profile.experience
      .map(item => item._id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(indexToRemove, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).json("Could not delete experience");
  }
});

router.put(
  "/education",
  [
    auth,
    [
      check("degree", "Degree is required")
        .not()
        .isEmpty(),
      check("fieldofstudy", "Field of study is required")
        .not()
        .isEmpty(),
      check("from", "From is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;
    try {
      var profile = await Profile.findOne({ user: req.user.id });

      if (!profile) {
        res.status(400).json({ msg: "No Profile to add education to." });
      }

      var newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      };

      profile.education.unshift(newEdu);
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(500).json("Unable to add education");
    }
  }
);

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    var profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      res
        .status(400)
        .send({ msg: "No profile found to delete education from." });
    }

    const indexToRemove = profile.education
      .map(item => item._id)
      .indexOf(req.params.edu_id);

    profile.education.splice(indexToRemove, 1);

    await profile.save();

    res.send(profile);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Internal Server Error." });
  }
});

// @route GET api/profile/github/:username
// @desc Get github user repos
// @access Private

router.get("/github/:username", auth, async (req, res) => {
  try {
    var options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc
      &client_id=${config.get("gitHubClientId")}&client_secret=${config.get(
        "gitHubClientSecret"
      )}`,
      method: "GET",
      headers: { "user-agent": "node-js" }
    };

    request(options, (error, response, body) => {
      if (error) console.log(error);

      if (response.statusCode !== 200) {
        console.log(response);
        res.status(404).json({ msg: "No GitHub Repos Found" });
      }

      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Cannot get github repos" });
  }
});

module.exports = router;
