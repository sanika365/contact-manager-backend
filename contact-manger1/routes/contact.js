const express = require("express");
const router = express.Router();
var fetchuser = require("../middleware/fetchUser");

const { body, validationResult } = require("express-validator");
const contactModel = require("../models/contactModel");

// Route 1-Get all notes using: GET"/api/contact/fetchallcontact" login requried
router.get("/fetchallcontacts", fetchuser, async (req, res) => {
  try {
    const contacts = await contactModel.find({ user: req.user.id });
    res.json(contacts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occured");
  }
});
// Route 2- add new note using POST: "/api/contact/addcontact" login requried
router.post(
  "/addcontact",
  fetchuser,
  [
    body("phone", "Enter a valid name").isLength({ min: 6 }),
    body("nickname", "enter valid name").isLength({
      min: 3,
    }),
  ],
  async (req, res) => {
    try {
      const { contactName,nickname, phone } = req.body;

      // If there are errors, return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const contact = new contactModel({
        contactName,
        nickname,
        
        phone,
        user: req.user.id,
      });
      const savedcontactModel = await contact.save();

      res.json(savedcontactModel);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);
//Route3 : Update an existing Note using:PUT "api/contact/updatecontact". login required
router.put("/updatecontact/:id", fetchuser, async (req, res) => {
  const { contactName, nickname, phone } = req.body;
  //create newNote object
  try {
    const newcontactModel = {};
    if (contactName) {
      newcontactModel.contactName = contactName;
    }
    if (nickname) {
      newcontactModel.nickname = nickname;
    }
    if (phone) {
      newcontactModel.phone = phone;
    }
    //find the note to be updated and update it
    let contact = await contactModel.findById(req.params.id);
    if (!contact) {
      res.status(404).send("not found");
    }
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).send("not allowed");
    }
    contact = await contactModel.findByIdAndUpdate(
      req.params.id,
      { $set: newcontactModel },
      { new: true }
    );
    res.json({ contact });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
//Route4 : Delete an existing Note using:DELETE "api/contact/deletecontact". login required
router.delete("/deletecontact/:id", fetchuser, async (req, res) => {
  try {
    //find the note to be deleted and delete it
    let contact = await contactModel.findById(req.params.id);
    if (!contact) {
      res.status(404).send("not found");
    }

    //Allow deletion only if user owns this note
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).send("not allowed");
    }
    contact = await contactModel.findByIdAndDelete(req.params.id);
    res.json({ sucess: "contact has been deleted", contact: contact });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
