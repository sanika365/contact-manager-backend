const mongoose = require("mongoose");
const { Schema } = mongoose;

const ContactSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    contactName: {
      type: String,
      required:[true," please enter contactname"]
    },
    nickname: {
      type: String,
      required: [true,"please add a nickname"]
    },
    phone: {
      type: String,
      required: [true, "please add the phone number"],
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("contactModel", ContactSchema);
