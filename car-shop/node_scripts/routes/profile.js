const express = require("express");
const path = require("path");
const firebase = require(path.join("./..", "firebase"));
const router = express.Router();
router.use(express.json());

//TODO: make global scope variables for auth() and rootRef

// Middleware to check if user is logged out, and allow if so
router.use("/signup", (req, res, next) => {
  if (firebase.auth().currentUser){
    res.sendStatus(400)
  } else {
    next();
  }
});

// Middleware to check if user is logged in, and allow if so
router.use("/reset-password", (req, res, next) => {
  if (firebase.auth().currentUser){
    next();
  } else {
    res.sendStatus(400)
  }
});


router.get("/", (req, res) => {
  if (firebase.auth().currentUser){
    let user = firebase.auth().currentUser;
    res.send({"result": true, "user": user});
  } else {
    res.send({"result": false});
  }
});

router
  .route("/signup")
  .post((req, res) => {

    let name = "";

    firebase.database().ref("carshop/employees").orderByChild("id").equalTo(parseInt(req.body.employee_id)).once("value").then(snapshot => {
      snapshot.val().forEach(employee => {
        name = employee.name;
      });
    }).then(() => {
      firebase.auth().createUserWithEmailAndPassword(req.body.username, req.body.password).then((userCredential) => {

        let user = userCredential.user;
        let userProfile = {
          uid: user.uid,
          name: name,
          email: user.email,
          employee_id: req.body.employee_id
        };

        // Create a child in db at users, attaching the relevant information
        // This information can then be used at profile page
        // Every firebase user has a unique UID, which is attached as well
        firebase.database().ref("carshop/users").push(userProfile);

        res.status(200);
        res.send(userProfile);

      });
    }).catch((error) => {
      let errorCode = error.code;
      let errorMessage = error.message;
      res.status(400);
      res.send(error);
    })

  });

router
  .route("/login")
  .post((req, res) => {
    firebase.auth().signInWithEmailAndPassword(req.body.username, req.body.password).then((userCredential) => {
        // Signed in
        //let user = userCredential.user;
        //res.status(200);
        //res.send(user);
        return userCredential.user;
      }).then((user) => firebase.database().ref("carshop/users").orderByChild("uid").equalTo(user.uid).once("value").then(snapshot => {
        // In this callback we are returning the user profile to the client
        // If the program reached this point, there will be exactly 1 user with the UID (not 0, because the login was successful)
        for(let index in snapshot.val()){
          res.status(200);
          res.send(snapshot.val()[index]);
        }
      }).catch((error) => {
        let errorCode = error.code;
        let errorMessage = error.message;
        console.log(errorMessage + errorCode);
        res.status(400);
        res.send(error);
      }));
  });

router
  .route("/logout")
  .post((req, res) => {
    firebase.auth().signOut().then(() => {
      res.sendStatus(200);
    }).catch((error) => {
      res.status(400);
      res.send(error);
    });
  });

router.get("/reset-password", (req, res) => {
  let auth = firebase.auth();
  let emailAddress = "user@example.com";

  firebase.auth().sendPasswordResetEmail(firebase.auth().currentUser.email).then(function() {
    res.sendStatus(200);
  }).catch((error) => {
    res.status(400);
    res.send(error);
  });
});

module.exports = router;
