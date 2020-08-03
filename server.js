const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const stripeKeys = require("./config/keys");

//mongoose setup -- Works
try {
  mongoose.connect(
    "mongodb+srv://username:password1234@cluster0-yoa7a.mongodb.net/signUp?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  );
} catch (error) {
  console.log(error);
}
mongoose.connection.on("open", (error) => {
  console.log("Mongoose connection opened");
});
mongoose.connection.on("error", (error) => {
  console.log(error);
});
//create mongoose schema- signUp
const signUpSchema = new mongoose.Schema({
  username: { type: String, required: true, lowercase: true, trim: true },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  date: { type: Date, default: Date.now() },
});
const signUp = mongoose.model("signUp", signUpSchema);
//create mongoose schema - contact
const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  message: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now() },
});
const contact = mongoose.model("contact", contactSchema);

// Serve static files
app.use(express.static(__dirname + "/public"));

//middlewares -- dont do bodyParser.urlencoded({extended: true}) according to a stackoverflow comment that isn't that relevant
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//sign up form handling
app.post("/signup", async function (req, res) {
  const username = req.body.username;
  const email = req.body.email;

  //function to create user
  async function createUser() {
    await signUp.create({ username: username, email: email }, function (
      err,
      doc
    ) {
      if (err) {
        console.error(err);
      } else {
        res.redirect("/");
        doc.save();
      }
    });
  }
  //create user if it doesnt exist
  await signUp.find({ email: email }, function (err, docs) {
    if (docs.length) {
      console.log("emails found");
    } else {
      createUser();
      console.log("user saved");
    }
  });
});
app.post("/contactForm", function (req, res) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const phone = req.body.phone;
  const message = req.body.message;

  contact.create(
    {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      message: message,
    },
    function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        doc.save();
      }
    }
  );
});
{
  /*
app.post("/charge", (req, res) => {
  try {
    stripe.customers
      .create({
        name: req.body.name,
        email: req.body.email,
        source: req.body.stripeToken,
      })
      .then((customer) =>
        stripe.charges.create({
          amount: req.body.amount * 100,
          currency: "usd",
          customer: customer.id,
        })
      )
      .then(() => res.render("public/completed.html"))
      .catch((err) => console.log(err));
  } catch (err) {
    res.send(err);
  }
});
*/
}
app.post("/charge", async function (req, res) {
  // https://stripe.com/docs/payments/accept-a-payment-charges
  const stripe = require("stripe")(stripeKeys.STRIPE_SECRET_KEY);

  // Token is created using Stripe Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const token = request.body.stripeToken; // Using Express

  await stripe.charges.create({
    amount: 159,
    currency: "aud",
    description: "Example charge",
    source: token,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, function () {
  console.log("Server is listening on port:", PORT);
});
